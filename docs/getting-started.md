---
order: 999
icon: rocket
label: Getting Started
---

# Getting started

## Quick setup
Install `circom-hooks` and its peer dependencies.

+++ npm
```shell
npm i circom-hooks snarkjs
```
+++ yarn
```shell
yarn i circom-hooks snarkjs
```
+++ pnpm
```shell
pnpm i circom-hooks snarkjs
```
+++

### Create config file
Run the init command to generate a configuration file: either `circom-hooks.config.ts` if a `tsconfig.json` is present,
otherwise `circom-hooks.config.js`. You can also create the configuration file manually. See [Configuration](/guides/configuration)
for more info.

+++ npm
```shell
npx circom-hooks init
```
+++ yarn
```shell
yarn circom-hooks init
```
+++ pnpm
```shell
pnpm circom-hooks init
```
+++

The generated configuration file will look something like this:
```typescript
import { defineConfig } from 'circom-hooks/cli';

export default defineConfig({
    out: 'src/generated.ts',
    circuits: []
})
```

### Adding circuits
Simply add names (and if necessary, paths) to the relevant circuits.
```typescript
import { defineConfig } from 'circom-hooks/cli';

export default defineConfig({
    out: 'src/generated.ts',
    circuits: ["example.circom", {
        path: "./semaphore/semaphore.circuit",
        name: "semaphore",
        label: "Membership"
    }]
})
```

### Run code generation
+++ npm
```shell
npm run circom-hooks generate
```
+++ yarn
```shell
yarn circom-hooks generate
```
+++ pnpm
```shell
pnpm circom-hooks generate
```
+++

### Regenerate files automatically
If you need to automatically regenerate `circom-hooks` hooks when their source Circom circuits are changed, you can start a development server to watch for file changes and regenerate code as necessary.

+++ npm
```shell
npm run circom-hooks generate --watch
```
+++ yarn
```shell
yarn circom-hooks generate --watch
```
+++ pnpm
```shell
pnpm circom-hooks generate --watch
```
+++
