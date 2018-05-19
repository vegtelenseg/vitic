const app = require('express')();
const bodyParser = require('body-parser');
const logger = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NodeInstance } = require('./ussd-menu');
const {
  endSessionSelectionNode,
  orderSelectionNode,
  standSelectionNode,
  matchSelectionNode,
  ticketOrder
} = require('./store');
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
  ticketOrder
};

const renderOptions = options =>
  options.map((option, idx) => idx + 1 + '. ' + options[idx].option.optionDisplayText + '\n');

app.post('*', (req, res) => {
  stateKeeper.node = new NodeInstance(matchSelectionNode, null);
  const { node } = stateKeeper;
  const prompt =
    node.currentTemplate.getPromptText(ticketOrder) + renderOptions(node.currentTemplate.options);
  const response = {
    prompt,
    end: false
  };
  res.send(response);
});

app.put('*', (req, res) => {
  const { userInput } = req.body;
  const { node, ticketOrder } = stateKeeper;
  const selectedOption = node.processUserInput(userInput - 1);
  node.updateState(stateKeeper);
  const nextInstance = new NodeInstance(selectedOption.option.nextNodeTemplate, node);
  nextInstance.setBackOption(node);
  const prompt = `${nextInstance.currentTemplate.getPromptText(ticketOrder)}
  ${nextInstance.getOptions(nextInstance)}`;
  stateKeeper.node = nextInstance;
  const response = {
    prompt,
    end: nextInstance.currentTemplate.options.length <= 0 ? true : false
  };
  res.send(response);
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
