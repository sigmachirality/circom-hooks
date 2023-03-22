export type Signal = {
  isPublic: boolean
  name: string
  type: "input" | "output"
  width: number
}

export type PublicOutput =
  | (Signal & {
      isPublic: true
    })
  | (Signal & {
      type: "output"
    })

export type InputSignal = Signal & {
  type: "input"
}
