const app = require('express')();
const bodyParser = require('body-parser');
const logger = require('morgan');
const cors = require('cors');

const port = process.env.PORT || 3030;
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.options('*', cors());

app.get('*', (req, res) => {
  res.send('Menu does not exist');
});

app.post('*', (req, res) => {
  console.log("Req Body: ", req.body);
  const { sessionId, serviceCode, phoneNumber, ussdString, text } = req.body;
  let response = '';
  switch (req.body.ussdString) {
    case '*120*1341*003#':
      response = `CON Which game to watch?
    1. Sundowns vs Pirates
    2. Kaizer Chiefs vs Ajax`;
      return res.send(response);
    case '1':
      response = `CON Choose type of stand to watch from
    1. Grand Stand
    2. Side Stand`;
      return res.send(response);
    case '2':
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
