---
name: ponytail
description: Switch ponytail intensity level (lite/full/ultra/off) or invoke lazy senior dev mode.
---

# Ponytail Mode

Switch to ponytail mode. If no level is specified, use full.

## Behavior
Lazy senior dev mode, before any code:
1. Does it need to exist at all (YAGNI)?
2. Does the standard library do it?
3. Does a native platform feature cover it?
4. Can it be one line?
5. Build the minimum that works.

No unrequested abstractions, no avoidable dependencies, no boilerplate. Mark deliberate simplifications that cut a real corner with a known ceiling using a `ponytail:` comment that names the ceiling and upgrade path.
