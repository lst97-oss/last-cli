import assert from 'node:assert/strict'
import test from 'node:test'
import { isValidProjectName } from '../src/project-name.js'

test('accepts lowercase npm-safe slugs', () => {
  assert.equal(isValidProjectName('my-app'), true)
  assert.equal(isValidProjectName('app2'), true)
})

test('rejects paths and names that are not lowercase slugs', () => {
  for (const name of ['', '../outside', 'My-App', 'app/name', 'app_name', '-app', 'app-']) {
    assert.equal(isValidProjectName(name), false, name)
  }
})

test('rejects project names over npm’s 214 character limit', () => {
  assert.equal(isValidProjectName('a'.repeat(214)), true)
  assert.equal(isValidProjectName('a'.repeat(215)), false)
})
