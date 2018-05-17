const app = require('express')();
const bodyParser = require('body-parser');
const logger = require('morgan');
const cors = require('cors');
const {
  NodeInstance,
  Option,
  StandOption,
  NodeTemplate
} = require('./ussd-menu');
const port = process.env.PORT || 3030;

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.options('*', cors());

app.get('*', (req, res) => {
  res.send('USSD MENU');
});

const ticketOrder = {
  match: '',
  stand: {},
  quantity: 1,
  cost: 5
};

const stateKeeper = {
  node: null,
  ticketOrder
};
const endSessionSelectionNode = new NodeTemplate(
  '_END_SESSION_',
  [],
  ticketOrder => `Ticket for ${ticketOrder.match}, watching from the ${ticketOrder.stand.optionDisplayText} has been purchased successfully. You will receive an sms.`,
  null
);

// Order Options
const orderOptions = [
  {
    option: new Option('Confirm', endSessionSelectionNode)
  },
  {
    option: new Option('Back', stateKeeper.node)
  }
];

const orderSelectionNode = new NodeTemplate(
  '_CONFIRM_ORDER_',
  orderOptions,
  tickeOrder =>
    `${tickeOrder.stand.optionDisplayText} ticket costs R${
      ticketOrder.stand.standPrice
    }. Buy Ticket?`,
  null
);

// Stand Options
const standOptions = [
  {
    option: new StandOption('Grand Stand', orderSelectionNode, 400)
  },
  {
    option: new StandOption('Side Stand', orderSelectionNode, 200)
  }
];

const standSelectionNode = new NodeTemplate(
  '_SELECT_STAND_',
  standOptions,
  tickeOrder => `Watch ${ticketOrder.match} from:`,
  (ticketOrder, selection) => (ticketOrder.stand = selection.option)
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
const matchSelectionNode = new NodeTemplate(
  '_SELECT_MATCH_',
  matchOptions,
  null,
  (ticketOrder, selection) =>
    (ticketOrder.match = selection.option.optionDisplayText)
);

app.post('*', (req, res) => {
  stateKeeper.node = new NodeInstance(matchSelectionNode, null);
  const { node } = stateKeeper;
  const prompt = `What to watch?
  1. ${node.currentTemplate.getOption(0).option.optionDisplayText}
  2. ${node.currentTemplate.getOption(1).option.optionDisplayText}
  3. ${node.currentTemplate.getOption(2).option.optionDisplayText}`;
  const response = {
    prompt,
    end: false
  };
  res.send(response);
});

const getOptions = nodeInstance => {
  const { options } = nodeInstance.currentTemplate;
  return options.map((option, idx) => {
    return ++idx + '. ' + option.option.optionDisplayText + '\n';
  });
};
app.put('*', (req, res) => {
  const { userInput } = req.body;
  const selectedOption = stateKeeper.node.processUserInput(userInput - 1);
  stateKeeper.node.updateState(stateKeeper);
  const nextInstance = new NodeInstance(
    selectedOption.option.nextNodeTemplate,
    stateKeeper.node
  );
  const prompt = `${nextInstance.currentTemplate.getPromptText(
    stateKeeper.ticketOrder
  )}
  ${getOptions(nextInstance)}`;
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
