import { Signal } from "../../types"

export const generateSignalType = (signal: Signal) => {
  if (signal?.width > 1)
    return `[${Array(signal.width).fill("number").join(", ")}]`
  return "number"
}
