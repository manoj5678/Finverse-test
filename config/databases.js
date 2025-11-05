const path = require('path');

const databaseOptions = {
  logging: false,
  pool: {
    max: 10,
    min: 0,
    acquire: 60000,
    idle: 10000,
  },
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
};

module.exports = [{
  name: 'default',
  modelsDir: path.resolve(__dirname, '../models'),
  connection: {
    url: process.env.DATABASE_URL,
    options: databaseOptions,
  },
}];