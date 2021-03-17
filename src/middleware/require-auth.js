const AuthService = require('../auth/auth-service');

const requireAuth = (req, res, next) => {
  const authHeader = req.get('Authorization') || '';

  if (!authHeader.toLowerCase().startsWith('bearer ')) {
    return res.status(400).json({ error: `Invalid bearer token` });
  }

  const authToken = authHeader.slice(7, authHeader.length);

  try {
    const payload = AuthService.verifyJwt(authToken);

    AuthService.getUserWithUsername(req.app.get('db'), payload.sub).then(
      (user) => {
        if (!user) {
          return res.status(401).json({ error: 'Unauthorized request' });
        }
        req.user = user;
        next();
      }
    );
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized request' });
  }
};

module.exports = requireAuth;
