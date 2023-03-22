import { InputSignal } from "src/types";
import { capitalCase } from 'change-case';
import dedent from "dedent";

export type GenerateProverHook = {
    label: string,
    inputs: InputSignal[],
  }
  
export const generateProverHook = ({ label, inputs }: GenerateProverHook) => {
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
  