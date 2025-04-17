exports.up = (pgm) => {
  pgm.createTable('veterinarians', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },

    crmv: {
      type: 'varchar(20)',
      notNull: true,
      unique: true,
    },

    speciality: {
      type: 'varchar(60)',
    },

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
      unique: true,
      references: '"users"(id)',
    },
  });
};

exports.down = false;
