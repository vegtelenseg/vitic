const { Option, StandOption, MatchOption, NodeTemplate } = require('./ussd-menu');

module.exports = {
  ticketOrder: {
    match: {},
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
        option: new Option('Back', this.standSelectionNode.bind(this))
      }
    ];
  },
  orderSelectionNode() {
    return new NodeTemplate(
      '_CONFIRM_ORDER_',
      this.orderOptions(),
      ticketOrder =>
        `Match Costs = R${ticketOrder.match.price}. ${
          ticketOrder.stand.optionDisplayText
        } Costs = R${ticketOrder.stand.standPrice}.` +
        '\n' +
        `Total = R${ticketOrder.match.price + ticketOrder.stand.standPrice}. Confirm Order?` +
        '\n',
      ticketOrder =>
        console.log(
          'Confirm Order . About to buy: ',
          ticketOrder.match.price + ticketOrder.stand.standPrice
        )
    );
  },
  standOptions() {
    return [
      {
        option: new StandOption('Grand Stand', this.orderSelectionNode(), 80)
      },
      {
        option: new StandOption('Side Stand', this.orderSelectionNode(), 50)
      },
      {
        option: new Option('Back', this.matchSelectionNode.bind(this))
      }
    ];
  },
  standSelectionNode() {
    return new NodeTemplate(
      '_SELECT_STAND_',
      this.standOptions(),
      ticketOrder => `Watch ${ticketOrder.match.name} (R${ticketOrder.match.price}) from:` + '\n',
      (ticketOrder, selection) => (ticketOrder.stand = selection.option)
    );
  },
  matchOptions() {
    return [
      {
        option: new MatchOption('CHI vs PIR', this.standSelectionNode(), 300)
      },
      {
        option: new MatchOption('SUN vs FCB', this.standSelectionNode(), 450)
      },
      {
        option: new MatchOption('FSS vs PLT', this.standSelectionNode(), 200)
      }
    ];
  },
  matchSelectionNode() {
    return new NodeTemplate(
      '_SELECT_MATCH_',
      this.matchOptions(),
      () => 'What to watch?\n',
      (ticketOrder, selection) => {
        ticketOrder.match.name = selection.option.optionDisplayText;
        ticketOrder.match.price = selection.option.matchPrice;
        return ticketOrder.match;
      }
    );
  },
  endSessionSelectionNode() {
    return new NodeTemplate(
      '_END_SESSION_',
      [],
      ticketOrder =>
        `Ticket for ${ticketOrder.match.name} (R${ticketOrder.match.price +
          ticketOrder.stand.standPrice}), watching from the ${
          ticketOrder.stand.optionDisplayText
        } has been purchased successfully. You will receive an sms soon.`,
      null
    );
  }
};
