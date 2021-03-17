BEGIN;

    TRUNCATE
    fancyplants_plant_instances,
    fancyplants_plants,
    fancyplants_users
    RESTART IDENTITY CASCADE;

    INSERT INTO fancyplants_users
        ( username, email, password)
    VALUES
        ( 'demo', 'demo-email', '$2a$12$yWmO1coIMF5SD0hMYI3aL.ZDK4S.cgiRoviJao5zU1VbjSxgLjU9u' );

    INSERT INTO fancyplants_plants
        (
        trefle_id,
        scientific_name,
        common_name,
        image,
        plant_class,
        plant_order,
        family,
        family_common_name,
        genus,
        duration,
        shade_tolerance,
        drought_tolerance,
        flower_color
        )
    VALUES
        (
            157554,
            'Monstera deliciosa',
            'Tarovine',
            'https://upload.wikimedia.org/wikipedia/commons/0/04/Monstera_deliciosa3.jpg',
            'Liliopsida',
            'Arales',
            'Araceae',
            'Arum family',
            'Monstera',
            'Perennial',
            NULL,
            NULL,
            NULL
    ),
        (
            171306,
            'Prunus fasciculata',
            'Desert almond',
            'https://upload.wikimedia.org/wikipedia/commons/3/38/Prunus_fasciculata_8.jpg',
            'Magnoliopsida',
            'Rosales',
            'Rosaceae',
            'Rose family',
            'Prunus',
            'Perennial',
            'Intolerant',
            'High',
            'White'
    ),
        (
            142925,
            'Hierochloe',
            'Sweetgrass',
            'https://upload.wikimedia.org/wikipedia/commons/3/38/Hierochloe_odorata_kz.jpg',
            NULL,
            NULL,
            NULL,
            'Grass family',
            'Hierochloe',
            NULL,
            NULL,
            NULL,
            NULL
    )
    ;

    INSERT INTO fancyplants_plant_instances
        (user_id, trefle_id, note)
    VALUES
        ( 1, 157554, null ),
        ( 1, 171306, null ),
        ( 1, 142925, null )
    ;

    COMMIT;