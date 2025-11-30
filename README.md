# Livefol.io

A tool to help you implement [Testfol.io](https://testfol.io/tactical) tactical allocation strategy by evaluating with
current market data.

## Getting Started

Steps to set up a local instance of [Livefol.io](https://livefol.io) for development:

1. Install dependencies

   ```shell
   npm i
   ```

2. Fill in environment variables

   ```shell
   cp .env.example .env.local
   ```

3. (Optionally) Run QStash development server.

   ```shell
   npx @upstash/qstash-cli@latest dev
   ```

4. Run development server

   ```shell
   npm run dev
   ```

### Running cron handlers manually

[Vercel Cron](https://vercel.com/docs/cron-jobs) are used to run periodic tasks, such as daily strategy evaluation and
notification. Vercel calls one of our API route handlers as defined in `vercel.json` as an entry point to the tasks. You
can manually trigger the API route handlers by using a tool like Postman to do a GET request, and provide the cron
secret defined in the `.env` file in the `Authorization` header as `Bearer <CRON_SECRET>`.

### Running QStash development server

[Upstash QStash](https://upstash.com/docs/qstash/overall/getstarted) is used to run background tasks, such as sending
emails to subscribers as a result of a strategy evaluation. Like the cron jobs, an API route is defined as the entry
point. For local development and testing, You will need to locally run QStash development server in step (3). You will
need copy the given variables `QSTASH_TOKEN`, `QSTASH_CURRENT_SIGNING_KEY`, and `QSTASH_NEXT_SIGNING_KEY` to the .env
file.

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