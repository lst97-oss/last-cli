#!/usr/bin/env node
import { cancel, confirm, intro, isCancel, log, outro, select, text } from '@clack/prompts'
import { createProject, TEMPLATE_SOURCE } from './create-project.js'
import { parseArgs } from './parse-args.js'
import { isValidProjectName } from './project-name.js'

const usage = `Usage:
  last-cli create [project-name] [--yes]

Create a project from the Payload + TanStack Start template.

Options:
  --yes   Use defaults, initialize Git, and install dependencies with Bun
  -h, --help  Show this help`

async function main(): Promise<void> {
  const parsed = parseArgs(process.argv.slice(2))
  if (parsed.help) {
    console.log(usage)
    return
  }
  if (parsed.error) {
    console.error(`${parsed.error}\n\n${usage}`)
    process.exitCode = 1
    return
  }
  if (!parsed.yes && (!process.stdin.isTTY || !process.stdout.isTTY)) {
    console.error(`Interactive setup needs a terminal. Provide a project name and use --yes.\n\n${usage}`)
    process.exitCode = 1
    return
  }

  intro('last-cli create')
  let projectName = parsed.projectName
  if (!projectName) {
    const answer = await text({
      message: 'What is your project called?',
      placeholder: 'my-app',
      validate: (value) => {
        if (!value) return 'Enter a project name.'
        if (!isValidProjectName(value)) return 'Use lowercase letters, numbers, and hyphens.'
      },
    })
    if (isCancel(answer)) {
      cancel('Project creation cancelled.')
      return
    }
    projectName = answer
  }
  if (!isValidProjectName(projectName)) {
    log.error('Project name must be a lowercase slug using letters, numbers, and hyphens.')
    process.exitCode = 1
    return
  }

  let templateSource = TEMPLATE_SOURCE
  let install = true
  let initializeGit = true
  if (!parsed.yes) {
    const template = await select({
      message: 'Choose a template',
      options: [
        {
          value: TEMPLATE_SOURCE,
          label: 'Payload + TanStack Start',
          hint: 'Placeholder /, /admin, /api/* + live/ready; users-only, en-only; compose Postgres + smoke + CI',
        },
      ],
    })
    if (isCancel(template)) {
      cancel('Project creation cancelled.')
      return
    }
    templateSource = template

    const installAnswer = await confirm({ message: 'Install dependencies with Bun?', initialValue: true })
    if (isCancel(installAnswer)) {
      cancel('Project creation cancelled.')
      return
    }
    install = installAnswer

    const gitAnswer = await confirm({ message: 'Initialize a Git repository?', initialValue: true })
    if (isCancel(gitAnswer)) {
      cancel('Project creation cancelled.')
      return
    }
    initializeGit = gitAnswer
  }

  try {
    const result = await createProject({ projectName, cwd: process.cwd(), templateSource, install, initializeGit })
    for (const warning of result.setupWarnings) log.warn(warning)
    const commands = [`cd ${projectName}`, 'edit .env', 'bun run db:up', 'bun run db:migrate']
    if (!install) commands.push('bun install')
    commands.push('bun run dev')
    outro(
      `${result.setupFailed ? 'Project created with setup issues.' : 'Project created successfully.'}\n\n${commands.join('\n')}`,
    )
    if (result.setupFailed) process.exitCode = 1
  } catch (error) {
    log.error(error instanceof Error ? error.message : String(error))
    process.exitCode = 1
  }
}

main().catch((error: unknown) => {
  log.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
})
