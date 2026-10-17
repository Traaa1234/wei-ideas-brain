---
description: Map and analyse how my ideas relate to each other and to the evidence
argument-hint: "[idea-page | all]"
---
Follow the Map operation in AGENTS.md for: $ARGUMENTS

Run `python3 wiki.py graph`, read `wiki/graph.md`, and for a named idea also
`python3 wiki.py related <page>`. Then tell me, citing pages: which ideas
compete for the same customer, which complement or could merge, which share
evidence or a falsification test, which are weakest (no evidence, no test,
unconnected), and the suggested links and unlinked mentions worth adding.
Ask before adding links or changing idea pages; never change a verdict. Then
`wiki.py index`, `wiki.py graph`, `wiki.py log map`, and commit (and push in a
cloud session).
