require('dotenv').config();
const boolean = require('@notifications-system/core').boolean;

module.exports = {
  type: process.env.DB_TYPE,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  logging: boolean(process.env.DB_LOGGING),
  synchronize: boolean(process.env.DB_SYNC),
  entities: ['./**/*.entity.{ts,js}'],
  migrations: ['./migrations/*.js'],
};
