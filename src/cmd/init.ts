import chalk from "chalk"
import fs from "fs"
import ora, { Ora } from "ora"
import path from "path"
import inquirer from "inquirer"
import { exec, writeFile } from "../lib/run"

export async function init() {
  if (!fs.existsSync("./package.json")) {
    console.error(
      chalk.red("Error: No package.json found. Are you in the right directory?")
    )
    process.exit()
  }

  const pkgManager = fs.existsSync("./yarn.lock")
    ? "yarn"
    : fs.existsSync("./pnpm-lock.yaml")
    ? "pnpm"
    : "npm"

  const cwd = process.cwd()
  const answers = await inquirer.prompt([
    {
      name: "framework",
      type: "list",
      choices: ["next", "vite", "cra"]
    }
  ])

  await spinner
}
