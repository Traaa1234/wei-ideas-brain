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
- next action: set up the USD paper portfolio in "Cheapest falsification test" and confirm the threshold
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

## Wei's constraints

- Trades US-listed ETFs only; measures returns in USD (Wei, 2026-10-26).
- So B3-listed funds (BOVA11, SMAL11) are out; the usable set is EWZ, FLBR, EWZS ([[brazil-equity-etfs]]).
- USD returns already include the BRL/USD move: a cheap Brazil market can still lose money in USD if the real falls. [hypothesis that BRL is a major driver of USD returns; check by comparing EWZ with the Ibovespa in BRL]

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
   multiple; EWZS gives that exposure in USD ([[brazil-equity-etfs]]).
   [hypothesis that small caps rerate more when rates fall]
5. **Quality-filtered value screen** (outside Wei's ETF-only rule; would need US-listed ADRs). Low P/E, P/B or EV/EBITDA *plus* a
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
- [hypothesis] BRL moves do not wipe out the equity gain in USD; check by: compare EWZ's USD return with the Ibovespa's BRL return over the same periods.
- [hypothesis] A quality filter improves results over pure cheapness; check by: paper portfolio test below.

## Risks

- Value trap: cheap because earnings are falling; early warning sign: earnings estimates cut while price is flat ([[value-traps]]).
- Fiscal and political risk, election-year volatility, high rates ([[brazil-country-risk]]).
- Currency risk: Wei measures in USD, so a weaker real directly cuts returns.
- Concentration: Petrobras, Vale and the big banks dominate the broad ETFs [hypothesis; check holdings].

## Simple economics

- ETF fees: 0.19% to 0.59% a year [source, verify] | brokerage: [guess, check broker]; no FX step needed since the ETFs trade in USD | tax: depends on Wei's country [unknown]

## Cheapest falsification test

Paper portfolio in USD, no money: on a set date, record the price of EWZ,
FLBR and EWZS, plus a broad emerging-markets ETF as the benchmark (which one
is Wei's choice). Note the Ibovespa forward P/E and its discount to the
historical average on that date (from a broker strategy note).
Check total return in USD at 6 and 12 months.
Fail if the cheapest Brazil option does not beat the benchmark by at least
3 percentage points over 12 months [threshold is a guess; Wei to confirm
before starting]. Cost: about an hour to set up, plus a few minutes a month.

## Open questions

- Which emerging-markets ETF should be the benchmark?
- Is there a currency-hedged Brazil ETF, and would it suit a USD investor? (to research)
- Is the April 2026 discount still there now (after the October 2026 election)?

## Verdict history

- 2026-10-26: entered, no verdict yet
