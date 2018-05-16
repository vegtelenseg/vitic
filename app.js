const app = require('express')();
const bodyParser = require('body-parser');
const logger = require('morgan');
const cors = require('cors');
const { NodeInstance, Option, NodeTpl } = require('./ussd-menu');
const port = process.env.PORT || 3030;

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.options('*', cors());

app.get('*', (req, res) => {
  res.send('USSD MENU');
});

// Order Options
const orderOptions = [
  {
    option: new Option('R200', null)
  },
  {
    option: new Option('R400', null)
  }
];
const orderSelectionNode = new NodeTpl(
  '_CONFIRM_ORDER_',
  orderOptions,
  tickeOrder => `Ticket costs ${ticketOrder.cost}. Buy Ticket?`,
  (ticketOrder, selection) =>
    (ticketOrder.cost = selection.option.optionDisplayText)
);

// Stand Options
const standOptions = [
  {
    option: new Option('Grand Stand', orderSelectionNode)
  },
  {
    option: new Option('Side Stand', orderSelectionNode)
  }
];
const standSelectionNode = new NodeTpl(
  '_SELECT_STAND_',
  standOptions,
  tickeOrder => `Watch ${ticketOrder.match} from:`,
  (ticketOrder, selection) =>
    (ticketOrder.stand = selection.option.optionDisplayText)
);

// Match Options
const matchOptions = [
  {
    option: new Option('CHI vs PIR', standSelectionNode)
  },
  {
    option: new Option('SUN vs FCB', standSelectionNode)
  },
  {
    option: new Option('FSS vs PLT', standSelectionNode)
  }
];
const matchSelectionNode = new NodeTpl(
  '_SELECT_MATCH_',
  matchOptions,
  null,
  (ticketOrder, selection) =>
    (ticketOrder.match = selection.option.optionDisplayText)
);

const ticketOrder = {
  match: '',
  stand: '',
  quantity: 1,
  cost: 5

}
const stateKeeper = {
  node: null,
  ticketOrder
};

app.post('*', (req, res) => {
  stateKeeper.node = new NodeInstance(matchSelectionNode, null);
  const { node } = stateKeeper;
  const prompt = `What to watch?
  1. ${node.currTpl.getOption(0).option.optionDisplayText}
  2. ${node.currTpl.getOption(1).option.optionDisplayText}
  3. ${node.currTpl.getOption(2).option.optionDisplayText}`;
  const response = {
    prompt,
    end: false
  };
  res.send(response);
});

const getOptions = nodeInstance => {
  const { options } = nodeInstance.currTpl;
  return options.map((option, idx) => {
    return ++idx + '. ' + option.option.optionDisplayText + '\n';
  });
};
app.put('*', (req, res) => {
  const { userInput } = req.body;
  const selectedOption = stateKeeper.node.processUserInput(userInput - 1);
  console.log("Selected option: ", selectedOption)
  stateKeeper.node.updateState(stateKeeper);
  const nextInstance = new NodeInstance(
    selectedOption.option.nextNodeTpl,
    stateKeeper.node
  );
  const prompt = `${nextInstance.currTpl.getPromptText(stateKeeper.ticketOrder)}
  ${getOptions(nextInstance)}`;
  stateKeeper.node = nextInstance;
  const response = {
    prompt,
    end: false
  };
  res.send(response);
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
