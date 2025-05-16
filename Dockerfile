FROM node:18-alpine

# Install yarn@4.5.3
RUN corepack enable && corepack prepare yarn@4.5.3 --activate

WORKDIR /home/app

# Copy only necessary files for installing dependencies
COPY package.json .
COPY yarn.lock .
COPY .yarnrc.yml .
COPY .yarn .

# Install dependencies and clean cache
RUN yarn install --immutable && \
    yarn cache clean

# Copy source code
COPY . .

# Build the application
RUN yarn build && \
    # Clean up unnecessary files after build
    rm -rf node_modules/.cache && \
    rm -rf .next/cache && \
    rm -rf .yarn/cache

ENV HOST=0.0.0.0

EXPOSE 3000

CMD [ "yarn", "start"]
