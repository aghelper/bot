FROM node:14-slim as base
#Project name to build and start
ARG PROJECT
ENV PROJECT ${PROJECT}
# Create and change to the app directory.
WORKDIR /app

# Copy application dependency manifests to the container image.
# A wildcard is used to ensure both package.json AND package-lock.json are copied.
# Copying this separately prevents re-running npm install on every code change.

# Copy local code to the container image.
COPY . .

# Install dependencies.
# If you add a package-lock.json speed your build by switching to 'npm ci'.
#RUN npm ci --only=production
#RUN yarn global add @nestjs/cli
RUN yarn install


FROM base

ARG PROJECT
ENV PROJECT ${PROJECT}

WORKDIR /app

RUN yarn build ${PROJECT}
# Expose API port
EXPOSE 3000

# Run the web service on container startup.
CMD node dist/apps/${PROJECT}/main.js