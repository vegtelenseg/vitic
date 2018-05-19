const { Option, StandOption, NodeTemplate } = require('./ussd-menu');

module.exports = {
  ticketOrder: {
    match: '',
    stand: {},
    quantity: 1,
    cost: 5
  },
  orderOptions() {
    return [
      {
        option: new Option('Confirm', this.endSessionSelectionNode())
      },
      {
        option: new Option('Back', this.standSelectionNode)
      }
    ];
	},
	orderSelectionNode() {
    return new NodeTemplate(
      '_CONFIRM_ORDER_',
      this.orderOptions(),
      ticketOrder =>
        `${ticketOrder.stand.optionDisplayText} ticket costs R${
          ticketOrder.stand.standPrice
        }. Buy Ticket?`,
      null
    );
  },
  standOptions() {
    return [
      {
        option: new StandOption('Grand Stand', this.orderSelectionNode(), 400)
      },
      {
        option: new StandOption('Side Stand', this.orderSelectionNode(), 200)
      },
      {
        option: new Option('Back', this.matchSelectionNode)
      }
    ];
	},
	standSelectionNode() {
    return new NodeTemplate(
      '_SELECT_STAND_',
      this.standOptions(),
      ticketOrder => `Watch ${ticketOrder.match} from:`,
      (ticketOrder, selection) => (ticketOrder.stand = selection.option)
    );
  },
  matchOptions() {
    return [
      {
        option: new Option('CHI vs PIR', this.standSelectionNode()),
      },
      {
        option: new Option('SUN vs FCB', this.standSelectionNode())
      },
      {
        option: new Option('FSS vs PLT', this.standSelectionNode())
      }
    ];
  },
  matchSelectionNode() {
    return new NodeTemplate(
      '_SELECT_MATCH_',
      this.matchOptions(),
      ticketOrder => 'What to watch?\n',
      (ticketOrder, selection) => (ticketOrder.match = selection.option.optionDisplayText)
    );
  },
  endSessionSelectionNode() {
    return new NodeTemplate(
      '_END_SESSION_',
      [],
      ticketOrder =>
        `Ticket for ${ticketOrder.match}, watching from the ${
          ticketOrder.stand.optionDisplayText
        } has been purchased successfully. You will receive an sms soon.`,
      null
    );
  }
};
