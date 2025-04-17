exports.up = (pgm) => {
  pgm.createType('status_type', ['scheduled', 'completed', 'canceled']);

  pgm.createTable('appointments', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },

    date: {
      type: 'timestamptz',
      notNull: true,
    },

    status: {
      type: 'status_type',
      notNull: true,
      default: 'scheduled',
    },

    vet_id: {
      type: 'uuid',
      notNull: true,
      references: '"users"(id)',
    },

    pet_id: {
      type: 'uuid',
      notNull: true,
      references: '"pets"(id)',
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
  });
};

exports.down = false;
