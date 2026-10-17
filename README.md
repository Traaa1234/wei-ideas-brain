# Wei's Second Brain

A personal wiki that your AI assistant (Claude Code or Codex) writes and keeps
up to date from the sources you collect. You drop in articles, notes and
transcripts and ask questions. The assistant summarises, links, files and
checks the pages.

> **Privacy first.** If this GitHub repository is public, everything you
> commit is public. Before you add anything personal, open the repository on
> GitHub → **Settings** → **Danger Zone** → **Change visibility** → **Private**.

## How it is built

| Layer | Folder | Rule |
|---|---|---|
| Sources | `raw/` | Yours. The assistant reads it and never edits it. |
| Quick capture | `inbox.md` | One line per thought or link. |
| Wiki | `wiki/` | The assistant writes it and you read it. Pages link with `[[page-name]]`. |
| Schema | `AGENTS.md` | How the assistant works here. You change it together. |
| Decisions | `decisions/` | Only decisions you actually made. |

Inside `wiki/`: `overview.md` (the big picture), `index.md` (catalog, generated),
`log.md` (what happened, append-only), and folders `sources/`, `concepts/`,
`entities/`, `ideas/`, `questions/`.

## Everyday use

Open Claude Code in this folder (`claude`) and use:

| Command | What it does |
|---|---|
| `/ingest` | Turns new files in `raw/` into wiki pages. |
| `/capture` | Files the lines in `inbox.md`. |
| `/ask <question>` | Answers from the wiki with citations and offers to save the answer. |
| `/idea <idea>` | Starts or updates a business-idea dossier with sourced evidence. |
| `/lint` | Weekly health check: broken links, orphans, stale or contradictory pages. |
| `/review` | Short weekly summary of what changed. |

In Codex or any assistant without slash commands, say the same thing in words
("ingest the new sources", "lint the wiki"). `AGENTS.md` describes each
operation.

The assistant uses a small helper, `wiki.py` (Python 3.8+, no installs, no
network). On Windows type `py` instead of `python3`:

```
python3 wiki.py status            # what's new and waiting
python3 wiki.py new concept "Unit economics"
python3 wiki.py index             # rebuild wiki/index.md
python3 wiki.py search pricing
python3 wiki.py lint              # health check
```

## Obsidian (optional, recommended)

Open this folder as a vault (**Open folder as vault**). Graph view shows hubs
and orphan pages. Set **Settings → Files and links → Attachment folder path**
to `raw/assets`. The Web Clipper extension saves articles straight into
`raw/`. Your personal Obsidian settings in `.obsidian/` are ignored by Git.

## Where the ideas come from

- Andrej Karpathy, "LLM Wiki" (https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f):
  raw sources, a wiki the LLM maintains, a schema file, and the ingest, query
  and lint operations with `index.md` and `log.md`.
- charlie947/ai-second-brain (https://github.com/charlie947/ai-second-brain):
  an Obsidian vault, slash commands for daily use, and regular lint passes.
- The Idea Lab Wei shares with Jordi: every claim is sourced or labelled a
  hypothesis, ideas are recorded in the proposer's words, verdicts keep a
  history, decisions belong to people, and the brain enforces hard limits on
  secrets and outreach.

What this repository adds: `wiki.py` does the bookkeeping in code (the index,
the log, and checks for broken links, orphan pages, uningested sources, stale
pages and text that looks like a secret), so the wiki stays healthy even when
the assistant forgets a step.
