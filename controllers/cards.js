const Card = require('../models/card');
const {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} = require('../utils/errors');
const { UNEXPECTED_ERROR } = require('../utils/constants');

module.exports.getCards = (req, res) => {
  Card.find({})
    .then((cards) => {
      res.send({ data: cards });
    })
    .catch((err) => {
      res.status(UNEXPECTED_ERROR).send({ message: err.message });
    });
};

module.exports.createCard = (req, res, next) => {
  const { name, link } = req.body;
  const ownerId = req.user._id;
  Card.create({ name, link, owner: ownerId })
    .then((card) => {
      res.send(card);
    })
    .catch((err) => {
      let prettyErr;
      if (err.name === 'ValidationError') {
        prettyErr = new BadRequestError('Переданы некорректные данные при создании карточки');
      }
      next(prettyErr);
    });
};

module.exports.deleteCard = (req, res, next) => {
  const { _id } = req.params;
  Card.findById(_id)
    .then((card) => {
      if (card === null) {
        throw new NotFoundError('Карточка c указанным id не найдена');
      } else if (!card.owner.equals(req.user._id)) {
        throw new ForbiddenError('Попытка удалить чужую карточку');
      }
      return card;
    })
    .then((card) => card.delete())
    .then((data) => res.send(data))
    .catch((err) => {
      let prettyErr;
      if (err.name === 'CastError') {
        prettyErr = new BadRequestError('Передан некорректный формат id');
      }
      next(prettyErr);
    });
};

module.exports.likeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params._id,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (card === null) {
        throw new NotFoundError('Передан несуществующий id карточки');
      } else {
        res.send(card);
      }
    })
    .catch((err) => {
      let prettyErr;
      if (err.name === 'CastError') {
        prettyErr = new BadRequestError('Передан некорректный формат id');
      } else if (err.name === 'ValidationError') {
        prettyErr = new BadRequestError('Переданы некорректные данные для постановки лайка');
      }
      next(prettyErr);
    });
};

module.exports.dislikeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params._id,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (card === null) {
        throw new NotFoundError('Передан несуществующий id карточки');
      } else {
        res.send(card);
      }
    })
    .catch((err) => {
      let prettyErr;
      if (err.name === 'CastError') {
        prettyErr = new BadRequestError('Передан некорректный формат id');
      } else if (err.name === 'ValidationError') {
        prettyErr = new BadRequestError('Переданы некорректные данные для снятия лайка');
      }
      next(prettyErr);
    });
};
