import { PublicOutput } from "src/types";
import { capitalCase } from 'change-case';
import dedent from "dedent";
  
type GenerateVerifierHook = {
  label: string,
  publicSignals: PublicOutput[],
}

export const generateVerifierHook = ({ label, publicSignals }: GenerateVerifierHook) => {
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
