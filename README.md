## Description

## Technologies Leveraged

- Sendgrid
- Eslint
- Husky
- Jest
- NestJS
- nestjs-pino
- Node
- Okta
- Passport
- Postgres
- Prettier
- Prisma
- TypeScript
- Webpack (to enable Hot Module Replacement)

## Prerequisites & Package Management

Dependencies for this project are managed via `npm`. Ensure you have npm and Node installed. This project uses Node `v14.17.3` (LTS) and npm `v7.19.1`.

If you are on a unix based system, you can use `nvm` to install specific node versions using `nvm install 14.17.3`, followed by `nvm alias default 14.17.3`.

## Local Setup

- Clone this repository
- Setup the environment variables

Environment variable file should be named `.env`. For a reference of available environment variables, see the `.env.sample` file. The environment variables are:

| Variable                        | Description                                 |
| ------------------------------- | ------------------------------------------- |
| `IS_FULL_LOGS`                  | Flag to be used to display full logs        |
| us-east-1                       |
| `DATABASE_URL`                  | Connection string for Postgres database     |
| `EMAIL_PREVIEW_SERVER_PORT`     | PORT for `yarn run-email-preview` command   |
| `HELLOSIGN_API_KEY`             | HelloSign API Key, necessary for requests   |
| `NESTJS_PORT`                   | Server port for NestJS                      |
| `NODE_ENV`                      | Specifies the environment                   |
| `OKTA_APP_TOKEN`                | Okta application token                      |
| `OKTA_AUDIENCE`                 | Id for Okta service that handles JWT        |
| `OKTA_CLIENTID`                 | Okta application client id                  |
| `OKTA_DOMAIN`                   | Domain for Okta account                     |
| `OKTA_GROUP_USER`               | Id for Okta User group                      |
| `PASSWORD_RESET_API_KEY`        | API key necessary to access password routes |
| `PINO_LOG_LEVEL`                | Property for desired pinojs logging level   |
| `PUBLIC_ENVIRONMENT`            | The environment being deployed into         |
| `PUSH_NOTIFICATIONS_API_KEY`    | Guardian API token                          |
| `REPORTS_API_KEY`               | API Key necessary to access reports routes  |
| `SWAGGER_PASSWORD`              | Password to log into swagger ui on /docs    |
| `SWAGGER_USER`                  | Username to log into swagger ui on /docs    |
| `FILES_ENCRYPTION_TOKEN`        | Files encryption token                      |
| `FILES_ENCRYPTION_SECRET`       | Files encryption secret                     |
| `EMAILS_API_KEY`                | Emails API Key                              |
| `SENDGRID_API_KEY`              | Sendgrid Email API Key                      |

## Installation

```bash
$ npm install
```

## Initialize the Database and Apply Migrations

For the database setup, you must initialize Prisma with the following command:

```bash
npx prisma generate
```

The above command will connect to the database specified in `DATABASE_URL`, pulling from your local `.env` file. Make sure to include the Postgres username, password, and database name where appropriate.

`npx prisma generate` loads the Prisma schema from `prisma/schema.prisma`.

To create local postgres database, download the [Postgres App](https://postgresapp.com/downloads.html) and create a server. For more convenient management, you can use the [Postico](https://eggerapps.at/postico/) client. Alternatively, you can use the [Postgres CLI](https://www.postgresql.org/docs/current/app-psql.html) command `psql` directly to create a new database.

For this project, we are using the following databases:

- Local dev database: `nestjs-samplelocal` found at `postgresql://<username>:<password>@localhost:5432/<database-name>`
- Deployed dev database: `nestjs-sample-development-database` found at `postgresql://<username>:<password>@<dev URI>:<port>`
- Deployed staging database: `nestjs-sample-staging-database` found at `postgresql://<username>:<password>@<staging URI>:<port>`

The usernames and passwords for the deployed databases can be found in the Giant Machines 1Password.

In a **development environment**, use the `migrate dev` command to generate and apply migrations:

```bash
$ npx prisma migrate dev
```

`migrate dev` is a development command and should never be used in a production environment.

Creating a migration with a specific name, use the `generate:prisma-migration` to create and apply the migration. If you want to preview the migration before applying, use the `create:prisma-migration`.

```bash
$ npm run generate:prisma-migration -- name-of-migration

// Create only
$ npm run create:prisma-migration -- name-of-migration
```

**Note: the above steps need to be run before running the backend server. Without initializing Prisma, you will encounter an error when trying to run `npm run start`.**

```

## Running the server

During local development, it is recommended that you run the `npm run dev` command to take advantage of Hot Module Replacement, as well as the automatic TypeScript generation. This allows you to avoid having to re-run the build command after you make a change to see the latest version of the application.

The default NESTJS_PORT provided in the `.env.sample` file points to port `8000`. You can navigate to `localhost:8000/api` to verify that the server is running properly.

```bash
# development
$ npm run start

# watch mode with HMR
$ npm run dev

# production mode
$ npm run start:prod
```

## Running debug mode

Change in `.env`, `NODE_ENV=debug`, without this you will get the following error:
`Error: ENOENT: no such file or directory, open '[projects]/nestjs-sample-server/src/csv/data/[folder]/[file].csv'`

## Running the tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Working with HTML Emails

This repo uses React, [Mjml](https://mjml.io/) and [Mjml-React](https://github.com/wix-incubator/mjml-react) for HTML email templating.

To render the emails in the browser during development, run `yarn run-email-preview`. This will start a server on `localhost:<EMAIL_PREVIEW_SERVER_PORT env>`. You can modify which port the server runs on by changing the EMAIL_PREVIEW_SERVER_PORT environment variable. Consult the routes in `src/email-templates/email-preview-server.ts` to see which paths are available at `localhost:4000/<path-names>`.

## Adding Logs

This repo takes advantage of [nestjs-pino](https://github.com/iamolegga/nestjs-pino) for our logger. This provides more granular control on the type of logs, and the amount of data in each log compared to the standard NestJs logger.

To add the logger to a service or controller, the following is recommended:

```ts
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class SampleService {
  // inject logger into service
  constructor(private readonly logger: PinoLogger) {
    // set the logging context using the Service/Controller name
    this.logger.setContext(SampleService.name);
  }

  // in your methods, you know have access to the following methods:
  // this.logger.trace | this.logger.debug | this.logger.info | this.logger.warn | this.logger.error | this.logger.fatal
}
```

Note that we are tracking alerts in AWS. Anytime you encounter an error, ensure that you are using `this.logger.error` to trigger these alerts.

## Using the authorized endpoints in Postman

The authorized endpoints in Postman require a JWT (JSON Web Token), provided by Okta, attached to the headers of the request. By default, the Okta access token (which is in JWT format) expires in 60 minutes. In order to refresh the token for a given route in Postman, go to the `Authorization` tab, click on the `Get New Access Token` button at the bottom of the window, log into Okta as prompted with your newly created user email, select `Open Postman` in the pop-up window, select `Proceed` and finally click on the `Use Token` button. This will place the current access token in the headers of the request. When logging into Okta, you can use the credentials for any user that has been registered in Okta and exists in the database.

Additionally, certain endpoints (i.e for reports or resetting your password) are not authorized using the JWT method described above. These are endpoints that are required to be "open" but we added api keys in the form of an `X-API-KEY` header that needs to be sent with the request. These are already being included in the Postman requests. When running this server locally, ensure that the `REPORTS_API_KEY` and `PASSWORD_RESET_API_KEY` values match what is stored in AWS Secrets Manager if you'd like to test this functionality.

## NestJS CLI

Due to the fact that we are using the NestJS framework to build out the server-side application, it is recommended to install the NestJS CLI so that you can quickly generate new resources, controllers, etc. after becoming familiar with the NestJS API. To install the NestJS CLI globally, run the following command `npm install -g @nestjs/cli`.

For example, to quickly spin up a new resource or controller, you can use the following commands within the appropriate pod directory (i.e `src/podName`).

Generate a controller class:

```bash
nest g controller <insert-controller-name-here>
```

Generate a resource:

```bash
nest g resource <insert-resource-name-here>
```

For more information on the NestJS CLI and its available commands, please refer to the [documentation](https://docs.nestjs.com/cli/usages).

## Swagger API Documentation

You can view the Swagger UI at `http://localhost:<NESTJS_PORT>/docs`. If you'd like to view the JSON format of the API documentation, you can go to `http://localhost:<NESTJS_PORT>/docs-json`.

For all environments except production, you can view the Swagger API documentation at `api.<env>.benworks.io/docs` using the SWAGGER_USER AND SWAGGER_PASSWORD env variables, which are stored in 1Password.

For more information on how the `SwaggerModule` is used in NestJS, please refer to the [documentation](https://docs.nestjs.com/openapi/types-and-parameters).

Important Note: `reflect-metadata` must be installed otherwise you will get the following error:
`Error "@nestjs/swagger" plugin could not be found!`

## VS Code Autoformatting

Install the [Prisma Extension](https://marketplace.visualstudio.com/items?itemName=Prisma.prisma) to enable syntax highlighting & formatting for Prisma schema files.

To take advantage of Prettier, you can enable "format on save" in VS Code by having the following in your VS Code `settings.json` file:

```json
{
  "editor.formatOnSave": true,
  "[prisma]": {
    "editor.defaultFormatter": "Prisma.prisma"
  }
}
```

Note: We are using `lint-staged` on this project. As a result, we don't necessarily need to have `prettier` configured in our respective editors. lint-staged will take care of any auto formatting for you via the Husky pre-commit hook.

---

## Steps to test E2E flow locally:

1. Go through entire quote flow:
   - Use an accepted state and zipcode combo such as TX and 76542
   - Create new user with unique email and verify by clicking the link in the email and replace the domain with localhost:3000.
2. Go through application flow:
   - Use a unique 9 digit tax ID
   - Apply for Dental or Vision or Dental and Vision.
   - To bypass signing for both parties in the HelloSign e-signature step, update the following columns in your local database.
     - `status` to `PROCESS`
     - `transmission_guid` to any uuid string (https://www.uuidgenerator.net)
     - `master_application_signature_date` to today's date in mm/dd/yyyy format (Ex: `01/01/2022`)
     - master_agreement_number to a string of 8 digits that leads with 2 zeroes (Ex: `00123456`)
3. Once updated, refresh the employer dashboard screen and you should be able to proceed to invite employees
4. Invite at least 2 employees and set your enrollment date. Best to use your own email with + unique string (Ex: email+test123@mail.com). Here's a helpful [blog post](https://medium.com/giant-machines/instantly-create-gmail-addresses-for-testing-with-a-keyboard-shortcut-on-mac-os-12a02da8ec00) on how to create a keyboard shortcut to do so
5. Once set change the `selected_enrollment_start_date` to today which will then allow the sending of invitation emails
6. In Postman use Email / Queue Emails for Open Enrollment to trigger the emails (make you have it set to local and you have redis env variables setup locally)
7. Logout of your employer admin
8. Go to newly sent emails, click "Start Enrollment" and replace the domain with localhost:3000
9. Test employee enrollment
10. If you run out of employee invitations, go to your DB and copy one of the 2 invitations into a third invitation and increment the timestamp. Then copy the invitation email’s link and change the associated email to the newly incremented email.

---

## Common Issues

- If you get the error below on the BE, try setting `NODE_ENV=local-vscode` in your `.env` file

```
Error: ENOENT: no such file or directory, open '/Users/<mac-name>/Projects/data/dental/area.csv'
```

- If the database is not updating on HelloSign signature events, this usually indicates that you don't have a personal development API app in HelloSign, or that the event callback URL is outdated. Ensure that the HELLOSIGN_CLIENTID environment variable on your FE matches the ID associated with your API app.

- If you are experiencing odd routing behavior when arriving or trying to log on to the site, make sure you are not already logged in. Clear your cache and local storage and try again.

## Debugging/Troubleshooting checklist:

✅ Before checking out into the branch you're working on, did you pull the latest from the root branch? And is your working branch up to date with the latest?

✅ Are there any new packages you need to install by running `npm install` or `yarn install`?

✅ Did you run any necessary database migrations on the BE?

✅ Is your `.env` file up to date with the `.env-sample` file and are your local variables accurate? Check 1Password and AWS secrets.

✅ Did you run `npm run build` or `yarn build` before running `npm run dev` or `yarn dev`?

✅ Did you clear your cache and local storage?

✅ Is your server running on the associated and up to date branch?

✅ Do you have a HelloSign API app for development? Is ngrok running? Is your HelloSign event callback URL up to date with the ngrok forwarding URL?

✅ Did you try deleting your `node_modules` folder and `package.lock.json` file and reinstalling?

** _For unexplainable local VSCode errors try_: **

✅ Restarting the TypeScript server: **⌘P → ">TypeScript: Restart TS server" → Select and press enter**

✅ Restarting the ESLint Server: **"⌘P →"ESLint: Restart ESLint server" → select and press enter**
