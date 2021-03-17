const express = require('express');
const UserService = require('./user-service');

const jsonBodyParser = express.json();
const userRouter = express.Router();

userRouter.post('/', jsonBodyParser, (req, res, next) => {
  const { username, password } = req.body;

  for (const value of ['username', 'password']) {
    if (!value)
      res.status(400).json({ error: `Missing required paramater: '${value}'` });
  }

  const passwordError = UserService.validatePasswordInput(password);
  if (passwordError) return res.status(400).json({ error: passwordError });

  UserService.checkUserExists(req.app.get('db'), username)
    .then((userExists) => {
      if (userExists) {
        return res.status(400).json({ error: `That username is unavailable` });
      }

      UserService.hashPassword(password).then((hashedPassword) => {
        const newUser = {
          username,
          email: '',
          password: hashedPassword,
        };

        UserService.insertUser(req.app.get('db'), newUser)
          .then((newUser) => {
            return res.json(newUser);
          })
          .catch(next);
      });
    })
    .catch(next);
});

module.exports = userRouter;
