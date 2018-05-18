class NodeTemplate {
  constructor(name, options, promptTextGenerator, ticketOrderUpdater) {
    this.name = name;
    this.options = options;
    this.promptTextGenerator = promptTextGenerator;
    this.ticketOrderUpdater = ticketOrderUpdater;
  }

  getPromptText(ticketOrder) {
    return this.promptTextGenerator(ticketOrder);
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

class NodeInstance {
  constructor(currentTemplate, previousNodeInstance) {
    this.currentTemplate = currentTemplate;
    this.previousNodeInstance = previousNodeInstance;
    this.userInput = '';
    this.selectedOption = null;
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
    else return (updatedTicketOrder = ticketOrder);
  }
  setBackOption(nodeInstance) {
    const { currentTemplate, previousNodeInstance } = nodeInstance;
    const length = currentTemplate.options.length - 1;
    currentTemplate.options[length].nextNodeTemplate = currentTemplate;
    this.currentTemplate = !this.currentTemplate
      ? previousNodeInstance.currentTemplate
      : this.currentTemplate;
  }
  getOptions(nodeInstance) {
    const { options } = nodeInstance.currentTemplate;
    return options.map((option, idx) => {
      return ++idx + '. ' + option.option.optionDisplayText + '\n';
    });
  }
}

module.exports = {
  NodeTemplate,
  Option,
  StandOption,
  NodeInstance
};
