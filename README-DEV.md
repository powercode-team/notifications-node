## Development

### Prepare with Lerna

- `yarn`
- `lerna run link`
- `lerna link`
- `lerna bootstrap`

### Build for Development

- `lerna run build-dev`
- `lerna run rebuild-dev`

### Build for Production

- `lerna run build`
- `lerna run rebuild`

### Lerna Publish

- `lerna run rebuild && lerna publish --force-publish`

## Nest Demo project

- `cd nest.sample`
- `cp .env.dist .env`
- `yarn dev-link`
- `yarn`
- `yarn build`
- Start demo container: `docker-compose up -d`
- Copy migrations from library to project migrations directory:
 `cp ./node_modules/@node-notifications/storage-typeorm-0.2/lib/migrations/*.js ./migrations/`
- Run Migrations: `./node_modules/.bin/typeorm migration:run`
- [Check sent emails](http://localhost:8025/)
- [Open demo](http://localhost:3000/mail) and <b>Send test email</b>
- Stop demo container: `docker-compose down`
