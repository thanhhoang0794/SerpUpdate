FROM node:18

# Install yarn@4.5.3
RUN corepack enable && corepack prepare yarn@4.5.3 --activate

RUN mkdir -p /home/app

WORKDIR /home/app

COPY package.json .
COPY yarn.lock .
COPY .yarnrc.yml .
COPY .yarn .

RUN yarn install --immutable

# Bundle app source code
COPY . .

RUN yarn build

# expose default port of serve command
EXPOSE 3000

CMD [ "yarn", "start"]
