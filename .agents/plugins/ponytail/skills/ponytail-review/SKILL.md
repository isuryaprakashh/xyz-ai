---
name: ponytail-review
description: Review code changes for over-engineering, dead code, and what can be deleted or simplified.
---

# Ponytail Review

Review the current code changes for over-engineering only, not correctness.

## Guidelines
- Format: One line per finding: `L<line>: <tag> <what to cut>. <replacement>.`
- Tags:
  - `delete`: dead code / speculative feature
  - `stdlib`: reinvented standard library
  - `native`: dependency doing what the platform does
  - `yagni`: abstraction with only one implementation
  - `shrink`: same logic in fewer lines
- End with the net lines removable.
- If nothing to cut: `'Lean already. Ship.'`
