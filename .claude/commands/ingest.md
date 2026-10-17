---
description: Ingest new sources from raw/ into the wiki
argument-hint: "[raw/file ... | all]"
---
Follow the Ingest operation in AGENTS.md for: $ARGUMENTS

First `git pull origin main` (new files are usually uploaded on GitHub).
If no file is named, run `python3 wiki.py status` and take the raw files not
yet ingested, oldest first, one at a time. For each one: summarise the main
takeaways for me and ask what matters before writing (unless I said "all"),
create the source page with `wiki.py new source "<title>" --raw <file>`,
update every concept, entity and idea page it affects, record contradictions
instead of overwriting, update `wiki/overview.md` if needed, then run
`wiki.py index`, `wiki.py graph` and `wiki.py log ingest`. Finish with `wiki.py lint`, commit
the pages you wrote, push to `main` if this is a cloud session (see
AGENTS.md, "Saving and sharing"), and give a short list of pages created and
changed.
