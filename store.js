const { Option, StandOption, MatchOption, BankOption, NodeTemplate } = require('./ussd-menu');

module.exports = {
  ticketOrder: {
    match: {},
    stand: {},
    quantity: 1,
    cost: 5,
    bank: null,
    msisdn: null
  },
  endSessionSelectionNode() {
    return new NodeTemplate(
      '_END_SESSION_',
      [],
      ticketOrder =>
        `Thank you. Reference sent, via SMS, to +${
          ticketOrder.msisdn
        }, with activation instructions.` + '\nEnjoy the game',
      null
    );
  },
  bankOptions() {
    return [
      {
        option: new BankOption(
          'FNB',
          this.endSessionSelectionNode(),
          'First National Bank',
          25421,
          62627623190
        )
      },
      {
        option: new BankOption(
          'Capitec',
          this.endSessionSelectionNode(),
          'Capitec Bank',
          24866,
          62627623190
        )
      },
      {
        option: new BankOption('Absa', this.endSessionSelectionNode(), 'Absa', 24811, 62627623190)
      },
      {
        option: new BankOption(
          'Standard Bank',
          this.endSessionSelectionNode(),
          'Standard Bank',
          24121,
          62627623190
        )
      },
      {
        option: new BankOption(
          'NedBank',
          this.endSessionSelectionNode(),
          'NedBank',
          24111,
          62627623190
        )
      },
      {
        option: new Option('Back', this.orderSelectionNode.bind(this))
      }
    ];
  },
  bankOptionSelectionNode() {
    return new NodeTemplate(
      '_SELECT_BANK',
      this.bankOptions(),
      ticketOrder => 'Deposit ticket funds via:\n',
      (ticketOrder, selection) => (ticketOrder.bank = selection.option)
    );
  },
  orderOptions() {
    return [
      {
        option: new Option('Confirm', this.bankOptionSelectionNode())
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
      ({ match, stand }) =>
        `Match Costs = R${match.price.toFixed(2)}.` +
        '\n' +
        `${stand.optionDisplayText} Costs = R${stand.standPrice.toFixed(2)}.` +
        '\n' +
        `Total = R${(match.price + stand.standPrice).toFixed(2)}. Confirm Order?` +
        '\n',
      ticketOrder => (ticketOrder.cost = ticketOrder.match.price + ticketOrder.stand.standPrice),
      ticketOrder =>
        console.log('Confirm Order: ', ticketOrder.match.price + ticketOrder.stand.standPrice)
    );
  },
  standOptions() {
    return [
      {
        option: new StandOption('Grand Stand', this.orderSelectionNode(), 100)
      },
      {
        option: new StandOption('East Stand', this.orderSelectionNode(), 80)
      },
      ,
      {
        option: new StandOption('Party Stand', this.orderSelectionNode(), 150)
      },
      ,
      {
        option: new StandOption('Family Stand', this.orderSelectionNode(), 50)
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
      },
      {
        option: new MatchOption('COSMOS vs Bush Bucks', this.standSelectionNode(), 100)
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
  }
};
