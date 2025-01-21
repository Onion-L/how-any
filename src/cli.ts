#!/usr/bin/env node
import process from 'node:process'
import chalk from 'chalk'
import { Command } from 'commander'
import packageJson from '../package.json'
import { getTsFiles } from './fg'
import { getAnyTypeRate } from './visitor'

const program = new Command()

program
  .version(packageJson.version, '-v, --version', 'show the current version')
  .description('A CLI tool to detect the use of the `any` type in a TypeScript project')
  .option('-d, --dir <dir>', 'Input directory')
  .option('-t, --type <type>', 'Input project type')
  .action(async (options) => {
    const files = await getTsFiles(options.dir, options.type)
    const { default: boxen } = await import('boxen')
    let total = 0
    let count = 0

    for (const file of files) {
      const results = await getAnyTypeRate(file)
      if (results !== 0) {
        total += results
        count++
      }
      const icon = results === 0 ? '✅' : results > 50 ? '🚨' : '🚧'
      const percentage = chalk.bold(results === 0 ? chalk.green(`${results}%`) : results > 50 ? chalk.red(`${results}%`) : chalk.yellow(`${results}%`))
      console.log(`${icon} ${chalk.blue(file.padEnd(60))} ${percentage}`)
    }

    const average = count > 0 ? `${Math.round(total / count)}%` : 'None'
    const result = `${average}`
    const message = boxen(
      `${chalk.yellow.bold(result)} of type annotations are ${chalk.red('any')}\n`
      + `${chalk.dim(`Analyzed ${files.length} files, ${count} ${count > 1 ? 'files' : 'file'} with any type`)}`,
      {
        padding: 1,
        borderStyle: 'round',
        title: chalk.gray.bold('How Any 🤔'),
        titleAlignment: 'left',
      }
    )

    console.log(`\n${message}`)
  })

program.parse(process.argv)
