import { spawnSync } from 'node:child_process'
import { constants } from 'node:fs'
import { copyFile, lstat, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { downloadTemplate } from 'giget'
import { isValidProjectName } from './project-name.js'

export const TEMPLATE_SOURCE = 'gh:lst97-oss/payload-tanstack-start-template#b20c6ea510a0d76dd1a2f013c56c3b25277120ef'

type CommandResult = {
  status: number | null
  error?: NodeJS.ErrnoException
}

type CreateProjectOptions = {
  projectName: string
  cwd: string
  templateSource?: string
  install: boolean
  initializeGit: boolean
  download?: typeof downloadTemplate
  runCommand?: (command: string, args: string[], cwd: string) => CommandResult
}

function runCommand(command: string, args: string[], cwd: string): CommandResult {
  return spawnSync(command, args, { cwd, stdio: 'inherit' })
}

async function prepareDestination(destination: string): Promise<boolean> {
  try {
    const stats = await lstat(destination)
    if (stats.isSymbolicLink() || !stats.isDirectory()) {
      throw new Error(`Destination is not a regular directory: ${destination}`)
    }
    if ((await readdir(destination)).length > 0) {
      throw new Error(`Destination is not empty: ${destination}`)
    }
    return false
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
    await mkdir(destination)
    return true
  }
}

async function finishTemplate(destination: string, projectName: string): Promise<void> {
  const packagePath = path.join(destination, 'package.json')
  const packageJson = JSON.parse(await readFile(packagePath, 'utf8')) as { name?: string; [key: string]: unknown }
  if (!packageJson.name) throw new Error('Template package.json has no project name')
  packageJson.name = projectName
  await writeFile(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`)

  const readmePath = path.join(destination, 'README.md')
  const readme = await readFile(readmePath, 'utf8')
  if (!/^# .+$/m.test(readme)) throw new Error('Template README has no title')
  await writeFile(readmePath, readme.replace(/^# .+$/m, `# ${projectName}`))
  await copyFile(path.join(destination, '.env.example'), path.join(destination, '.env'), constants.COPYFILE_EXCL)
}

function runSetupCommand(
  command: string,
  args: string[],
  cwd: string,
  run: (command: string, args: string[], cwd: string) => CommandResult,
): string | undefined {
  let result: CommandResult
  try {
    result = run(command, args, cwd)
  } catch {
    return `${command} could not be started; run ${command} ${args.join(' ')} in the project directory.`
  }

  if (result.error?.code === 'ENOENT') {
    return `${command} is not installed; install it, then run ${command} ${args.join(' ')} in the project directory.`
  }
  if (result.error || result.status !== 0) {
    return `${command} ${args.join(' ')} failed; run it again in the project directory.`
  }
  return undefined
}

export async function createProject(options: CreateProjectOptions) {
  const { projectName, cwd, install, initializeGit } = options
  const templateSource = options.templateSource ?? TEMPLATE_SOURCE
  if (!isValidProjectName(projectName)) throw new Error('Project name must be a lowercase slug using letters, numbers, and hyphens.')

  const destination = path.resolve(cwd, projectName)
  const createdDestination = await prepareDestination(destination)

  try {
    await (options.download ?? downloadTemplate)(templateSource, { dir: destination })
    await finishTemplate(destination, projectName)
  } catch (error) {
    if (createdDestination) {
      try {
        await rm(destination, { recursive: true, force: true })
      } catch (cleanupError) {
        throw new AggregateError([error, cleanupError], `Project creation failed and the partial directory could not be removed: ${destination}`)
      }
    }
    throw error
  }

  const run = options.runCommand ?? runCommand
  const setupWarnings: string[] = []
  if (initializeGit) {
    const warning = runSetupCommand('git', ['init'], destination, run)
    if (warning) setupWarnings.push(warning)
  }
  if (install) {
    const warning = runSetupCommand('bun', ['install'], destination, run)
    if (warning) setupWarnings.push(warning)
  }

  return { projectPath: destination, setupWarnings, setupFailed: setupWarnings.length > 0 }
}
