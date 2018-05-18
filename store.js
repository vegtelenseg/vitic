const { Option, StandOption, NodeTemplate } = require('./ussd-menu');

const ticketOrder = {
  match: '',
  stand: {},
  quantity: 1,
  cost: 5
};

const endSessionSelectionNode = new NodeTemplate(
  '_END_SESSION_',
  [],
  ticketOrder =>
    `Ticket for ${ticketOrder.match}, watching from the ${
      ticketOrder.stand.optionDisplayText
    } has been purchased successfully. You will receive an sms soon.`,
  null
);

// Order Options
const orderOptions = [
  {
    option: new Option('Confirm', endSessionSelectionNode)
  },
  {
    option: new Option('Back', null)
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
  },
  {
    option: new Option('Back', null)
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
  ticketOrder => 'Watch',
  (ticketOrder, selection) => (ticketOrder.match = selection.option.optionDisplayText)
);

module.exports = {
  endSessionSelectionNode,
  orderSelectionNode,
  standSelectionNode,
  matchSelectionNode,
  ticketOrder
};
