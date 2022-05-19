const { celebrate, Joi } = require('celebrate');
const cardsRouter = require('express').Router();

const {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
} = require('../controllers/cards');

cardsRouter.get('/', getCards);
cardsRouter.post('/', createCard);
cardsRouter.delete('/:_id', celebrate({
  params: Joi.object().keys({
    _id: Joi.string().alphanum().length(24),
  }),
}), deleteCard);
cardsRouter.put('/:_id/likes', likeCard);
cardsRouter.delete('/:_id/likes', dislikeCard);

module.exports = cardsRouter;
