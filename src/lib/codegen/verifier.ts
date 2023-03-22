import { capitalCase } from "change-case"
import dedent from "dedent"
import { PublicOutput } from "src/types"

type GenerateVerifier = {
  publicSignals: PublicOutput[]
  name: string
  label: string
  circuitsDir: string
}

export const generateVerifier = ({
  publicSignals,
  name,
  label,
  circuitsDir
}: GenerateVerifier) => {
  const destructurePublicSignals = publicSignals
    .map((signal) => signal.name)
    .join(", ")
  const spreadPublicSignals = publicSignals
    .map((signal) => (signal.width > 1 ? `...${signal.name}` : signal.name))
    .join(", ")
  const loweredName = name.toLowerCase()
  const proverFunction: string = dedent`
      export async function verify${capitalCase(label, {
        delimiter: ""
      })}(proof: any, publicSignals: ${label}VerifierInputs): Promise<boolean> {
        const vkey = await import('${circuitsDir}/${loweredName}.json');
        const { ${destructurePublicSignals} } = publicSignals;
        const proofVerified = await groth16.verify(vkey, [${spreadPublicSignals}], proof);
        return proofVerified;
      }
  
    `
  return [...proverFunction.split("\n")]
}
