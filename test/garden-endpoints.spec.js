const app = require('../src/app');
const knex = require('knex');
const TestHelpers = require('./test-helpers');
const config = require('../src/config');

describe('Garden Endpoints', () => {
  let db;

  const testUsers = TestHelpers.makeTestUsers();
  const testUser = testUsers[0];
  const testPlantInstances = [
    {
      id: 1,
      user_id: 1,
      watered_date: null,
      trefle_id: 157554,
      note: 'This is a test note',
    },
  ];
  const testPlants = [
    {
      id: 1,
      trefle_id: 157554,
      scientific_name: 'Monstera deliciosa',
      common_name: 'tarovine',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/0/04/Monstera_deliciosa3.jpg',
      plant_class: 'Liliopsida',
      plant_order: 'Arales',
      family: 'Araceae',
      family_common_name: 'Arum family',
      genus: 'Monstera',
      duration: 'Perennial',
      shade_tolerance: null,
      drought_tolerance: null,
      flower_color: null,
    },
  ];

  before('create the db instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL,
    });
    app.set('db', db);
  });
  before('clean the tables', () => TestHelpers.truncateDbTables(db));
  after('destroy the db instance', () => db.destroy());
  afterEach('clean the tables', () => TestHelpers.truncateDbTables(db));

  describe(`GET /garden`, () => {
    context(`No credentials sent`, () => {
      it(`responds 400 and error: Invalid bearer token`, () => {
        return supertest(app)
          .get('/api/garden/')
          .set('api-key', config.FANCYPLANTS_API_KEY)
          .expect(400, { error: 'Invalid bearer token' });
      });
    });

    context(`Bad credentials sent`, () => {
      it(`responds 401 and error: Unauthorized request`, () => {
        return supertest(app)
          .get('/api/garden/')
          .set('api-key', config.FANCYPLANTS_API_KEY)
          .set('Authorization', 'Bearer foo')
          .expect(401, { error: 'Unauthorized request' });
      });
    });

    context(`Good credentials sent`, () => {
      beforeEach('seed the tables', () =>
        TestHelpers.seedDbTables(db, testUsers, testPlants, testPlantInstances)
      );

      it(`responds 200 and the expected user plants array`, () => {
        return supertest(app)
          .get('/api/garden')
          .set('api-key', config.FANCYPLANTS_API_KEY)
          .set(
            'Authorization',
            'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QtdXNlci0xIiwiaWF0IjoxNTg0MTEzNjAyLCJzdWIiOiJ0ZXN0LXVzZXItMSJ9.p8hCF5K6gPgvjGhq0VfbGJRKlDfI7W4WweHqxYCWowU'
          )
          .expect(200, [
            {
              instance_id: 1,
              scientific_name: 'Monstera deliciosa',
              common_name: 'tarovine',
              image:
                'https://upload.wikimedia.org/wikipedia/commons/0/04/Monstera_deliciosa3.jpg',
              watered_date: null,
              trefle_id: 157554,
              note: 'This is a test note',
            },
          ]);
      });
    });
  });

  describe(`POST /garden/`, () => {
    context(`No credentials sent`, () => {
      it(`responds 400 and error: Invalid bearer token`, () => {
        return supertest(app)
          .post('/api/garden/')
          .set('api-key', config.FANCYPLANTS_API_KEY)
          .expect(400, { error: 'Invalid bearer token' });
      });
    });

    context(`Bad credentials sent`, () => {
      it(`responds 401 and error: Unauthorized request`, () => {
        return supertest(app)
          .post('/api/garden/')
          .set('api-key', config.FANCYPLANTS_API_KEY)
          .set('Authorization', 'Bearer foo')
          .expect(401, { error: 'Unauthorized request' });
      });
    });

    context(`Posted plant is not already in the database`, () => {
      beforeEach('seed the tables', () =>
        TestHelpers.seedDbTables(db, testUsers, testPlants, testPlantInstances)
      );

      it(`responds 201`, () => {
        return supertest(app)
          .post('/api/garden')
          .set('api-key', config.FANCYPLANTS_API_KEY)
          .set(
            'Authorization',
            'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QtdXNlci0xIiwiaWF0IjoxNTg0MTEzNjAyLCJzdWIiOiJ0ZXN0LXVzZXItMSJ9.p8hCF5K6gPgvjGhq0VfbGJRKlDfI7W4WweHqxYCWowU'
          )
          .send({
            user_id: '1',
            trefle_id: '139927',
            scientific_name: 'Goodyera pubescens',
            common_name: 'downy rattlesnake plantain',
            image:
              'https://upload.wikimedia.org/wikipedia/commons/d/d3/GoodyeraPubescens.jpg',
          })
          .expect(201);
      });
    });

    context(`Posted plant is already in the database`, () => {
      beforeEach('seed the tables', () =>
        TestHelpers.seedDbTables(db, testUsers, testPlants, testPlantInstances)
      );

      it(`responds 201`, () => {
        return supertest(app)
          .post('/api/garden')
          .set('api-key', config.FANCYPLANTS_API_KEY)
          .set(
            'Authorization',
            'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QtdXNlci0xIiwiaWF0IjoxNTg0MTEzNjAyLCJzdWIiOiJ0ZXN0LXVzZXItMSJ9.p8hCF5K6gPgvjGhq0VfbGJRKlDfI7W4WweHqxYCWowU'
          )
          .send({
            user_id: '1',
            trefle_id: '157554',
            scientific_name: 'Monstera deliciosa',
            common_name: 'tarovine',
            image:
              'https://upload.wikimedia.org/wikipedia/commons/0/04/Monstera_deliciosa3.jpg',
          })
          .expect(201);
      });
    });
  });

  describe.only('DELETE /garden/:plant_instance_id', () => {
    beforeEach('seed the tables', () =>
      TestHelpers.seedDbTables(db, testUsers, testPlants, testPlantInstances)
    );

    it(`responds 204 and deletes a plant instance`, () => {
      return supertest(app)
        .delete(`/api/garden/1`)
        .set('api-key', config.FANCYPLANTS_API_KEY)
        .set(
          'Authorization',
          'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QtdXNlci0xIiwiaWF0IjoxNTg0MTEzNjAyLCJzdWIiOiJ0ZXN0LXVzZXItMSJ9.p8hCF5K6gPgvjGhq0VfbGJRKlDfI7W4WweHqxYCWowU'
        )
        .expect(204)
        .then(() => {
          return supertest(app)
            .get(`/api/garden/`)
            .set(
              'Authorization',
              'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QtdXNlci0xIiwiaWF0IjoxNTg0MTEzNjAyLCJzdWIiOiJ0ZXN0LXVzZXItMSJ9.p8hCF5K6gPgvjGhq0VfbGJRKlDfI7W4WweHqxYCWowU'
            )
            .expect(200, []);
        });
    });
  });

  describe(`PATCH /garden/:plant_instance_id`, () => {
    beforeEach('seed the tables', () =>
      TestHelpers.seedDbTables(db, testUsers, testPlants, testPlantInstances)
    );

    it(`respods 204 and updates the plant instance in the database`, () => {
      return supertest(app)
        .patch(`/api/garden/1`)
        .set('api-key', config.FANCYPLANTS_API_KEY)
        .set(
          'Authorization',
          'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QtdXNlci0xIiwiaWF0IjoxNTg0MTEzNjAyLCJzdWIiOiJ0ZXN0LXVzZXItMSJ9.p8hCF5K6gPgvjGhq0VfbGJRKlDfI7W4WweHqxYCWowU'
        )
        .send({ watered_date: 'March 13th 8:03 pm' })
        .expect(204)
        .then(() => {
          return supertest(app)
            .get(`/api/garden`)
            .set('api-key', config.FANCYPLANTS_API_KEY)
            .set(
              'Authorization',
              'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QtdXNlci0xIiwiaWF0IjoxNTg0MTEzNjAyLCJzdWIiOiJ0ZXN0LXVzZXItMSJ9.p8hCF5K6gPgvjGhq0VfbGJRKlDfI7W4WweHqxYCWowU'
            )
            .expect(200, [
              {
                instance_id: 1,
                scientific_name: 'Monstera deliciosa',
                common_name: 'tarovine',
                image:
                  'https://upload.wikimedia.org/wikipedia/commons/0/04/Monstera_deliciosa3.jpg',
                watered_date: 'March 13th 8:03 pm',
                trefle_id: 157554,
                note: 'This is a test note',
              },
            ]);
        });
    });
  });
});
