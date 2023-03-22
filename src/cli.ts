import { cac } from "cac";
import * as logger from './logger'

const cli = cac('wagmi')

cli
  .command('generate', 'generate code based on configuration')
  .option('-c, --config <path>', '[string] path to config file')
  .option('-r, --root <path>', '[string] root path')
  .option('-w, --watch', '[boolean] watch for changes')
  .example((name) => `${name} generate`)
  .action(async (options) => {
    const generate = await import('./cmd/generate')
    await generate(options)
  })

cli
  .command('init', 'create configuration file')
  .option('-c, --config <path>', '[string] path to config file')
  .option('-r, --root <path>', '[string] root path')
  .example((name) => `${name} init`)
  .action(async (options) => {
    const init = await import('./cmd/init')
    await init(options)
  })

cli.help()

void (async () => {
  try {
    // Parse CLI args without running command
    cli.parse(process.argv, { run: false })
    if (!cli.matchedCommand && cli.args.length === 0) cli.outputHelp()
    await cli.runMatchedCommand()
  } catch (error) {
    logger.error(`\n${(error as Error).message}`)
    process.exit(1)
  }
})()
