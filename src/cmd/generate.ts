import fs from "fs"
import { parser } from "lezer-circom"
import { readFile } from "../utils/readFile"

type LRParser = typeof parser
type Tree = ReturnType<LRParser["parse"]>
type SyntaxNode = Tree["topNode"]

type Signal = {
  isPublic: boolean
  identifier: string
  type: "input" | "output"
  width: number
}

export async function parseSignals() {
  const input: string = (
    (await readFile("./examples/circuits/example.circom")) as any
  ).toString()
  const getNodeText = (node?: Partial<SyntaxNode> | null) =>
    node?.from && node?.to ? input.slice(node.from, node.to) : undefined

  const tree = parser.parse(input)
  const mainComponentDeclaration = tree.topNode.getChild?.(
    "MainComponentDeclaration"
  )
  const mainComponentIdentifier = getNodeText(
    mainComponentDeclaration?.getChild?.("Call")?.getChild?.("Identifier")
  )

  const publicSignalsList =
    mainComponentDeclaration
      ?.getChild?.("PublicSignalsList")
      ?.getChildren?.("Identifier")
      ?.map?.(getNodeText) ?? []

  const signalsList: Signal[] =
    tree.topNode
      ?.getChildren?.("TemplateDeclaration")
      ?.find(
        (node) =>
          getNodeText(node?.getChild("Identifier")) === mainComponentIdentifier
      )
      ?.getChild?.("TemplateBody")
      ?.getChildren?.("SignalDeclaration")
      ?.map((signalDeclaration) => {
        const signalIdentifier =
          getNodeText(signalDeclaration.getChild("Identifier")) ?? ""
        const signalType = getNodeText(signalDeclaration.getChild("output"))
        const signalWidthToken =
          getNodeText(
            signalDeclaration
              .getChild("ArraySize")
              ?.getChild("NumericExpression")
          ) ?? "1"
        const signalWidth = parseInt(signalWidthToken)
        const isPublic = publicSignalsList.includes(signalIdentifier)
        return {
          isPublic,
          identifier: signalIdentifier,
          type: signalType ? "output" : "input",
          width: signalWidth
        }
      }) ?? []

  return signalsList
}

generate()
