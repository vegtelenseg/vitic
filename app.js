const app = require('express')();
const bodyParser = require('body-parser');
const logger = require('morgan');
const cors = require('cors');
const UssdMenu = require('ussd-menu-builder');

const port = process.env.PORT || 3030;
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.options('*', cors());

app.get('*', (req, res) => {
  res.send('Menu does not exist');
});

const menu = new UssdMenu();

menu.startState({
  run: () => {
    menu.con('Welcome. What are you watching?' +
      '\n1. Chiefs vs Pirates' +
      '\n2. Sundowns vs Bush Bucks');
  },
  next: {
    '1': 'chiefsPirates',
    '2': 'sunBush'
  },
  defaultNext: 'invalidOption'
});

menu.state('chiefsPirates', {
  run: () => {
    menu.con('Which stand?' +
      '\n1. Grand Stand' +
      '\n2. Side Stand');
  },
  next: {
    '1': 'grandStand',
    '2': 'sideGrand'
  },
  defaultNext: 'invalidOption'
});

menu.state('sunBush', {
  run: () => {
    menu.con('Which stand?' +
      '\n1. Grand Stand' +
      '\n2. Side Stand');
  },
  next: {
    '1': 'grandStand',
    '2': 'sideGrand'
  },
  defaultNext: 'invalidOption'
});

// Confirm Stand?
menu.state('grandStand', {
  run: () => {
    menu.con('Confirm Grand Stand?' +
      '\n1. Confirm' +
      '\n2. Cancel');
  },
  next: {
    '1': 'confirmedStand',
    '2': 'cancelledStand'
  },
  defaultNext: 'invalidOption'
});

//Confirmed Stand.
menu.state('confirmedStand', {
  run: () => {
    menu.end('Confirmed Grand Stand');
  }
});

// Cancelled Stand.
menu.state('cancelledStand', {
  run: () => {
    menu.con('Cancelled Grand Stand' +
      '\n1. Back to Main Menu' +
      '\n2. Select a Stand');
  },
  next: {
    '1': 'backToMainMenu',
    '2': 'chiefsPirates'
  },
  defaultNext: 'invalidOption'
});


/*// nesting states
menu.state('buyAirtime.amount', {
    run: () => {
        // use menu.val to access user input value
        var amount = Number(menu.val);
        buyAirtime(menu.args.phoneNumber, amount).then(function(res){
            menu.end('Airtime bought successfully.');
        });
    }
});*/

app.post('*', function (req, res) {
  let args = {
    phoneNumber: req.body.msisdn,
    sessionId: req.body.sessionId,
    serviceCode: req.body.ussdString,
    text: req.body.text
  };
  console.log("Req Body: ", req.body);
  menu.run(args, ussdResult => {
    res.send(ussdResult);
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
