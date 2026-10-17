# raw/

Your sources, exactly as collected. The assistant reads them and never edits,
renames or deletes them.

- Upload on GitHub: open this folder → **Add file** → **Upload files** (or
  **Create new file** to paste text) → **Commit changes** to `main`.
- Web articles as markdown or PDF, transcripts, notes, chat exports. Images
  go in `raw/assets/`.
- Name files `YYYY-MM-DD-short-title.ext` so they sort by date.
- Then start a session at https://claude.ai/code on this repository and run
  `/ingest`, or say "ingest the new sources". It pushes the new wiki pages
  back to GitHub.

Anything here is committed to Git. If the repository is public, so is this.
