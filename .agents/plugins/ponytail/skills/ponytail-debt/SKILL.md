---
name: ponytail-debt
description: Harvest ponytail: comments into a tracked debt ledger.
---

# Ponytail Debt Ledger

Harvest every `ponytail:` comment in this repository into a debt ledger so deferrals do not rot.

## Guidelines
- Search the codebase for `ponytail:` comment markers (`# ponytail:`, `// ponytail:`). Skip `node_modules`, `.git`, and build output directories.
- Format: One row per marker, grouped by file:
  `<file>:<line>, <what was simplified>. ceiling: <the limit named in the comment>. upgrade: <the trigger to revisit>.`
- Tag any marker that names no upgrade path or trigger as `no-trigger`.
- End with the total count of markers and how many lack a trigger.
- If none found: `'No ponytail: debt. Clean ledger.'`
- Report only; do not modify any files.
