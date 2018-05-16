class NodeTpl {
  constructor(name, options) {
    this.name = name;
    this.options = options;
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
    (this.prevNI = prevNI), (this.userInput = '');
  }

  processUserInput(userInput) {
    return this.currTpl.getOption(userInput);
  }
}

module.exports = {
  NodeTpl,
  Option,
  NodeInstance
};
