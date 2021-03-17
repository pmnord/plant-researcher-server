const express = require('express');
const AuthService = require('./auth-service');

const jsonBodyParser = express.json();
const authRouter = express.Router();

authRouter.post('/login', jsonBodyParser, (req, res) => {
  const { username, password } = req.body;
  const credentials = { username, password };

  for (const value of ['username', 'password']) // Required credential values
    if (!credentials[value])
      return res
        .status(400)
        .json({ error: `Missing required field '${value}'` });

  AuthService.getUserWithUsername(req.app.get('db'), credentials.username).then(
    (user) => {
      if (!user) {
        return res.status(400).json({ error: `Invalid username or password` });
      }

      AuthService.checkPassword(credentials.password, user.password).then(
        (valid) => {
          if (!valid) {
            return res
              .status(400)
              .json({ error: `Invalid username or password` });
          }

          const subject = user.username;
          const payload = { username: user.username };
          return res.status(200).send({
            authToken: AuthService.createJwt(subject, payload),
          });
        }
      );
    }
  );
});

module.exports = authRouter;
