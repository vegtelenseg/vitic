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
  ticketOrder: Store.ticketOrder,
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
	console.log("Req Body: ", req.body)
  if (!ticketOrder.msisdn) ticketOrder.msisdn = req.body.msisdn || '';
  const selectedOption = node.processUserInput(userInput - 1);
  node.updateState(stateKeeper);
  let { nextNodeTemplate } = selectedOption.option;
  nextNodeTemplate = typeof nextNodeTemplate === 'function' ? nextNodeTemplate() : nextNodeTemplate;
  const nextInstance = new NodeInstance(nextNodeTemplate, node);
  const { currentTemplate, getOptions } = nextInstance;
  const prompt = `${currentTemplate.getPromptText(ticketOrder)} ${getOptions()}`;
  console.log(currentTemplate.name + ': ' + prompt.length + '\n');
  const { options } = currentTemplate;
  const endSession = options.length === 0;
  if (endSession) {
    console.log('Order Preview: ', ticketOrder);
    // Send the sms here and then reset the ticket Order Object
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
