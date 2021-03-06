const app = require('express')();
const bodyParser = require('body-parser');
const logger = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NodeInstance } = require('./ussd-menu');
const Store = require('./store');
const port = process.env.PORT || 3030;
const request = require('request');
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

const stateKeeper = {
  node: null,
  ticketOrder: Store.ticketOrder
};
const resetTicketOrder = currentStateKeeper => {
  stateKeeper.ticketOrder = {
    match: {},
    stand: {},
    quantity: 1,
    cost: 5,
    bank: null,
    msisdn: null
  };
  return;
};

app.post('*', (req, res) => {
  stateKeeper.node = new NodeInstance(Store.matchSelectionNode(), null);
  stateKeeper.ticketOrder.msisdn = req.body.msisdn;
  const { node, ticketOrder } = stateKeeper;
  const { currentTemplate } = node;
  const prompt = currentTemplate.getPromptText(ticketOrder) + node.getOptions();
  const response = {
    prompt,
    end: false
  };
  res.send(response);
});

app.put('*', (req, res) => {
  const { userInput, msisdn } = req.body;
  const { node, ticketOrder } = stateKeeper;
  if (!ticketOrder.msisdn) ticketOrder.msisdn = msisdn || '';
  const selectedOption = node.processUserInput(userInput - 1);
  node.updateState(stateKeeper);
  let { nextNodeTemplate } = selectedOption.option;
  nextNodeTemplate = typeof nextNodeTemplate === 'function' ? nextNodeTemplate() : nextNodeTemplate;
  const nextInstance = new NodeInstance(nextNodeTemplate, node);
  const { currentTemplate, getOptions } = nextInstance;
  const prompt = `${currentTemplate.getPromptText(ticketOrder)} ${getOptions()}`;
  const { options } = currentTemplate;
  const endSession = options.length === 0;
  if (endSession) {
    // Send the sms here and then reset the ticket Order Object.
    const { match, stand, bank, cost, msisdn } = ticketOrder;
    const { bankName, branchCode, accountNumber } = bank;
    const to = msisdn;
    const text =
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
      'Enjoy the game :)';
    sendSMS(to, text);
    resetTicketOrder(stateKeeper);
  }
  const response = {
    prompt,
    end: endSession
  };
  stateKeeper.node = nextInstance;

  res.send(response);
});

const sendSMS = (to, text) => {
  const request = require('request');
  const sendRequest = {
    Messages: [{ Content: text, Destination: to }]
  };

  request.post(
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization:
          'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJsb2dpbklkIjoiMjkxOTA4IiwiaXNzIjoiU21zUG9ydGFsU2VjdXJpdHlBcGkiLCJhdWQiOiJBbGwiLCJleHAiOjE1MzIxNzE3MTQsIm5iZiI6MTUzMjA4NTMxNH0.E250wz09awcUYQR9s-r88qcpOyjthk94xSgv55djbsk'
      },
      url: 'https://rest.smsportal.com/v1/bulkmessages',
      json: true,
      body: sendRequest
    },
    (error, response, body) => console.log('Response: ', body)
  );
};
app.listen(port, () => console.log(`Server running on port ${port}`));
