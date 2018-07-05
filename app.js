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
  console.log("The MSISDN: ", req.body);
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
  console.log("PUT MSIDN: ", stateKeeper.ticketOrder.msisdn);
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
    const Nexmo = require('nexmo');
    const nexmo = new Nexmo({
      apiKey: '70026f9d',
      apiSecret: 'HDFl1QxjxGSDLrLK'
    });
 //   const cellphoneNumber = msisdn.replace(msisdn.charAt(0), '27');
    const from = '27423148669317';
    console.log("Mmber: ", stateKeeper.ticketOrder.msisdn)
    const to = stateKeeper.ticketOrder.msisdn;
    console.log("Number: ", to);
    const { match, stand, bank, cost } = ticketOrder;
    const text =
      `Thanks for purchasing the ${match.name} game ticket. You will be watching from the ${
        stand.optionDisplayText
      }.` +
      '\n' +
      `To activate your ticket. Please make a deposit of R${cost} to the following bank account.` +
      '\n\n' +
      `Bank Name: ${bank.bankName}` +
      '\n' +
      `Branch Code: ${bank.branchCode}` +
      '\n' +
      `Account No.: ${bank.accountNumber}` +
      '\n' +
      'Reference: 3hfuw68Rgt' +
      '\n\n' +
      'Enjoy the game :)';
    console.log('Text:\n', text);
    nexmo.message.sendSms(from, to, text);
    resetTicketOrder(stateKeeper);
  }
  const response = {
    prompt,
    end: endSession
  };
  stateKeeper.node = nextInstance;

  res.send(response);
});

app.listen(port, () => console.log(`Server running on port ${port}`));
