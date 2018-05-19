class NodeTemplate {
  constructor(name, options, promptTextGenerator, ticketOrderUpdater) {
    this.name = name;
    this.options = options;
    this.promptTextGenerator = promptTextGenerator;
		this.ticketOrderUpdater = ticketOrderUpdater;
		this.getOption = this.getOption.bind(this);
		this.getPromptText = this.getPromptText.bind(this);
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
		this.getNextNodeTemplate = this.getNextNodeTemplate.bind(this);
  }
  setPrevNodeTemplate(prevNodeTemplate) {
    return (this.prevNodeTemplate = prevNodeTemplate);
	}
	getNextNodeTemplate(){
		return this.nextNodeTemplate;
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
    return (this.selectedOption = this.currentTemplate.options[userInput]);
  }
  updateState(stateKeeper) {
    const { ticketOrderUpdater } = this.currentTemplate;
		const { ticketOrder } = stateKeeper;
    let updatedTicketOrder = null;
    if (ticketOrderUpdater)
      return (updatedTicketOrder = ticketOrderUpdater(ticketOrder, this.selectedOption));
    else return (updatedTicketOrder = ticketOrder);
  }
  setBackOption(prevNodeTemplate) {
    /*const { currentTemplate, previousNodeInstance } = nodeInstance;
		if (this.currentTemplate === null)
			return this.currentTemplate =nodeInstance;
		return this.currentTemplate*/
    return (this.currentTemplate = prevNodeTemplate);
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
