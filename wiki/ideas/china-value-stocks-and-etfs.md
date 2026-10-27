---
title: China value stocks and ETFs
type: idea
summary: Finding US-listed Chinese stocks and China ETFs with low P/E, screened for quality, measured in USD against EEM
created: 2026-10-27
updated: 2026-10-27
status: seed
stage: research
verdict: none yet
confidence: low
sources:
  - raw/2026-10-27-finviz-china-snapshot.md
  - https://www.ishares.com/us/products/239619/ishares-msci-china-etf
  - https://stockanalysis.com/etf/kweb/
  - https://etfdb.com/etf/FXI/
---

# Idea: China value stocks and ETFs

- stage: research
- next action: Wei confirms the rules and whether China gets its own paper test or joins the Brazil one
- shared with Jordi's Idea Lab: no

> Research notes only, not investment advice. Any buy or sell decision is Wei's.

## In Wei's words

"Also search for chinese ADRs and ETFs with low PE."

## Wei's constraints

- Assumed the same as the Brazil idea: US-listed, measured in USD, EEM as
  benchmark ([[brazil-value-stocks-and-etfs]]). [assumption; Wei to confirm]

## Problem

- Chinese stocks have fallen a lot: KWEB -32% this year and -43% over a year,
  MCHI -18%, FXI -15% ([[finviz-china-snapshot-2026-10-26]]).
- Even so, the broad ETFs trade at about 11x to 13x trailing earnings
  (MCHI 12.6, FXI 11.3, KWEB 13.1) ([[china-equity-etfs]]), so China's ETFs
  are cheap but not as cheap as Brazil's after its crash (Ibovespa about
  8.5x forward [guess], [[brazil-value-stocks-and-etfs]]).

## Customer and buyer

- user: Wei, as a personal investor
- buyer: n/a

## Current alternatives

- Broad China ETF: MCHI, FLCH (0.19%, cheapest), GXC; see [[china-equity-etfs]].
- Single stocks: [[chinese-adrs]], screened with [[value-screening]].

## Stock screen (same rules as Brazil)

Rules: market cap at least $1bn (data covers $2bn and up); trailing P/E
above 0 and at most 11; ROE at least 12%; EPS growth this year above 0;
Debt/Equity at most 2 except banks, brokers and insurers. Data:
[[finviz-china-snapshot-2026-10-26]].

| Ticker | Company | P/E | ROE % | EPS growth % | Price 10-26 | Pass? |
|---|---|---|---|---|---|---|
| VIPS | Vipshop | 4.2 | 24.5 | -21.9 | 12.63 | no, earnings falling |
| TAL | TAL Education | 6.3 | 23.8 | 43.0 | 10.24 | **yes** |
| TCOM | Trip.com | 8.3 | 15.3 | -48.1 | 39.91 | no, earnings falling |
| PUK | Prudential plc | 8.4 | 19.2 | 14.2 | 23.86 | **yes**, but a UK insurer tagged Hong Kong |
| PDD | PDD Holdings | 8.7 | 22.9 | -5.6 | 78.13 | no, earnings falling |
| FUTU | Futu | 10.0 | 30.9 | -2.9 | 101.34 | no, earnings falling |
| TME | Tencent Music | 10.2 | 11.0 | -17.8 | 8.48 | no |
| ZTO | ZTO Express | 10.9 | 16.1 | 21.7 | 19.98 | **yes** |
| QFIN | Qifu | 1.35 | 15.2 | -58.2 | 5.57 | no, under $1bn, earnings falling |

- Only 3 names pass (TAL, PUK, ZTO), and PUK is arguably not a Chinese company.
- Most cheap Chinese stocks are cheap because earnings are falling: the
  classic [[value-traps]] warning. [hypothesis]
- On forward P/E, some big names look cheap that fail on trailing P/E:
  JD 6.2, PDD 6.4, FUTU 8.1, ZTO 8.8, TME 9.0, BABA 10.9
  ([[finviz-china-snapshot-2026-10-26]]). A forward-P/E screen would pick
  them, but relies on analyst forecasts. [hypothesis]

## Approaches worth exploring

1. **Cheapest broad ETF.** FLCH (0.19%) instead of MCHI (0.59%) or FXI (0.74%) for the same broad exposure. [hypothesis that the indexes perform alike; check holdings]
2. **Ex state-owned.** CXSE (0.32%) excludes state-owned firms. [hypothesis that state-owned firms drag returns]
3. **Forward-P/E screen of large caps** (JD, PDD, BABA, ZTO, TME) instead of trailing P/E. [hypothesis]
4. **State banks via OTC ADRs** (ICBC, CCB, Bank of China): about 6-8x earnings, 0.5-0.8x book, 4-5% yields, but not exchange-listed; see [[china-bank-stocks]].
5. **Mainland A-shares (ASHR)** fell far less this year (-6%) than US-listed China (-18% to -32%). [hypothesis: a different market with different drivers]

## Evidence (sourced)

- Prices, returns, fees and stock metrics: [[finviz-china-snapshot-2026-10-26]].
- ETF P/Es: [[china-equity-etfs]].

## Assumptions (hypotheses)

- [hypothesis] The 2026 fall is an overreaction rather than the start of lower earnings; check by: whether 2027 estimates hold.
- [hypothesis] Delisting and regulatory risk is already in the price; check by: [[china-country-risk]].

## Risks

- Regulatory and legal-structure risk ([[china-country-risk]]).
- Value traps: falling earnings at most of the cheapest names (screen above).
- Unknown cause of the 2026 fall; early warning sign: further falls in KWEB without earnings cuts would point to policy, not business.

## Simple economics

- ETF fees 0.19% to 0.74% [source] | brokerage: [guess, check broker] | no FX step (USD) | tax: depends on Wei's country [unknown]

## Cheapest falsification test

Add a China arm to the Brazil paper portfolio
([[brazil-value-stocks-and-etfs]]), same date, same rules, in USD:
(a) FLCH or MCHI, (b) the stocks that pass the screen (TAL, ZTO, and PUK
if Wei keeps it), benchmark EEM. Fail if neither beats EEM by at least 3
percentage points over 12 months [threshold is a guess; Wei to confirm].

## Open questions

- Why did Chinese internet and fintech stocks fall so much in 2026?
- Does EEM already hold a lot of China, which would make it a weak benchmark for a China arm? [hypothesis; check EEM's country weights]
- Keep PUK, or exclude non-Chinese companies tagged Hong Kong?
- Widen "US-listed" to include OTC ADRs, so the big Chinese banks qualify ([[china-bank-stocks]])?

## Verdict history

- 2026-10-27: entered, no verdict yet
