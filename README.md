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

## Everyday use in the cloud (no PC needed)

Everything runs on GitHub and Claude Code on the web; nothing has to be
installed or stored on your computer, and it works from a phone.

1. **Upload sources.** On GitHub open the `raw` folder → **Add file** →
   **Upload files**, drag in your files (or **Create new file** to paste
   text, e.g. `raw/2026-10-17-pricing-article.md`), then
   **Commit changes** straight to `main`. Quick thoughts can go in `inbox.md`
   the same way (open it → pencil icon → edit → commit).
2. **Ingest.** Open https://claude.ai/code, start a session on
   `Traaa1234/wei-ideas-brain`, and type `/ingest` (or `/ingest all`). The
   assistant reads the new files, writes the wiki pages, and commits and
   pushes them to `main` before it finishes.
3. **Read.** Browse `wiki/overview.md`, `wiki/index.md` and `wiki/graph.md`
   (a map of how your ideas and pages connect, drawn by GitHub) on GitHub; links
   between pages show as `[[page-name]]` (the page is `wiki/<folder>/page-name.md`,
   or use the **Go to file** box, shortcut `t`).

Cloud sessions start from a fresh copy of the repository each time and are
discarded afterwards, so anything not pushed to GitHub is lost. That is why
the assistant always pushes at the end of a cloud session.

## Commands

In a Claude Code session (on the web, or locally with `claude` in this folder)
use:

| Command | What it does |
|---|---|
| `/ingest` | Turns new files in `raw/` into wiki pages. |
| `/capture` | Files the lines in `inbox.md`. |
| `/ask <question>` | Answers from the wiki with citations and offers to save the answer. |
| `/idea <idea>` | Starts or updates a business-idea dossier with sourced evidence. |
| `/map [idea]` | Maps how ideas relate: which compete, complement or share evidence, which are weakest, and links worth adding. |
| `/lint` | Weekly health check: broken links, orphans, stale or contradictory pages. |
| `/review` | Short weekly summary of what changed. |

In Codex or any assistant without slash commands, say the same thing in words
("ingest the new sources", "lint the wiki"). `AGENTS.md` describes each
operation.

The assistant uses a small helper, `wiki.py` (Python 3.8+, no installs, no
network). You only need it yourself if you work locally; on Windows type `py`
instead of `python3`:

```
python3 wiki.py status            # what's new and waiting
python3 wiki.py new concept "Unit economics"
python3 wiki.py index             # rebuild wiki/index.md
python3 wiki.py search pricing
python3 wiki.py lint              # health check
python3 wiki.py graph             # rebuild wiki/graph.md (map + idea analysis)
python3 wiki.py related tutoring-marketplace   # one page's links and backlinks
```

`wiki/graph.md` gives you the Obsidian-style views in the cloud: a coloured
map of the pages (ideas yellow, concepts blue, entities green, questions
purple, sources grey), an evidence table for each idea (sources, evidence
links, hypotheses, whether a falsification test exists, latest verdict), how
ideas relate to each other, hubs, clusters, suggested links and unlinked
mentions. Above 80 pages the map focuses on ideas and their closest pages.

## Obsidian (optional, local only)

If you also want a local copy, clone the repository and open the folder as a vault (**Open folder as vault**). Graph view shows hubs
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
the log, the graph, and checks for broken links, orphan pages, uningested
sources, stale pages and text that looks like a secret), so the wiki stays
healthy even when the assistant forgets a step.
