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

ARG NEXT_PUBLIC_APP_URL
ARG POSTGRES_PRISMA_URL
ARG SUPABASE_URL
ARG POSTGRES_URL
ARG POSTGRES_POOLER_HOST
ARG POSTGRES_POOLER_USER
ARG POSTGRES_PORT
ARG POSTGRES_PASSWORD
ARG POSTGRES_DATABASE
ARG POSTGRES_URL_NON_POOLING
ARG DATAFORSEO_LOGIN
ARG DATAFORSEO_PASSWORD
ARG SUPABASE_JWT_SECRET
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG HCAPTCHA_SITE_KEY
ARG ONEPAY_MERCHANT_PAYNOW_ID
ARG ONEPAY_MERCHANT_PAYNOW_ACCESS_CODE
ARG ONEPAY_MERCHANT_PAYNOW_HASH_CODE
ARG NEXT_PUBLIC_ONEPAY_BASE_URL
ARG NEXT_PUBLIC_ONEPAY_URL_PREFIX
ARG OPEN_EXCHANGE_RATE_API_KEY
ARG OPEN_EXCHANGE_RATE_BASE_URL
ARG SMTP_TO_EMAIL
ARG SMTP_TO_PASSWORD
ARG REDIS_URL

ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV POSTGRES_PRISMA_URL=$POSTGRES_PRISMA_URL
ENV SUPABASE_URL=$SUPABASE_URL
ENV POSTGRES_URL=$POSTGRES_URL
ENV POSTGRES_POOLER_HOST=$POSTGRES_POOLER_HOST
ENV POSTGRES_POOLER_USER=$POSTGRES_POOLER_USER
ENV POSTGRES_PORT=$POSTGRES_PORT
ENV POSTGRES_PASSWORD=$POSTGRES_PASSWORD
ENV POSTGRES_DATABASE=$POSTGRES_DATABASE
ENV POSTGRES_URL_NON_POOLING=$POSTGRES_URL_NON_POOLING
ENV DATAFORSEO_LOGIN=$DATAFORSEO_LOGIN
ENV DATAFORSEO_PASSWORD=$DATAFORSEO_PASSWORD
ENV SUPABASE_JWT_SECRET=$SUPABASE_JWT_SECRET
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV HCAPTCHA_SITE_KEY=$HCAPTCHA_SITE_KEY
ENV ONEPAY_MERCHANT_PAYNOW_ID=$ONEPAY_MERCHANT_PAYNOW_ID
ENV ONEPAY_MERCHANT_PAYNOW_ACCESS_CODE=$ONEPAY_MERCHANT_PAYNOW_ACCESS_CODE
ENV ONEPAY_MERCHANT_PAYNOW_HASH_CODE=$ONEPAY_MERCHANT_PAYNOW_HASH_CODE
ENV NEXT_PUBLIC_ONEPAY_BASE_URL=$NEXT_PUBLIC_ONEPAY_BASE_URL
ENV NEXT_PUBLIC_ONEPAY_URL_PREFIX=$NEXT_PUBLIC_ONEPAY_URL_PREFIX
ENV OPEN_EXCHANGE_RATE_API_KEY=$OPEN_EXCHANGE_RATE_API_KEY
ENV OPEN_EXCHANGE_RATE_BASE_URL=$OPEN_EXCHANGE_RATE_BASE_URL
ENV SMTP_TO_EMAIL=$SMTP_TO_EMAIL
ENV SMTP_TO_PASSWORD=$SMTP_TO_PASSWORD
ENV REDIS_URL=$REDIS_URL

# Build the application
RUN yarn build && \
    # Clean up unnecessary files after build
    rm -rf node_modules/.cache && \
    rm -rf .next/cache && \
    rm -rf .yarn/cache

ENV HOST=0.0.0.0

EXPOSE 3000

CMD [ "yarn", "start"]
