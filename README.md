# `Notifications System`

## Description

Queued asynchronous notifications system

## Packages

### [Notifications Core](./packages/core/README.md)

### Transports

- [Nodemailer transport](./packages/transport/mailer/README.md)

### Storages

- [TypeORM v0.2](./packages/storage/typeorm-0.2/README.md)
- [TypeORM v0.3](./packages/storage/typeorm-0.3/README.md)

## Development

### Prepare

- `npm ci`
- `lerna link`
- `lerna bootstrap`

### Develop

- `lerna run rebuild-dev`

### Production

- `lerna run rebuild`

### Publish

- `lerna run rebuild && lerna publish`

## Nest Demo project

- `cd nest.sample`
- `cp .env.dist .env`
- `npm ci`
- `npm run rebuild`
- Start demo container: `docker-compose -f ../docker/docker-compose.yml up -d`
- Run migrations: `./node_modules/.bin/typeorm migration:run`
- [Open demo](http://localhost:3000/mail) and <b>Send test email</b>
- [See sent emails](http://localhost:58025/)
- Stop demo container: `docker-compose -f ../docker/docker-compose.yml down`
