---
label: circom-hooks
order: 2000
icon: workflow
---
# circom-hooks

`circom-hooks` is a command line interface (CLI) code generator which makes working with [Circom](https://iden3.io/circom) easier by generating Typescript types and hooks for React.

Using `circom-hooks` provides the following benefits:
- Abstracts away loading, bundling, caching, and (potentially) [chunking zkeys](https://docs.circom.io/getting-started/proving-circuits) so you can focus on circuit and app level work.
- Provides accurately typed interfaces so you can ship quickly and accurately.
- Allows building more complex CI/CD pipelines using the CLI tool and/or programmatic calls.

## Overview
Given the following circuit (adapted from [zkREPL](zkrepl.com)):
```example.circom
pragma circom 2.1.4;

include "circomlib/poseidon.circom";

template Example () {
    signal input a;
    signal input b;
    signal output c;
    
    c <== a * b;
    assert(a > 2);
    
    component hash = Poseidon(2);
    hash.inputs[0] <== a;
    hash.inputs[1] <== b;
}

component main { public [ a ] } = Example();
```

Running `yarn circom-hooks generate` with the appropriate configuration will generate a file containing Typescript types and
React hooks. Assuming the file is at `./generated.ts` for the sake of example:

```typescript
import { CircomContext, useExample, useExampleSuspense } from './generated';
import type { ExampleProofInput } from './generated';

const input: ExampleProofInput = {
    a: 1
    b: 3
}

export function App() {
    const { isLoading, proof } = useExample(input);
    return <CircomContext>
        {
            isLoading
                ? <p>loading...</p>
                : <>
                    <h1>Proof: {proof}</h1>
                    <button>Submit Proof</button>
                </>
        }
    </CircomContext>
}

// Example using Suspense loaders
function ProofWithSuspense() {
    const proof = useExampleSuspense(input);
    return <>
        <h1>Proof: {proof}</h1>
        <button>Submit Proof</button>
    </>
}

export function AppWithSuspense() {
    return <Suspense fallback={<p>loading...</p>}>
        <ProofWithSuspense>
    </Suspense>
}
```

```typescript
import { proveExampleSync, verifyExample } from './generated';
import type { ExampleProofInput, ExampleProofInput } from './generated';

const input: ExampleProofInput = {
    a: 1
    b: 3
}

const proof = proveExampleSync(input);

const publicSignals: ExampleProofInput = {
    a: 1
    c: 3
}

const result: boolean = await verifyExample(proof, publicSignals);
```
