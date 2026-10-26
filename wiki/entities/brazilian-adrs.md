---
title: Brazilian ADRs
type: entity
summary: Brazilian companies whose shares trade in USD on US exchanges (ADRs), the single-stock universe for Wei
created: 2026-10-26
updated: 2026-10-26
status: seed
sources:
  - https://topforeignstocks.com/foreign-adrs-list/the-full-list-of-brazilian-adrs/
  - https://WWW.NYSE.COM/publicdocs/nyse/data/CurListofallStocks.pdf
---

# Brazilian ADRs

- kind: market (US-listed depositary receipts of Brazilian companies)
- link: list at [topforeignstocks](https://topforeignstocks.com/foreign-adrs-list/the-full-list-of-brazilian-adrs/) (third party, dated 3 May 2026; check tickers against the exchange)

## NYSE-listed names (per the list above)

| Ticker | Company | Sector |
|---|---|---|
| PBR | Petrobras | oil and gas |
| VALE | Vale | mining |
| ITUB | Itaú Unibanco | banks |
| BBD | Banco Bradesco | banks |
| BSBR | Santander Brasil | banks |
| ABEV | Ambev | beverages |
| SBS | Sabesp | water utility |
| EBR | Eletrobras | electricity |
| CIG | Cemig | electricity |
| GGB | Gerdau | steel |
| SID | CSN | steel |
| SUZ | Suzano | pulp and paper |
| BAK | Braskem | chemicals |
| ERJ | Embraer | aircraft |
| UGP | Ultrapar | fuel distribution |
| VIV | Telefônica Brasil | telecom |
| TIMB | TIM | telecom |

- Some Brazilian names trade only over the counter (e.g. BDORY Banco do Brasil, BOLSY B3) per the same list. [hypothesis: OTC names have wider spreads and less reporting; prefer NYSE names]
- An older NYSE listings file also shows EBR, ABEV, SBS, CIG, SUZ, VIV, TIMB, UGP and VALE ([NYSE](https://WWW.NYSE.COM/publicdocs/nyse/data/CurListofallStocks.pdf)).

## How it connects

- [[brazil-value-stocks-and-etfs]]: the universe for the single-stock screen.
- [[value-screening]]: how to rank them.
- [[brazil-country-risk]]: some are state-controlled or regulated. [hypothesis; check each]
