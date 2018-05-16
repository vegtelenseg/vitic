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
const orderSelectionNode = new NodeTpl('_CONFIRM_ORDER_', orderOptions);

// Stand Options
const standOptions = [
  {
    option: new Option('Grand Stand', orderSelectionNode)
  },
  {
    option: new Option('Side Stand', orderSelectionNode)
  }
];
const standSelectionNode = new NodeTpl('_SELECT_STAND_', standOptions);

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
const matchSelectionNode = new NodeTpl('_SELECT_MATCH_', matchOptions);

const landingnode = new NodeInstance(matchSelectionNode, null);

app.post('*', (req, res) => {
  const prompt = `What to watch?
  1. ${matchSelectionNode.getOption(0).option.optionDisplayText}
  2. ${matchSelectionNode.getOption(1).option.optionDisplayText}
  3. ${matchSelectionNode.getOption(2).option.optionDisplayText}`;
  const response = {
    prompt,
    end: false
  };
  res.send(response);
});

app.put('*', (req, res) => {
  let { userInput } = req.body;
  userInput = Number(userInput) - 1;
  let selectedOption = landingnode.processUserInput(userInput);
  let nextInstance = new NodeInstance(selectedOption.option.nextNodeTpl, landingnode);;
  let prompt = null;
  switch (nextInstance.currTpl.name) {
    case '_SELECT_STAND_':
      selectedOption = landingnode.processUserInput(userInput);
      prompt = `Watch ${selectedOption.option.optionDisplayText} from stand:
    1. ${nextInstance.currTpl.options[0].option.optionDisplayText}
    2. ${nextInstance.currTpl.options[1].option.optionDisplayText}`;
      nextInstance = new NodeInstance(
        selectedOption.option.nextNodeTpl,
        landingnode
      );
      break;
    case '_CONFIRM_ORDER_':
      selectedOption = landingnode.processUserInput(userInput);
      prompt = `The ${selectedOption.option.optionDisplayText} costs  200
      1. Buy Ticket
      2. Go Back`;
      break;
    case '_SELECT_MATCH_':
      break;
    default:
      break;
  }
  const response = {
    prompt,
    end: false
  };
  res.send(response);
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
