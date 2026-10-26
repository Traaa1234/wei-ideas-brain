---
title: Value screening
type: concept
summary: Filtering stocks by valuation multiples plus quality checks to find cheap but sound companies
created: 2026-10-26
updated: 2026-10-26
status: seed
sources:
  - https://finviz.com/help/screener.ashx
  - https://www.tradingview.com/support/solutions/43000718866-what-is-the-stock-screener
---

# Value screening

## What it is

Ranking stocks by how cheap they are against earnings, book value or cash
flow, then removing the ones that are cheap for a good reason. A screen
narrows the list; it does not decide.

## Common filters

- Cheapness: P/E, P/B, EV/EBITDA, free-cash-flow yield, dividend yield.
- Quality: return on equity, debt vs EBITDA, stable or rising earnings, positive cash flow.
- Liquidity: enough daily trading volume to buy and sell [hypothesis: matters more for Brazilian small caps].

## Free screeners for Wei's set (US-listed Brazilian ADRs and ETFs)

- Finviz: screener with exchange filter (NYSE, NASDAQ, AMEX) ([Finviz help](https://finviz.com/help/screener.ashx)); a country filter for Brazil appears to exist but is unconfirmed. Quote pages show P/E and dividends (e.g. [PBR](https://finviz.com/quote.ashx?t=PBR&ty=dv)). [check by: Screener -> Descriptive -> Country = Brazil]
- TradingView: screener with P/B, Debt/EBITDA and ROE filters ([TradingView](https://www.tradingview.com/support/solutions/43000718866-what-is-the-stock-screener)); Brazil filter for ADRs unconfirmed.
- Google Finance quote pages: P/E and dividend yield per ticker ([PBR](https://www.google.com/finance/quote/PBR:NYSE)).
- brapi.dev (free token, Python) and paid Apify screeners cover B3 local shares, not ADRs ([brapi](https://brapi.dev/blog/stock-screener-python-brapi-filtrar-acoes), [Apify](https://apify.com/nexgendata/b3-brasil-stock-screener)); outside Wei's US-listed rule.
- Rule: take every number for the test from **one** screener on **one** date, because sources disagree (PBR P/E: 6.29 on Google Finance vs 4.86 on Finviz, late Oct 2026, per search snippets).

## What the sources say

- No sources ingested yet; all filters above are standard practice, not yet linked to a source. [hypothesis]

## How it connects

- [[brazil-value-stocks-and-etfs]]: approach 5 uses this screen on [[brazilian-adrs]].
- [[value-traps]]: the quality filter exists to avoid them.

## Open questions and contradictions

- Does Finviz's Country = Brazil filter catch all NYSE-listed Brazilian ADRs? (Wei to check in the browser)
