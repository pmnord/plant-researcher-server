const app = require('../src/app');
const knex = require('knex');
const TestHelpers = require('./test-helpers');
const config = require('../src/config');
const { assert } = require('chai');

describe('Plant Endpoints', () => {
  let db;

  before('create the db instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL,
    });

    app.set('db', db);
  });

  before('clean the tables', () => TestHelpers.truncateDbTables(db));

  after('destroy the db instance', () => db.destroy());

  // afterEach('clean the tables', () => TestHelpers.truncateDbTables(db))

  describe('GET /plant?=query', () => {
    it('returns 200 and the expected array of plants', () => {
      return supertest(app)
        .get(`/api/plant?q=Prunus_tenella`)
        .set('api-key', config.FANCYPLANTS_API_KEY)
        .expect(200, [
          {
            slug: 'prunus-tenella',
            scientific_name: 'Prunus tenella',
            link: 'http://trefle.io/api/plants/171403',
            id: 171403,
            complete_data: true,
            common_name: 'dwarf Russian almond',
          },
        ]);
    });
  });

  describe('GET /plant/:plant_id', () => {
    it('returns 200 and a plant object from trefle', () => {
      return supertest(app)
        .get(`/api/plant/171403`)
        .set('api-key', config.FANCYPLANTS_API_KEY)
        .expect(200)
        .expect((response) => assert.typeOf(response.body, 'object'));
    });
  });
});
