import { InputSignal, PublicOutput } from "../../types"
import { generateSignalType } from "./signals"
import dedent from "dedent"

type GenerateTypes = {
  inputs: InputSignal[]
  publicSignals: PublicOutput[]
  label: string
}

export const generateTypes = ({
  inputs,
  publicSignals,
  label
}: GenerateTypes) => {
  const proverInputType: string = dedent`
      \nexport type ${label}ProverInputs = {
        ${inputs
          .map((input) => `${input.name}: ${generateSignalType(input)}`)
          .join(", ")}
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
        ${publicSignals
          .map((signal) => `${signal.name}: ${generateSignalType(signal)}`)
          .join(", ")}   
      }
    `

  return [
    ...proverInputType.split("\n"),
    "",
    ...proverOutputType.split("\n"),
    "",
    ...verifierInputType.split("\n"),
    ""
  ]
}
