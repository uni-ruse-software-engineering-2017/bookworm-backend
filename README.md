# Bookworm back end REST API

Back-end project providing web services for driving an online platform for selling and reading e-books.

## Software Requirements

1. Node.js 8.12.0+
2. PostgreSQL 10.1
3. Redis 3.2+
4. Git client installed and configured with your GitHub account - [click for instructions](https://help.github.com/articles/connecting-to-github-with-ssh/)

The best way to install Node.js is with [nvm](https://github.com/creationix/nvm) - this will allow you to easily switch versions when needed.

Postgres and Redis should be run as services in order for the web application to start.

## How to install

1. `$ git clone git@github.com:uni-ruse-software-engineering-2017/bookworm-backend.git` - download the project
2. `$ cd bookworm-backend` - move into its directory
3. `$ npm i` - install the dependencies
4. Place the `.env` file which I gave you in the root folder of the project. This file contains the environmental variables which are required for connecting to the database and the Goodreads' API.

## How to run

The project is developed with [TypeScript](https://www.typescriptlang.org). This leads to a few differences with regular Node.js project written in plain JavaScript.

- You first have to compile your code before you see the changes
- You might encounter build errors resulting from the compiler complaining about wrong type used or an interface not matched
- You have to add type annotations to your code everywhere (except special cases)

The steps for running the server are as follows:

1. `$ npm run build` - this runs the compiler and produces JavaScript code which will be run by Node.js
2. Open your favourite Postgres client and create a database called `bookworm`.
3. `$ npm run sync-db` - this will create the database tables form the SequelizeJS models - **all your tables will be dropped and re-created - you will lose all the records from the database if you have any!**
4. `$ npm run seed` - this will insert test data into the database
5. `$ npm start` - this will start your web server on port 3000. You can now dispatch HTTP requests to the REST API.

**Steps 2. and 3. are required only the first time you start the project!**

If you want the server to restart automatically and see your changes instantly while you are developing,
you can use the command:

`$ npm run watch`

## How to test

You can run all the tests once with:

`$ npm test`

While you are developing it's useful for the tests to be automatically run on each code change,
you can do that with the following command:

`$ npm run watch-test`

The tests are run on an in-memory (RAM only) database and all the test cases clear the database before being run. Your Postgres database won't be affected by running your tests.

## Folder structure

- `~ (root)` - contains configuration files for the Jest test runner, TypeScript compiler and the `package.json` file.
- `/dist` - contains the compiled JavaScript files - **you should not edit or commit these files!**
- `/src` - contains the TypeScript source code
  - `app.ts` - contains the main function which bootstraps the web application
  - `rest-api.ts` - contains REST API endpoint declarations
  - `/config` - contains configuration files
  - `/middleware` - contains middleware functions which intercept incoming HTTP requests and execute actions according to the input
  - `/models` - contains SequelizeJS models which define the database tables and the relations between them
  - `/modules` - contains the features of the application - each module has services, controllers and tests
  - `/seeders` - contains scripts which import test data into the database for easier testing
  - `/services` - reusable services which are used in many feature modules
  - `/util` - contains small functions which do one thing

## npm packages used

These are the external dependencies used in the project. I advice you to read about all of them before starting to develop features.

- [Koa](https://koajs.com/) - minimalistic web framework based on middleware functions
- [SequelizeJS](http://http://docs.sequelizejs.com/) - ORM for Node.js
- [sequelize-typescript](https://www.npmjs.com/package/sequelize-typescript) - TypeScript bindings for SequelizeJS which allow us to use annotations and types to express our database schema in a similar manner as in Java
- [ioredis](https://github.com/luin/ioredis) - Redis client for Node.js
- [Jest](https://jestjs.io) - JavaScript test framework
