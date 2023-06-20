/* eslint-disable @typescript-eslint/no-var-requires */
require('dotenv').config();

module.exports = {
  type: process.env.DB_TYPE,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  logging: false,
  synchronize: false,
  entities: [__dirname + '/../node_modules/@node-notifications/storage-typeorm-0.2/lib/entity/*.entity.js'],
  migrations: [__dirname + '/../node_modules/@node-notifications/storage-typeorm-0.2/lib/migrations/2022080103001-notification.js'],
};
