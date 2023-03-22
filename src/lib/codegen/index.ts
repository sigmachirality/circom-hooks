import { Signal } from 'src/types';
import { capitalCase } from 'change-case';
import dedent from 'dedent';

type GenerateReact = {
  signals: Signal[],
  circuitsDir: string,
  name: string
  label?: string,
}

export const react = ({ name, signals, circuitsDir, label }: GenerateReact) => {
  const imports: Record<string, Set<string>> = {};
  name = capitalCase(name);
  label = capitalCase(label ?? name);

  // TODO: change based on the proof system
  imports['react'] = new Set(['useEffect', 'useState']);
  imports['snarkjs'] = new Set(['groth16']);

  const loweredName = name.toLowerCase();
  const content: string[] = [
    `import ${name}Wasm from '${circuitsDir}/${loweredName}_js/${loweredName}.wasm'`,
    `import ${name}ZKey from '${circuitsDir}/${loweredName}.zkey'`,
  ];

  const inputs = signals.filter(s => s.type === 'input') as InputSignal[];
  const publicSignals = signals.filter(s => s.isPublic || s.type === 'output') as PublicOutput[];

  const types = generateTypes({ inputs, publicSignals, label });
  const provers = generateProver({ name, label });
  const verifiers = generateVerifier({ publicSignals, name, label, circuitsDir });
  const proverHooks = generateProverHook({ label, inputs });
  const verifierHooks = generateVerifierHook({ label, publicSignals });
  
  for (const importName in imports) {
    content.push(dedent`
      import { ${Array.from(imports[importName]!).join(', ')} } from '${importName}';
    `);
  }
  content.push(...types, ...provers, '', ...verifiers, '', ...proverHooks, '', ...verifierHooks);

  return { imports, content };
}
