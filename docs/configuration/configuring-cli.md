---
order: 1000
---

# Configuring circom-hooks
When running `circom-hooks` from the command line, it will automatically try to resolve a config file named
`circom-hooks.config.js` or `circom-hooks.config.ts` inside the project root. The most basic config looks like this:
```typescript
export default {
    // config options
}
```

When calling `circom-hooks`, you can specify a config file to use with the `--config/ -c` CLI option (resolved relative to the
working directory):
```shell
wagmi --config custom-config.js
```
To scaffold a config file quickly, check out the [init](/commands/init) command.
