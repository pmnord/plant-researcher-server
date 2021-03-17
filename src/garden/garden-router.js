const express = require('express');
const requireAuth = require('../middleware/require-auth.js');
const GardenService = require('./garden-service');
const fetch = require('node-fetch');
const config = require('../config');

const jsonBodyParser = express.json();
const GardenRouter = express.Router();

GardenRouter.route('/')
  .get(requireAuth, (req, res, next) => {
    GardenService.getUserPlants(req.app.get('db'), req.user.id)
      .then((plants) => {
        const serializedPlants = plants.map((plant) =>
          GardenService.serializePlantInstance(plant)
        );
        return res.status(200).json(serializedPlants);
      })
      .catch(next);
  })
  .post(requireAuth, jsonBodyParser, (req, res, next) => {
    const {
      trefle_id,
      scientific_name,
      common_name,
      plant_class,
      plant_order,
      family,
      family_common_name,
      genus,
      image,
    } = req.body;

    const user_id = req.user.id;

    for (const value of ['trefle_id', 'scientific_name']) {
      if (!req.body[value]) {
        return res
          .status(400)
          .json({ error: `Missing required field: ${value}` });
      }
    }

    GardenService.checkPlantExistsInDb(req.app.get('db'), trefle_id)
      .then((dbPlant) => {
        if (!dbPlant) {
          if (!image) {
            return fetch(
              `https://trefle.io/api/v1/plants/${trefle_id}?token=${config.TREFLE_API_KEY}`
            )
              .then((trefleRes) =>
                !trefleRes.ok
                  ? trefleRes.json().then((e) => Promise.reject(e))
                  : trefleRes.json()
              )
              .then((trefleResData) => {
                console.log(trefleResData);
                let trefleImage =
                  'https://upload.wikimedia.org/wikipedia/commons/5/53/Alnus_cordata_leaf_illustration.jpg';
                if (trefleResData.images[0]) {
                  trefleImage = trefleResData.images[0].url;
                }

                const newPlant = {
                  trefle_id,
                  scientific_name,
                  common_name,
                  image: trefleImage,
                  plant_class: trefleResData.class
                    ? trefleResData.class.name
                    : null,
                  plant_order: trefleResData.order
                    ? trefleResData.order.name
                    : null,
                  family: trefleResData.family
                    ? trefleResData.family.name
                    : null,
                  family_common_name: trefleResData.family_common_name,
                  genus: trefleResData.genus.name,
                };

                return GardenService.insertPlant(
                  req.app.get('db'),
                  newPlant
                ).then((dbRes) => {
                  const newPlantInstance = {
                    user_id,
                    trefle_id,
                  };

                  return GardenService.insertPlantInstance(
                    // use GardenService to insert the new plant instance
                    req.app.get('db'),
                    newPlantInstance
                  ).then((plantInstance) => {
                    return res.status(201).json(plantInstance);
                  });
                });
              })
              .catch(next);
          } else {
            const newPlant = {
              trefle_id,
              scientific_name,
              common_name,
              plant_class,
              plant_order,
              family,
              family_common_name,
              genus,
              duration,
              shade_tolerance,
              drought_tolerance,
              flower_color,
              image,
            };

            return GardenService.insertPlant(req.app.get('db'), newPlant).then(
              (dbRes) => {
                const newPlantInstance = {
                  user_id,
                  trefle_id,
                };

                return GardenService.insertPlantInstance(
                  // use GardenService to insert the new plant instance
                  req.app.get('db'),
                  newPlantInstance
                ).then((plantInstance) => {
                  return res.status(201).json(plantInstance);
                });
              }
            );
          }
        } else {
          const newPlantInstance = {
            user_id,
            trefle_id,
          };

          return GardenService.insertPlantInstance(
            // use GardenService to insert the new plant instance
            req.app.get('db'),
            newPlantInstance
          ).then((plantInstance) => {
            return res
              .status(201)
              .json(
                `Created plant ${plantInstance.trefle_id} at user ${plantInstance.user_id}`
              );
          });
        }
      })
      .catch(next);
  });

GardenRouter.route('/:plant_instance_id')
  .patch(requireAuth, jsonBodyParser, (req, res, next) => {
    const { note, watered_date } = req.body;
    const updateValues = { note, watered_date };

    GardenService.updatePlantInstance(
      req.app.get('db'),
      req.params.plant_instance_id,
      updateValues
    )
      .then(() => res.status(204).end())
      .catch(next);
  })
  .delete(requireAuth, (req, res, next) => {
    const { plant_instance_id } = req.params;

    GardenService.deletePlantInstance(req.app.get('db'), plant_instance_id)
      .then(() => res.status(204).end())
      .catch(next);
  });

module.exports = GardenRouter;
