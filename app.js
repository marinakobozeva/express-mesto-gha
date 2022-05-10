const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const { PORT = 3000 } = process.env;

mongoose.connect('mongodb://localhost:27017/mestodb', {
  // useNewUrlParser: true,
  // useCreateIndex: true,
  // useFindAndModify: false,
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(PORT, () => {
  // console.log(`App listening on port ${PORT}`);
});

app.use((req, res, next) => {
  req.user = {
    _id: '62768bd4d8f516f9b969dae3',
  };

  next();
});

app.use('/users', require('./routes/users'));
app.use('/cards', require('./routes/cards'));

app.use((req, res, next) => {
  res.status(404).send({ message: 'Указанный маршрут не найден' });
  next();
});
