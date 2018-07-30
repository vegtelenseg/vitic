const app = require('express')();
const bodyParser = require('body-parser');
const logger = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NodeInstance } = require('./ussd-menu');
const Store = require('./store');
const port = process.env.PORT || 3030;

app.use(
  helmet({
    noCache: true,
    referrerPolicy: true
  })
);

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.options('*', cors());

app.get('*', (req, res) => {
  res.send('USSD MENU');
});

const ticketOrderStateKeeper = {
  node: null,
  ticketOrder: Store.ticketOrder
};
const resetTicketOrder = () => {
  ticketOrderStateKeeper.ticketOrder = {
    match: Object.create(null),
    stand: Object.create(null),
    quantity: 1,
    cost: 5,
    bank: null,
    msisdn: null
  };
  return;
};

app.post('*', (req, res) => {
  ticketOrderStateKeeper.node = new NodeInstance(Store.matchSelectionNode(), null);
  ticketOrderStateKeeper.ticketOrder.msisdn = req.body.msisdn || null;
  const { node, ticketOrder } = ticketOrderStateKeeper;
  const { currentTemplate } = node;
  const prompt = currentTemplate.getPromptText(ticketOrder) + node.getOptions();
  const response = {
    prompt,
    end: false
  };
  res.send(response);
});

app.put('*', (req, res) => {
  const { userInput } = req.body;
  const { node, ticketOrder } = ticketOrderStateKeeper;
  const selectedOption = node.processUserInput(userInput - 1);
  node.updateState(ticketOrderStateKeeper);
  let { nextNodeTemplate } = selectedOption.option;
  nextNodeTemplate = typeof nextNodeTemplate === 'function' ? nextNodeTemplate() : nextNodeTemplate;

  const nextNodeInstance = new NodeInstance(nextNodeTemplate, node);
  const endSession = nextNodeInstance.currentTemplate.options.length === 0;
  if (endSession) {
    // Send the sms here and then reset the ticket Order Object.
    const immutableTicketOrder = Object.freeze(ticketOrder);
    const text = buildTextMessage(immutableTicketOrder);
    const isMessageSentSuccessfully = sendSMS(ticketOrder.msisdn, text);
    if (isMessageSentSuccessfully) {
      resetTicketOrder(ticketOrderStateKeeper);
    }
  }
  const prompt = `${nextNodeInstance.currentTemplate.getPromptText(
    ticketOrder
  )} ${nextNodeInstance.getOptions()}`;
  const response = {
    prompt,
    end: endSession
  };
  ticketOrderStateKeeper.node = nextNodeInstance;

  res.send(response);
});

const sendSMS = (destination, content) => {
  if (!destination || !content) {
    throw Error('Receipient or Message Content Not Supplied.');
  }
  const request = require('request');
  const CLIENT_ID = '467bab7d-fe04-4f87-a958-d81182b36d7';
  const SECRET_KEY = 'V6YDBBrcdGJ1hvfGWN9uy1o20c6flDJi';
  const str = `${CLIENT_ID}:${SECRET_KEY}`;
  const authHeader = new Buffer(str, 'ascii').toString('base64');
  let authToken = null;
  const getOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      authorization: `BASIC ${authHeader}`
    },
    url: 'https://rest.mymobileapi.com/v1/Authentication',
    json: true
  };
  request(getOptions, (error, response, body) => {
    if (error) {
      throw Error(`Error Posting Data. Error: ${error}`)
    }
    console.log("Res: ", response)
    authToken = body;
    console.log('Auth Token: ', body);
    return authToken;
  });
  const postOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`
    },
    url: 'https://rest.smsportal.com/v1/bulkmessages',
    json: true,
    body: {
      messages: [{ content, destination }]
    }
  };
  request(postOptions, (error, response, body) => console.log('Response: ', body));
};

const buildTextMessage = ticketOrderDetails => {
  const { match, stand, cost } = ticketOrderDetails;
  const { bankName, branchCode, accountNumber } = ticketOrderDetails.bank;
  return (
    `Thanks for purchasing the ${match.name} game ticket. You will be watching from the ${
      stand.optionDisplayText
    }.` +
    '\n' +
    `To activate your ticket. Please make a deposit of R${cost} to the following bank account.` +
    '\n\n' +
    `Bank Name: ${bankName}` +
    '\n' +
    `Branch Code: ${branchCode}` +
    '\n' +
    `Account No.: ${accountNumber}` +
    '\n' +
    'Reference: 3hfuw68Rgt' +
    '\n\n' +
    'Enjoy the game :)'
  );
};

app.listen(port, () => console.log(`Server running on port ${port}`));
