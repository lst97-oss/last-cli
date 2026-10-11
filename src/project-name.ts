const projectNamePattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function isValidProjectName(name: string): boolean {
  return name.length <= 214 && projectNamePattern.test(name)
}
