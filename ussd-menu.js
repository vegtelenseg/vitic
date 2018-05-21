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
class MatchOption extends Option {
  constructor(optionDisplayText, nextNodeTemplate, matchPrice) {
    super(optionDisplayText, nextNodeTemplate);
    this.matchPrice = matchPrice;
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
    return (updatedTicketOrder = ticketOrder);
  }
  getOptions() {
    const { options } = this.currentTemplate;
    return options
      .map((option, idx) => `${++idx}. ${option.option.optionDisplayText}` + '\n')
      .join('');
  }
}

module.exports = {
  NodeTemplate,
  Option,
  StandOption,
  MatchOption,
  NodeInstance
};
