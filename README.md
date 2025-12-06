# Livefol.io

A tool to help you implement [Testfol.io](https://testfol.io/tactical) tactical allocation strategy by evaluating with
current market data.

## Getting Started

Steps to set up a local instance of [Livefol.io](https://livefol.io) for development:

1. Fill in remaining environment variables

   ```shell
   cp .env.example .env.local
   ```

2. Start mock external services

   ```shell
   docker compose up -d
   ```

3. Run development server

   ```shell
   npm run dev
   ```

### External Service Dependencies

Livefol.io depends on a few external services for storage, background tasks, cron jobs, etc., some of which are mockable
as Docker images. I recommend you follow the steps outlined in this section to run some of the external services
locally, so you don't have to go through registering billable services.

#### Yahoo Finance

Historical and real time market data are sourced from Yahoo Finance
through [yahoo-finance2](https://github.com/gadicc/yahoo-finance2). It's a community project unaffiliated with Yahoo, so
bear in mind that service availability and data consistency are not guaranteed. Nevertheless, it's been working well
since 2013 and free. On the other hand, Testfol.io sources most of its historical data from Tiingo, so there could be
slight discrepancies. No API key required.

#### Federal Reserve Economic Data of St. Louis (FRED®)

While Yahoo Finance provides most ticker data, some are sourced from [FRED®](https://fred.stlouisfed.org), particularly
inflation and some treasury yield rates. The tickers sourced from FRED are the same as those in Testfol.io. You will
need to provide your API key `FRED_API_KEY`.

#### Resend

For email related functionalities, we use [Resend](https://resend.com/). You will need to provide your API key
`RESEND_API_KEY`, as well as a sender email `NOTIFICATIONS_SENDER_EMAIL`.

#### Vercel Cron

We run periodic tasks, such as daily strategy evaluation and notification, which are powered
by [Vercel Cron](https://vercel.com/docs/cron-jobs). Vercel calls one of our API route handlers as defined in
`vercel.json` as an entry point to the tasks. You can manually trigger the API route handlers by using a tool like
Postman to do a GET request, and provide the cron secret defined in your set of environment variables in the
`Authorization` header as `Bearer <CRON_SECRET>`.

Here's an example for manually triggering the cron job `/api/cron/evaluation`:

```shell
curl -X GET \
  -H "Authorization: Bearer my_cron_secret" \
  http://localhost:3000/api/cron/evaluation
```

#### Neon Serverless Postgres

For the database, we use [Neon](https://neon.com) and
the [Neon serverless driver](https://neon.com/docs/serverless/serverless-driver). For local development, you can use the
containerized Postgres and Neon Proxy services defined in the `docker-compose.yml`. You will need to provide the
database URL `DATABASE_URL` or use the default in `.env.local` if running in Docker.

#### Upstash QStash

[Upstash QStash](https://upstash.com/docs/qstash/overall/getstarted) is used to run asynchronous background tasks, such
as sending
emails to subscribers as a result of a strategy evaluation. Like the cron jobs, an API route is defined as the entry
point. For local development and testing, you can use the containerized service defined in the `docker-compose.yml`
file. You will need to provide the environment variables `QSTASH_*` or use the default in `.env.local` if running in
Docker.

You can manually trigger a QStash job by publishing a message to the QStash service to call our API route handlers.
Here's an example for triggering `/api/subscribers/waitlisted` with default Docker configuration.

```shell
curl -X POST 'http://localhost:8080/v2/publish/http://localhost:3000/api/subscribers/waitlisted' \
    -H 'Authorization: Bearer eyJVc2VySUQiOiJkZWZhdWx0VXNlciIsIlBhc3N3b3JkIjoiZGVmYXVsdFBhc3N3b3JkIn0='
```

#### Upstash Redis

We use [Upstash](https://upstash.com) for our serverless Redis provider. We store cached evaluated values, so we don't
have to reevaluate signals and indicators for the same strategy more than once a day with expiry times at 4 pm ET. For
local development, you can use the containerized Redis and Serverless Redis HTTP (SRH). You will need to provide the
environment variables `UPSTASH_*` or use the default values in `.env.local` if running in docker.

## The Motivation

I came across the subreddit [r/LETFs](https://www.reddit.com/r/LETFs/) during my regular rabbit-hole binge on
investments. While lurking, I read upon [this](https://testfol.io/tactical?s=drGlXDcTL4r) strategy that truly perplexed
me. It managed to absolutely outperform the benchmark S&P 500 in terms of CAGR and max drawdown, and held up honorably
during market crises of 2008 and 2022.

Although the performance was impressive, the signals and allocations set for this strategy were all Greek to most of the
commenters, including me. I wanted to implement it for testing with a small account portfolio. First step to studying it
was to implement the signals, so I tried to build them on Trading view, a popular tool to build custom signals and
alerts. The next step was to evaluate the signals into the allocation conditions. With three different signals, each
with different indicators, evaluating four different allocations with 3 conditionals, it just became a headache to
implement. Not only do you become overwhelmed with signals, but the overwhelmingness also leads to emotional setback,
making you doubt your evaluations and therefore not take actions following the strategy.

I naturally thought it would be easier if there is a tool that can convert Testfol.io signals into TradingView
signals. Taking it a step further, what if there is a tool that just tells you exactly what assets to hold right now
following a Testfol.io strategy. That's when the idea of Livefol.io was born.