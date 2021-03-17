const bcrypt = require('bcryptjs');

const UserService = {
  checkUserExists(db, username) {
    return db
      .from('fancyplants_users')
      .where({ username })
      .first()
      .then((user) => !!user);
  },
  hashPassword(password) {
    return bcrypt.hash(password, 12);
  },
  insertUser(db, user) {
    return db.into('fancyplants_users').insert(user).returning('*');
  },
  validatePasswordInput(password) {
    if (password.length < 6) return `Password must be at least 6 characters`;
    if (password.length > 72)
      return `Password cannot be more than 72 characters`;

    return null;
  },
};

module.exports = UserService;
