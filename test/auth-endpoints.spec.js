const app = require('../src/app');
const knex = require('knex');
const TestHelpers = require('./test-helpers');
const jwt = require('jsonwebtoken');
const config = require('../src/config');

describe('Auth Endpoints', () => {
  let db;

  const testUsers = TestHelpers.makeTestUsers();
  const testUser = testUsers[0];

  before('create the db instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL,
    });

    app.set('db', db);
  });

  before('clean the tables', () => TestHelpers.truncateDbTables(db));

  after('destroy the db instance', () => db.destroy());

  beforeEach('seed the users table', () => {
    return db.into('fancyplants_users').insert(testUsers);
  });

  afterEach('clean the tables', () => TestHelpers.truncateDbTables(db));

  describe('POST /api/auth/login', () => {
    it(`responds 400 Missing required field 'username' when no credentials are sent`, () => {
      return supertest(app)
        .post(`/api/auth/login`)
        .set('api-key', config.FANCYPLANTS_API_KEY)
        .expect(400, { error: `Missing required field 'username'` });
    });
    it(`responds 400 'Invalid username or password' when no user is found`, () => {
      return supertest(app)
        .post(`/api/auth/login`)
        .set('api-key', config.FANCYPLANTS_API_KEY)
        .send(testUser)
        .expect(400, { error: `Invalid username or password` });
    });
    it(`responds with 200 and a JWT when valid credentials are sent`, () => {
      const credentials = {
        username: testUser.username,
        password: 'password',
      };
      const expectedToken = jwt.sign(
        { username: credentials.username }, // Payload
        config.JWT_SECRET, // Secret
        {
          // Headers
          subject: credentials.username,
          algorithm: 'HS256',
        }
      );
      return supertest(app)
        .post(`/api/auth/login`)
        .set('api-key', config.FANCYPLANTS_API_KEY)
        .send(credentials)
        .expect(200, { authToken: expectedToken });
    });
  });
});
