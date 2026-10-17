---
description: Ingest new sources from raw/ into the wiki
argument-hint: "[raw/file ... | all]"
---
Follow the Ingest operation in AGENTS.md for: $ARGUMENTS

If no file is named, run `python3 wiki.py status` and take the raw files not
yet ingested, oldest first, one at a time. For each one: summarise the main
takeaways for me and ask what matters before writing (unless I said "all"),
create the source page with `wiki.py new source "<title>" --raw <file>`,
update every concept, entity and idea page it affects, record contradictions
instead of overwriting, update `wiki/overview.md` if needed, then run
`wiki.py index` and `wiki.py log ingest`. Finish with `wiki.py lint` and a
short list of pages created and changed.
