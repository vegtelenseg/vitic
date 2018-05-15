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
  const response = 'Which game to watch?\n1. Sundowns vs Pirates\n2. Kaizer Chiefs vs Ajax';
  return res.send({
    prompt: response,
    end: false
  });
});

app.put('*', (req, res) => {
  console.log("Req Body: ", req.body);
  const { userInput } = req.body;
  switch (userInput) {
    case '1':
      response = 'Choose type of stand to watch from\n1. Grand Stand\n2. Side Stand';
      return res.send({
        prompt: response,
        end: false
      });
    case '2':
      response = 'Side Stand costs R200.00\n1. Buy Ticket\n2. Back to Main Menu';
      return res.send(response);
    default:
      return res.status(400).send('Bad request!');
  }
})

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
