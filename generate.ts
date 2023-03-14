import fs from 'fs'; 
import { capitalCase } from 'change-case';
import dedent from 'dedent';
import parse from './parse.js';

type Signal = {
  isPublic: boolean,
  name: string,
  type: 'input' | 'output',
  width: number,
}

type PublicOutput = Signal & {
  isPublic: true,
} | Signal & {
  type: 'output'
}

type InputSignal = Signal & {
  type: 'input',
}

type GenerateTypes = {
  inputs: InputSignal[],
  publicSignals: PublicOutput[],
  label: string,
}

const generateSignalType = (signal: Signal) => {
  if (signal?.width > 1) return `[${Array(signal.width).fill('number').join(', ')}]`;
  return 'number';
}

const generateTypes = ({ inputs, publicSignals, label }: GenerateTypes) => {
  const proverInputType: string = dedent`
    \nexport type ${label}ProverInputs = {
      ${inputs.map(input => `${input.name}: ${generateSignalType(input)}`).join(', ')}
    }
  `

  const proverOutputType: string = dedent`
    export type ${label}ProverOutputs = {
      proof: any,
      publicSignals: ${label}VerifierInputs,
    }
  `

  const verifierInputType: string = dedent`
    export type ${label}VerifierInputs = {
      ${publicSignals.map(signal => `${signal.name}: ${generateSignalType(signal)}`).join(', ')}   
    }
  `

  return [
    ...proverInputType.split('\n'),
    '',
    ...proverOutputType.split('\n'),
    '',
    ...verifierInputType.split('\n'),
    ''
  ];
}

type GenerateProver = {
  name: string,
  label: string,
  circuitsDir: string
}

const generateProver = ({ name, label, circuitsDir }: GenerateProver) => {
  const proverFunction: string = dedent`
    export async function prove${label}(inputs: ${label}ProverInputs): Promise<${label}ProverOutputs> {
      const wasm = await import("${circuitsDir}/${name}.wasm");
      const zkey = await import("${circuitsDir}/${name}.zkey"); 
      const { proof, publicSignals } = await groth16.fullProve(inputs, wasm, zkey);
      return { proof, publicSignals };   
    }
  `;
  return [...proverFunction.split('\n')];
}

type GenerateVerifier = {
  publicSignals: PublicOutput[],
  name: string,
  label: string,
  circuitsDir: string
}

const generateVerifier = ({ publicSignals, name, label, circuitsDir }: GenerateVerifier) => {
  const destructurePublicSignals = publicSignals.map(signal => signal.name).join(', ');
  const spreadPublicSignals = publicSignals.map(signal => signal.width > 1 ? `...${signal.name}`: signal.name).join(', ');
  const proverFunction: string = dedent`
    export async function verify${capitalCase(label, { delimiter: "" })}(proof: any, publicSignals: ${label}VerifierInputs): Promise<boolean> {
      const vkey = await import('${circuitsDir}/${name}.json');
      const { ${ destructurePublicSignals } } = publicSignals;
      const proofVerified = await groth16.verify(vkey, [${spreadPublicSignals}], proof);
      return proofVerified;
    }

  `;
  return [...proverFunction.split('\n')];
}

type GenerateProverHook = {
  label: string,
  inputs: InputSignal[],
}

const generateProverHook = ({ label, inputs }: GenerateProverHook) => {
  const spreadInputs = inputs.map(signal => `inputs.${signal.name}`).join(', ');
  const proverHookFunction: string = dedent`
    export const use${capitalCase(label, { delimiter: "" })}Proof = (inputs: ${label}ProverInputs) => {
      const [isLoading, setIsLoading] = useState(false);
      const [result, setResult] = useState<${label}ProverOutputs>();
  
      useEffect(() => {
        setIsLoading(true);
        prove${capitalCase(label, { delimiter: "" })}(inputs).then(res => {
          setIsLoading(false);
          setResult(res);
        })
      }, [${spreadInputs}])
  
      const { proof, publicSignals } = result ?? {};
      return { isLoading, proof, publicSignals };
    }

  `;
  return [...proverHookFunction.split('\n')];
}

type GenerateVerifierHook = {
  label: string,
  publicSignals: PublicOutput[],
}

const generateVerifierHook = ({ label, publicSignals }: GenerateVerifierHook) => {
  const spreadPublicSignals = publicSignals.map(signal => `publicSignals.${signal.name}`).join(', ');
  const verifierHookFunction: string = dedent`
    export const use${capitalCase(label, { delimiter: "" })}Verifier = (proof: any, publicSignals: ${label}VerifierInputs) => {
      const [isLoading, setIsLoading] = useState(false);
      const [result, setResult] = useState<boolean>();
  
      useEffect(() => {
        setIsLoading(true);
        verify${capitalCase(label, { delimiter: "" })}(proof, publicSignals).then(res => {
          setIsLoading(false);
          setResult(res);
        })
      }, [${spreadPublicSignals}])
  
      return { isLoading, result };
    }

  `;
  return [...verifierHookFunction.split('\n')];
}

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

  const content: string[] = [];

  const inputs = signals.filter(s => s.type === 'input') as InputSignal[];
  const publicSignals = signals.filter(s => s.isPublic || s.type === 'output') as PublicOutput[];

  const types = generateTypes({ inputs, publicSignals, label });
  const provers = generateProver({ name, label, circuitsDir });
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

const signals = await parse() as Signal[];
const res = react({ name: 'Name', signals, circuitsDir: '../../circuits'});

// Write the result to a file called './generated'
fs.writeFileSync('./generated-hooks.ts', res.content.join('\n'));
