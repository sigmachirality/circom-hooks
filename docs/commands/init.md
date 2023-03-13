---
label: init
order: 1000
---
# `init`

Creates configuration file. If Typescript is detected, the config file will use Typescript and be named
`circom-hooks.config.ts`. Otherwise, the config file will use Javascript and be named `circom-hooks.config.js`

## Usage
```
circom-hooks init
```

## Options
| Option      | Description |
| ----------- | ----------- |
| `-c, --config <path>`  | `[string]` path to config file          |
| `-r, --root <path>`    | `[string]` root path to write config to |
