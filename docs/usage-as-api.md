---
icon: plug
---
# Usage as API
You might need to call `circom-hooks` codegen as a subroutine of other code, such as a CI/CD pipeline or a hardhat-plugin task. You can import and call `runCircomHooks` to accomplish this.

```typescript
import { runCircomHooks } from 'circom-hooks'
import { config } from './circom-hooks.config.ts'

async function main() {
    const result = await runCircomHooks(config);
}

main().catch(console.error);
```
