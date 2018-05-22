class NodeInstance {
  constructor(currentTemplate, previousNodeInstance) {
    this.currentTemplate = currentTemplate;
    this.previousNodeInstance = previousNodeInstance;
    this.userInput = 0;
    this.selectedOption = null;
    this.getOptions = this.getOptions.bind(this);
  }

  processUserInput(userInput) {
    return (this.selectedOption = this.currentTemplate.getOption(userInput));
  }
  updateState(stateKeeper) {
    const { ticketOrderUpdater } = this.currentTemplate;
    const { ticketOrder } = stateKeeper;
    let updatedTicketOrder = null;
    if (ticketOrderUpdater)
      return (updatedTicketOrder = ticketOrderUpdater(ticketOrder, this.selectedOption));
    return (updatedTicketOrder = ticketOrder);
  }
  getOptions() {
    const { options } = this.currentTemplate;
    return options
      .map((option, idx) => `${++idx}. ${option.option.optionDisplayText}` + '\n')
      .join('');
  }
}

class NodeTemplate {
  constructor(name, options, promptTextGenerator, ticketOrderUpdater, processPayment) {
    this.name = name;
    this.options = options;
    this.promptTextGenerator = promptTextGenerator;
    this.ticketOrderUpdater = ticketOrderUpdater;
    this.processPayment = processPayment;
  }

  getPromptText(ticketOrder) {
    return this.promptTextGenerator(ticketOrder);
  }
  processPayment() {
    return this.processPayment(ticketOrder);
  }
  getOption(idx) {
    return this.options[idx];
  }
}

class Option {
  constructor(optionDisplayText, nextNodeTemplate) {
    this.optionDisplayText = optionDisplayText;
    this.nextNodeTemplate = nextNodeTemplate;
  }
}

class StandOption extends Option {
  constructor(optionDisplayText, nextNodeTemplate, standPrice) {
    super(optionDisplayText, nextNodeTemplate);
    this.standPrice = standPrice;
  }
}
class MatchOption extends Option {
  constructor(optionDisplayText, nextNodeTemplate, matchPrice) {
    super(optionDisplayText, nextNodeTemplate);
    this.matchPrice = matchPrice;
  }
}

class BankOption extends Option {
  constructor(optionDisplayText, nextNodeTemplate, bankName, branchCode, accountNumber) {
    super(optionDisplayText, nextNodeTemplate);
    this.bankName = bankName;
    this.branchCode = branchCode;
    this.accountNumber = accountNumber;
  }
}

module.exports = {
  NodeTemplate,
  Option,
  StandOption,
  MatchOption,
  BankOption,
  NodeInstance
};
