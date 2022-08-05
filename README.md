# `Notifications System`

## Description

Queued asynchronous notifications system

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

## Packages

### [Notifications Core](./packages/core/README.md)

### Transports

- [Nodemailer transport](./packages/transport/mailer/README.md)
