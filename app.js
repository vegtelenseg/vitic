const app = require('express')();
const bodyParser = require('body-parser');
const logger = require('morgan');
const cors = require('cors');
const UssdMenu = require('./ussd-menu');

const port = process.env.PORT || 3030;
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.options('*', cors());

app.get('*', (req, res) => {
  res.send('USSD MENU');
});

const menu = new UssdMenu();
const matches = ['Sun vs Pir', 'Ajax vs Bush', 'Chiefs vs Maritz'];
const stands = ['Grand', 'Side'];

app.post('*', (req, res) => {

});

app.put('*', (req, res) => {

});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
