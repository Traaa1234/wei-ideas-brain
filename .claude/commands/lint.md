---
description: Weekly health check of the wiki
---
Follow the Lint operation in AGENTS.md. Run `python3 wiki.py lint` and fix
what it reports (ask me before archiving or merging pages). Then check for
contradictions, superseded claims, frequently mentioned concepts without a
page, and thin pages; run `wiki.py graph` and use its unconnected pages,
suggested links and unlinked mentions. End with the three questions or
sources most worth adding next, then `wiki.py index`, `wiki.py graph` and
`wiki.py log lint`.
