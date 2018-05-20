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

app.post('*', (req, res) => {
  stateKeeper.node = new NodeInstance(Store.matchSelectionNode(), null);
  const { node, ticketOrder } = stateKeeper;
  const prompt = node.currentTemplate.getPromptText(ticketOrder) + node.getOptions();
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
  const { optionDisplayText, nextNodeTemplate } = selectedOption.option;
  const nextTemplateToRender = optionDisplayText === 'Back' ? nextNodeTemplate() : nextNodeTemplate;
  const nextInstance = new NodeInstance(nextTemplateToRender, node);
  const prompt = `${nextInstance.currentTemplate.getPromptText(
    ticketOrder
  )} ${nextInstance.getOptions()}`;
  const response = {
    prompt,
    end: nextInstance.currentTemplate.options.length <= 0 ? true : false
  };
  stateKeeper.node = nextInstance;
  res.send(response);
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
