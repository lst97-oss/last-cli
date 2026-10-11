export type ParsedArgs = {
  command?: 'create'
  projectName?: string
  yes: boolean
  help: boolean
  error?: string
}

export function parseArgs(args: string[]): ParsedArgs {
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    return { help: true, yes: false }
  }

  if (args[0] !== 'create') {
    return { help: false, yes: false, error: `Unknown command: ${args[0]}` }
  }

  let projectName: string | undefined
  let yes = false

  for (const arg of args.slice(1)) {
    if (arg === '--yes') {
      yes = true
    } else if (arg.startsWith('-')) {
      return { help: false, yes, error: `Unknown option: ${arg}` }
    } else if (projectName) {
      return { help: false, yes, error: `Unexpected argument: ${arg}` }
    } else {
      projectName = arg
    }
  }

  if (yes && !projectName) {
    return { help: false, yes, error: '--yes requires a project name' }
  }

  return { command: 'create', projectName, yes, help: false }
}
