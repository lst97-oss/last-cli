import assert from 'node:assert/strict'
import { mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { BLANK_TEMPLATE_SOURCE, createProject, TEMPLATE_SOURCE } from '../src/create-project.js'

async function makeTempDir(): Promise<string> {
  return mkdtemp(path.join(os.tmpdir(), 'last-cli-test-'))
}

async function writeTemplateFiles(dir: string): Promise<void> {
  await writeFile(path.join(dir, 'package.json'), JSON.stringify({ name: 'last-payload-tanstack-start-template' }))
  await writeFile(path.join(dir, 'README.md'), '# last-payload-tanstack-start-template\n')
  await writeFile(path.join(dir, '.env.example'), 'DATABASE_URL=\n')
}

test('creates a named project from the pinned template and initializes requested setup', async () => {
  const cwd = await makeTempDir()
  const commands: string[] = []
  let source = ''

  try {
    const result = await createProject({
      projectName: 'my-app',
      cwd,
      install: true,
      initializeGit: true,
      download: async (templateSource, { dir }) => {
        source = templateSource
        await writeTemplateFiles(dir)
      },
      runCommand: (command, args) => {
        commands.push(`${command} ${args.join(' ')}`)
        return { status: 0 }
      },
    })

    assert.equal(source, TEMPLATE_SOURCE)
    assert.equal(result.projectPath, path.join(cwd, 'my-app'))
    assert.deepEqual(commands, ['git init', 'bun install'])
    assert.deepEqual(JSON.parse(await readFile(path.join(result.projectPath, 'package.json'), 'utf8')), {
      name: 'my-app',
    })
    assert.equal(await readFile(path.join(result.projectPath, 'README.md'), 'utf8'), '# my-app\n')
    assert.equal(await readFile(path.join(result.projectPath, '.env'), 'utf8'), 'DATABASE_URL=\n')
  } finally {
    await rm(cwd, { recursive: true, force: true })
  }
})

test('both template sources are pinned gh: URLs', () => {
  for (const source of [TEMPLATE_SOURCE, BLANK_TEMPLATE_SOURCE]) {
    assert.match(source, /^gh:lst97-oss\/[a-z0-9-]+\#[0-9a-f]{40}$/)
  }
  assert.match(TEMPLATE_SOURCE, /^gh:lst97-oss\/last-payload-tanstack-start-template\#/)
  assert.match(BLANK_TEMPLATE_SOURCE, /^gh:lst97-oss\/last-tanstack-start-template\#/)
})

test('refuses a non-empty destination without downloading or changing it', async () => {
  const cwd = await makeTempDir()
  const destination = path.join(cwd, 'my-app')
  await import('node:fs/promises').then(({ mkdir }) => mkdir(destination))
  await writeFile(path.join(destination, 'keep.txt'), 'keep')
  let downloaded = false

  try {
    await assert.rejects(
      createProject({
        projectName: 'my-app',
        cwd,
        install: false,
        initializeGit: false,
        download: async () => {
          downloaded = true
        },
      }),
      /not empty/i,
    )

    assert.equal(downloaded, false)
    assert.equal(await readFile(path.join(destination, 'keep.txt'), 'utf8'), 'keep')
  } finally {
    await rm(cwd, { recursive: true, force: true })
  }
})

test('removes only a newly created partial destination after download failure', async () => {
  const cwd = await makeTempDir()

  try {
    await assert.rejects(
      createProject({
        projectName: 'my-app',
        cwd,
        install: false,
        initializeGit: false,
        download: async (_source, { dir }) => {
          await writeFile(path.join(dir, 'partial.txt'), 'partial')
          throw new Error('download failed')
        },
      }),
      /download failed/,
    )

    assert.deepEqual(await readdir(cwd), [])
  } finally {
    await rm(cwd, { recursive: true, force: true })
  }
})

test('keeps the project and reports setup failures', async () => {
  const cwd = await makeTempDir()

  try {
    const result = await createProject({
      projectName: 'my-app',
      cwd,
      install: true,
      initializeGit: false,
      download: async (_source, { dir }) => writeTemplateFiles(dir),
      runCommand: () => ({ status: 1 }),
    })

    assert.match(result.setupWarnings.join('\n'), /bun install/i)
    assert.equal(
      await readFile(path.join(result.projectPath, 'package.json'), 'utf8').then((json) => JSON.parse(json).name),
      'my-app',
    )
  } finally {
    await rm(cwd, { recursive: true, force: true })
  }
})
