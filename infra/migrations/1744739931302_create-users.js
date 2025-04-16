exports.up = (pgm) => {
  pgm.createTable('users', {
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

    surname: {
      type: 'varchar(60)',
      notNull: true,
    },

    // Why 254 in length? https://stackoverflow.com/a/1199238
    email: {
      type: 'varchar(254)',
      notNull: true,
      unique: true,
    },

    // Why 60 in lenght? https://www.npmjs.com/package/bcrypt#hash-info
    password: {
      type: 'varchar(60)',
      notNull: true,
    },

    phone_number: {
      type: 'varchar(16)',
      notNull: true,
    },

    is_vet: {
      type: 'boolean',
      notNull: true,
      default: false,
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
  });
};

exports.down = false;
