const app = require('express')();
const bodyParser = require('body-parser');
const logger = require('morgan');

const port = process.env.PORT || 3030;

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('*', (req, res) => {
  res.send('Menu does not exist');
});

app.post('*', (req, res) => {
  console.log("Req Body: ", req);
  const { sessionId, serviceCode, phoneNumber, ussdString } = req.body;
  let response = '';
  switch (req.body.ussdString) {
    case '*120*1341*003#':
      // This is the first request. Note how we start the response with CON
      response = `CON Which game to watch?
    1. Sundowns vs Pirates
    2. Kaizer Chiefs vs Ajax`;
      return res.send(response);
    case '1':
      // Business logic for first level response
      response = `CON Choose type of stand to watch from
    1. Grand Stand
    2. Side Stand`;
      return res.send(response);
    case '2':
      // Business logic for first level response
      response = `CON Side Stand costs R200.00
      1. Buy Ticket
      2. Back to Main Menu`;
      return res.send(response);
    default:
      return res.status(400).send('Bad request!');
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
