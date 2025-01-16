#!/usr/bin/env node

import process from 'node:process'
import chalk from 'chalk'
import { Command } from 'commander'

const program = new Command()

program
  .version('1.0.0')
  .description('一个示例 CLI 工具')
  .option('-n, --name <name>', '输入名称')
  .action((options) => {
    console.log(chalk.green(`你好, ${options.name || '世界'}!`))
  })

program.parse(process.argv)
