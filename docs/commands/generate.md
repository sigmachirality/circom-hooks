---
label: generate
---
# `generate`

Generates code based on configuration, using the circuits defined in `circuits` if present.

## Usage
```
circom-hooks generate
```

## Options
| Option      | Description |
| ----------- | ----------- |
| `-c, --config <path>`  | `[string]` path to config file          |
| `-r, --root <path>`    | `[string]` root path to write config to |
| `-w, --watch`          | `[boolean]` watch for changes |
| `-v, --verbose`        | `[boolean]` print more log messages during generation |