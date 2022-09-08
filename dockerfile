#-----------------------------------------------------------------------------------------------------------------------
# Base Layer
#
# Contains configuration required by both the development and production layers.
#-----------------------------------------------------------------------------------------------------------------------
FROM ghcr.io/guardiandirect/app-base-node/app-base-node:v0.2.7 AS base

WORKDIR /usr/src/app
COPY package.json .
COPY yarn.lock .

# Leverage the Docker build-kit caching functionality to dramatically decrease build time (after the intial build)
RUN --mount=type=cache,target=/root/.yarn YARN_CACHE_FOLDER=/root/.yarn yarn install --production --immutable

HEALTHCHECK CMD curl --fail http://localhost:3000/api/healthz || exit 1

EXPOSE 8000

#-----------------------------------------------------------------------------------------------------------------------
# Development Layer
#
# Contains all artifacts and configuration required to run the application in development mode. i.e. All node
# development dependencies are installed, logging is set to debug, log output is put into "pretty" mode etc.
#-----------------------------------------------------------------------------------------------------------------------
FROM base AS development

# Force all dependencies to be installed since this stage can be leverage for debugging
ENV NODE_ENV development
ENV GENERATE_SOURCEMAP=true

# Take the production dependencies already installed in the previous layer
COPY --from=base /usr/src/app/node_modules ./node_modules

# Leverage the Docker build-kit caching functionality to dramatically decrease build time (after the intial build)
RUN --mount=type=cache,target=/root/.yarn YARN_CACHE_FOLDER=/root/.yarn yarn install --immutable

# Explicity directory copying to avoid annoying build cache-busting when using `COPY . .`
COPY prisma prisma
COPY public public
COPY src src
COPY .eslintignore .eslintignore
COPY .eslintrc.json .eslintrc.json
COPY .prettierignore .prettierignore
COPY .prettierrc .prettierrc
COPY entrypoint.sh entrypoint.sh
COPY nest-cli.json nest-cli.json
COPY package.json package.json
COPY server-preload.js server-preload.js
COPY tsconfig.build.json tsconfig.build.json
COPY tsconfig.json tsconfig.json
COPY yarn.lock yarn.lock

# Generate Prisma client files
RUN yarn generate:prisma-client

# Build production version of the application
RUN yarn build

# File require for runtime, but are not needed for build
COPY ./entrypoint.sh .
COPY ./server-preload.js .

RUN ["chmod", "+x", "./entrypoint.sh"]
ENTRYPOINT ["/usr/src/app/entrypoint.sh"]

# Ensure logging is loaded, and configured, before application starts in development mode
CMD ["node", "--require", "./server-preload.js", "/usr/src/app/dist/main.js"]

#-----------------------------------------------------------------------------------------------------------------------
# Production Layer
#
# Contains only those artifacts required for the applicaiton to run in producition. This results in the smallest image
# needed to satisfy production requirements.
#-----------------------------------------------------------------------------------------------------------------------
FROM base AS production

RUN adduser -D appuser

# Force only production dependencies to be installed as this is the distributable stage of the image
ENV NODE_ENV production
ENV GENERATE_SOURCEMAP=false

# Copy the previously built application output
COPY --from=development /usr/src/app/node_modules ./node_modules
COPY --from=development /usr/src/app/dist ./dist
COPY --from=development /usr/src/app/prisma ./prisma

# File require for runtime, but are not needed for build
COPY ./entrypoint.sh .
COPY ./server-preload.js .

RUN ["chmod", "+x", "./entrypoint.sh"]
ENTRYPOINT ["/usr/src/app/entrypoint.sh"]
EXPOSE 8000

USER appuser

# Ensure logging is loaded, and configured, before application starts in production mode
CMD ["node", "--require", "./server-preload.js", "/usr/src/app/dist/main.js"]
