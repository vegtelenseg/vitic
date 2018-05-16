class NodeTpl {
  constructor(name, options, promptTextGenerator, ticketOrderUpdater) {
    this.name = name;
    this.options = options;
    this.promptTextGenerator = promptTextGenerator;
    this.ticketOrderUpdater = ticketOrderUpdater;
  }

  getPromptText(tickOrder) {
    return this.promptTextGenerator(tickOrder);
  }

  getOption(idx) {
    return this.options[idx];
  }
}

class Option {
  constructor(optionDisplayText, nextNodeTpl) {
    this.optionDisplayText = optionDisplayText;
    this.nextNodeTpl = nextNodeTpl;
  }
}

class NodeInstance {
  constructor(currTpl, prevNI) {
    this.currTpl = currTpl;
    this.prevNI = prevNI;
    this.userInput = '';
    this.selectedOption = null;
  }

  processUserInput(userInput) {
    this.selectedOption = this.currTpl.getOption(userInput);
    return this.selectedOption;
  }

  updateState(stateKeeper) {
    const { ticketOrderUpdater } = this.currTpl;
    const { ticketOrder } = stateKeeper;
    let updatedTicketOrder = null;
    if (ticketOrderUpdater) {
      return (updatedTicketOrder = ticketOrderUpdater(
        ticketOrder,
        this.selectedOption
      ));
    } else {
      return (updatedTicketOrder = ticketOrder);
    }
    stateKeeper.ticketOrder = updatedTicketOrder;
  }
}

module.exports = {
  NodeTpl,
  Option,
  NodeInstance
};
