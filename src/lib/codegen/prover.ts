import dedent from "dedent"

type GenerateProver = {
  name: string
  label: string
}

export const generateProver = ({ name, label }: GenerateProver) => {
  const proverFunction: string = dedent`
      export async function prove${label}(inputs: ${label}ProverInputs): Promise<${label}ProverOutputs> {
        const { proof, publicSignals } = await groth16.fullProve(inputs, ${name}Wasm, ${name}ZKey);
        return { proof, publicSignals };   
      }
    `
  return [...proverFunction.split("\n")]
}
