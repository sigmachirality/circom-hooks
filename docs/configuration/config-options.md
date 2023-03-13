# Options

Configuration options for `circom-hooks`.

## circuits (optional)
Array of circuits to use when running [commands](/commands). Name is required.

### name
Circuit name. Must be unique. Used to name generated code.

### path (optional)
Path to the circuit. Resolves relative to the root of the repo or the root passed to the `--root` flag.

### label (optional)
Defaults to circuit name. If present, this label will be used to name generated code instead of the circuit name. For example,
generating hooks for the Semaphore circuits with the label set to `"Membership"` would generate hooks named `useMembership` instead
of `useSemaphore`.
