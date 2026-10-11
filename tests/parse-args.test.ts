import assert from 'node:assert/strict'
import test from 'node:test'
import { parseArgs } from '../src/parse-args.js'

test('parses a named non-interactive create command', () => {
  assert.deepEqual(parseArgs(['create', 'my-app', '--yes']), {
    command: 'create',
    help: false,
    projectName: 'my-app',
    yes: true,
  })
})

test('requires a project name when --yes is used', () => {
  assert.match(parseArgs(['create', '--yes']).error ?? '', /project name/i)
})

test('prints help before parsing other arguments', () => {
  assert.equal(parseArgs(['create', '--help']).help, true)
})

test('rejects unknown commands, flags, and extra positional arguments', () => {
  assert.match(parseArgs(['update']).error ?? '', /unknown command/i)
  assert.match(parseArgs(['create', 'app', '--force']).error ?? '', /unknown option/i)
  assert.match(parseArgs(['create', 'app', 'other']).error ?? '', /unexpected argument/i)
})
