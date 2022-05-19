const Card = require('../models/card');
const {
  UNEXPECTED_ERROR,
  FOBIDDEN_ERROR,
  NOT_FOUND_ERROR,
  BAD_REQUEST_ERROR,
} = require('../utils/constants');

module.exports.getCards = (req, res) => {
  Card.find({})
    .then((cards) => {
      res.send({ data: cards });
    })
    .catch((err) => {
      res.status(UNEXPECTED_ERROR).send({ message: err.message });
    });
};

module.exports.createCard = (req, res) => {
  const { name, link } = req.body;
  const ownerId = req.user._id;
  Card.create({ name, link, owner: ownerId })
    .then((card) => {
      res.send(card);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(BAD_REQUEST_ERROR).send({ message: 'Переданы некорректные данные при создании карточки' });
      } else {
        res.status(UNEXPECTED_ERROR).send({ message: err.message });
      }
    });
};

module.exports.deleteCard = (req, res) => {
  const { _id } = req.params;
  Card.findById(_id)
    .then((card) => {
      if (card === null) {
        res.status(NOT_FOUND_ERROR).send({ message: 'Карточка c указанным id не найдена' });
      } else if (!card.owner.equals(req.user._id)) {
        res.status(FOBIDDEN_ERROR).send({ message: 'Попытка удалить чужую карточку' });
      }
      return card;
    })
    .then((card) => card.delete())
    .then((data) => res.send(data))
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(BAD_REQUEST_ERROR).send({ message: 'Передан некорректный формат id' });
      } else {
        res.status(UNEXPECTED_ERROR).send({ message: err.message });
      }
    });
};

module.exports.likeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params._id,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (card === null) {
        res.status(NOT_FOUND_ERROR).send({ message: 'Передан несуществующий id карточки' });
      } else {
        res.send(card);
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(BAD_REQUEST_ERROR).send({ message: 'Передан некорректный формат id' });
      } else if (err.name === 'ValidationError') {
        res.status(BAD_REQUEST_ERROR).send({ message: 'Переданы некорректные данные для постановки лайка' });
      } else {
        res.status(UNEXPECTED_ERROR).send({ message: err.message });
      }
    });
};

module.exports.dislikeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params._id,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (card === null) {
        res.status(NOT_FOUND_ERROR).send({ message: 'Передан несуществующий id карточки' });
      } else {
        res.send(card);
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(BAD_REQUEST_ERROR).send({ message: 'Передан некорректный формат id' });
      } else if (err.name === 'ValidationError') {
        res.status(BAD_REQUEST_ERROR).send({ message: 'Переданы некорректные данные для снятия лайка' });
      } else {
        res.status(UNEXPECTED_ERROR).send({ message: err.message });
      }
    });
};
