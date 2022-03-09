# Scrum Poker Server

## Description

Real Time server using Graphql subscriptions to manage scrum poker partys.

## Features

- Nest.js
- GraphQL (code first approach)
- Redis
- Typescript

## Prerequisites

> 💡 If you want to use Redis and Docker Image.  
> You can also create `graphql-subscription` PubSub instance instead

- Docker: [Link](https://www.docker.com/products/docker-desktop)

## Environment variables

> 💡 Default port is 9000 if you don't provide PORT variable

```bash
PORT=9000
REDIS_PORT=6379
REDIS_HOST=localhost
```

Paste this content in a `.env` file previously created or run `cp .env.example .env` in your terminal since the project folder.

## Installation

```bash
$ yarn install
```

## Running the app

```bash
# development
$ yarn start

# watch mode
$ yarn start:dev

# production mode
$ yarn start:prod

# debug mode
$ yarn start:debug
```

> 🚀 By default, run http://localhost:9000/graphql to launch the playground.

> Another playground working with new `graphql-ws` is avaible at http://localhost:9000/graphql/subscriptions  
> Original html code: https://gist.github.com/enisdenjo/a68312878fdc4df299cb0433c60c1dea#file-graphiql-over-ws-html)  
> Thanks to @enisdenjo for this great work 🙏

## Test

```bash
# unit tests
$ yarn test

# e2e tests
$ yarn test:e2e

# test coverage
$ yarn test:cov
```

## Dev environment

This project contain workflows set to my personnal usage. Don't hesitate change by your own config

#### ⚙️ Tools list:

- ESLint / Prettier (base Nest config)
- Husky hooks:
  - pre-commit:
    - can't commit on dev or master branch
    - format with prettier
    - check code linting with eslint
  - pre-push:
    - build project before push work
  - prepare-commit-msg:
    - run commitizen cli to write commits
- commitizen:
  - config cz-emojis
    > 💡 You have not to launch git cz to run commitizen cli. A Git hook is intalled on `git commit` cmd. In this way, you can change the message at the end of the process with vim
- GitHub actions:
  - Pull requests on dev and master branches:
    - check code linting
    - build the project
