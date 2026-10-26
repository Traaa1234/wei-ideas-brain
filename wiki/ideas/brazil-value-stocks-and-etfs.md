---
title: Brazil value stocks and ETFs
type: idea
summary: Ways to find cheap, value-priced Brazilian stocks or ETFs without falling into value traps
created: 2026-10-26
updated: 2026-10-26
status: seed
stage: research
verdict: none yet
confidence: low
sources:
  - https://analisa.genialinvestimentos.com.br/analises-e-resultados/estrategia-em-acao-abril-de-2026/
  - https://investidor10.com.br/noticias/itau-bba-projeta-ibovespa-em-185-mil-pontos-em-2026-117963/
  - https://siblisresearch.com/data/ibovespa-pe-ratio/
  - https://etfdb.com/etf/EWZ/
  - https://www.etfcentral.com/compare-etfs/EWZ-vs-FLBR
---

# Idea: Brazil value stocks and ETFs

- stage: research
- next action: pick one approach below and run its falsification test on a paper portfolio (no money)
- shared with Jordi's Idea Lab: no

> Research notes only, not investment advice. Any buy or sell decision is Wei's.

## In Wei's words

"Ideas about finding value cheap Brazilian stocks or ETFs."

## Problem

- Brazilian equities look cheap on earnings against their own history; the
  question is whether that is an opportunity or a permanent discount.
  - Genial (April 2026): Ibovespa about 9.3x forward P/E vs a 10.5x
    historical average; 11.2x vs 11.7x excluding Petrobras and Vale
    ([Genial](https://analisa.genialinvestimentos.com.br/analises-e-resultados/estrategia-em-acao-abril-de-2026/)) [source, from search summary; verify]
  - Genial (February 2026): 10.6x vs 10.5x, so the discount moves a lot
    within months ([Genial](https://analisa.genialinvestimentos.com.br/analises-e-resultados/estrategia-em-acao-fevereiro-de-2026/)) [source, from search summary; verify]
  - Itaú BBA (early 2026): 9.3x vs 10.4x average, also below other emerging
    markets; thesis rests on Selic cuts
    ([Investidor10](https://investidor10.com.br/noticias/itau-bba-projeta-ibovespa-em-185-mil-pontos-em-2026-117963/)) [source, from search summary; verify]
  - Siblis: Brazilian earnings growth has been weak in recent years, one
    reason the discount persists ([Siblis](https://siblisresearch.com/data/ibovespa-pe-ratio/)) [source, from search summary; verify]

## Customer and buyer

- user: Wei, as a personal investor (or a future tool/newsletter for others [hypothesis])
- buyer: n/a for personal use

## Current alternatives

- Buy a broad Brazil ETF and own the whole discount: see [[brazil-equity-etfs]].
- Screen single stocks on multiples: see [[value-screening]].
- Pay for broker research (Genial, Itaú BBA, XP publish monthly strategy notes; links above).

## Approaches worth exploring

1. **Broad ETF, timed on the discount.** Hold a Brazil ETF only when the
   index forward P/E is below its own historical average by a set margin.
   [hypothesis]
2. **Cheap ETF over cheap stocks.** Compare fees first: FLBR is listed at
   0.19% vs EWZ at 0.59% ([etfcentral](https://www.etfcentral.com/compare-etfs/EWZ-vs-FLBR)) [source, verify on issuer page].
3. **Ex-commodities view.** Judge "cheap" on the index excluding Petrobras
   and Vale, since they pull the headline multiple down (Genial, above).
   [hypothesis that this is the fairer measure]
4. **Small caps.** Genial reports small caps below their own average
   multiple; EWZS / SMAL11 give that exposure ([[brazil-equity-etfs]]).
   [hypothesis that small caps rerate more when rates fall]
5. **Quality-filtered value screen.** Low P/E, P/B or EV/EBITDA *plus* a
   quality filter (ROE, low debt, positive cash flow) to avoid
   [[value-traps]]. [hypothesis]
6. **Dividend value.** High, covered dividend yields; check payout ratio and
   whether the company is state-controlled ([[brazil-country-risk]]). [hypothesis]
7. **Rate-cut play.** If the Selic falls, domestic-facing sectors (banks,
   retail, utilities) may rerate more than exporters (Itaú BBA thesis, above).
   [hypothesis]

## Evidence (sourced)

- Forward P/E below history in early/mid 2026 per Genial and Itaú BBA (links above) [source, from search summary; verify].
- EWZ tracks MSCI Brazil 25/50, large and liquid companies ([etfdb](https://etfdb.com/etf/EWZ/)) [source].

## Assumptions (hypotheses)

- [hypothesis] The discount to history mean-reverts within 1 to 3 years; check by: backtest past discount periods.
- [hypothesis] Currency (BRL) moves do not wipe out the equity gain for a foreign investor; check by: compare EWZ (USD) with BOVA11 (BRL) returns.
- [hypothesis] A quality filter improves results over pure cheapness; check by: paper portfolio test below.

## Risks

- Value trap: cheap because earnings are falling; early warning sign: earnings estimates cut while price is flat ([[value-traps]]).
- Fiscal and political risk, election-year volatility, high rates ([[brazil-country-risk]]).
- Currency risk for anyone not earning in BRL.
- Concentration: Petrobras, Vale and the big banks dominate the broad ETFs [hypothesis; check holdings].

## Simple economics

- ETF fees: 0.19% to 0.59% a year [source, verify] | brokerage and FX costs: [guess, check broker] | tax: depends on Wei's country [unknown]

## Cheapest falsification test

Paper portfolio, no money: on a set date, record (a) EWZ or FLBR and (b) the
10 cheapest Ibovespa stocks that pass the quality filter in [[value-screening]].
Compare with each other and with a world ETF after 6 and 12 months.
Fail if (b) does not beat (a) by at least 3 percentage points over 12 months
[threshold is a guess; Wei to confirm before starting]. Cost: about an hour
to set up, plus a few minutes a month.

## Open questions

- Which exchange can Wei actually trade (US-listed ETFs vs B3-listed)?
- Which currency does Wei measure returns in?
- Is the April 2026 discount still there now (after the October 2026 election)?

## Verdict history

- 2026-10-26: entered, no verdict yet
