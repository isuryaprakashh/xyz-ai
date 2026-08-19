---
name: ponytail-audit
description: Audit the entire repository for over-engineering, unnecessary dependencies, and code bloat.
---

# Ponytail Audit

Audit the entire repository for over-engineering only, not correctness.

## Guidelines
- Scan the whole tree, not just a diff.
- Format: One line per finding, ranked with the biggest cuts first:
  `<tag> <what to cut>. <replacement>. [path]`
- Tags:
  - `delete`: dead code / speculative feature
  - `stdlib`: reinvented standard library
  - `native`: dependency doing what the platform does
  - `yagni`: abstraction with only one implementation
  - `shrink`: same logic in fewer lines
- End with total net lines and dependencies removable.
- If nothing to cut: `'Lean already. Ship.'`
