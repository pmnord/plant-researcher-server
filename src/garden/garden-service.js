const xss = require('xss');

const GardenService = {
  getUserPlants(db, user_id) {
    return db
      .from('fancyplants_plant_instances')
      .select(
        'fancyplants_plant_instances.id AS instance_id',
        'fancyplants_plant_instances.date_created',
        'fancyplants_plant_instances.user_id',
        'fancyplants_plant_instances.note',
        'fancyplants_plant_instances.watered_date',
        'fancyplants_plants.id AS plant_id',
        'fancyplants_plants.trefle_id',
        'fancyplants_plants.scientific_name',
        'fancyplants_plants.common_name',
        'fancyplants_plants.image'
      )
      .where({ user_id })
      .rightJoin(
        'fancyplants_plants',
        'fancyplants_plant_instances.trefle_id',
        'fancyplants_plants.trefle_id'
      );
    // You can't have the same name for both columns when doing a join due to ambiguity
  },
  serializePlantInstance(plant) {
    return {
      instance_id: plant.instance_id,
      scientific_name: plant.scientific_name,
      common_name: plant.common_name,
      image: plant.image,
      watered_date: plant.watered_date,
      trefle_id: plant.trefle_id,
      note: xss(plant.note),
    };
  },
  checkPlantExistsInDb(db, trefle_id) {
    return db.from('fancyplants_plants').where({ trefle_id }).first();
  },
  insertPlant(db, plant) {
    return db
      .into('fancyplants_plants')
      .insert(plant)
      .returning('*')
      .then((rows) => {
        return rows[0];
      });
  },
  insertPlantInstance(db, plantInstance) {
    return db
      .into('fancyplants_plant_instances')
      .insert(plantInstance)
      .returning('*')
      .then((rows) => {
        return rows[0];
      });
  },
  deletePlantInstance(db, id) {
    return db.from('fancyplants_plant_instances').where({ id }).delete();
  },
  updatePlantInstance(db, id, updateValues) {
    return db
      .from('fancyplants_plant_instances')
      .where({ id })
      .update(updateValues);
  },
};

module.exports = GardenService;
