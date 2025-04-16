exports.up = (pgm) => {
  pgm.createType('specie_type', ['dog', 'cat']);

  pgm.createTable('pets', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },

    // For reference, github limits usernames to 39 characters
    name: {
      type: 'varchar(30)',
      notNull: true,
    },

    specie: {
      type: 'specie_type',
      notNull: true,
    },

    brithday: {
      type: 'timestamptz',
    },

    weight: {
      type: 'decimal(5,2)',
    },

    // Why timestamp with timezone? https://justatheory.com/2012/04/postgres-use-timestamptz/
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func(`timezone('utc', now())`),
    },

    updated_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func(`timezone('utc', now())`),
    },

    user_id: {
      type: 'uuid',
      notNull: true,
      references: '"users"(id)',
    },
  });
};

exports.down = false;
