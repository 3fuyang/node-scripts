import { readdir, rename } from 'node:fs/promises'
import { normalize } from 'node:path'
import { argv } from 'node:process'
import { performance } from 'node:perf_hooks'

// arguments passed via CLI
interface CLIArgs {
  [key: string]: string
}

renameFiles()

// main runner
async function renameFiles() {
  const options = parseArgv(argv)

  const files = await getCurrentFilenames(options.dir)

  await suffixAll(options.dir, files, options.suffix)
}

// parse arguments passed via CLI into a dictionary
// i.e. tsx rename.ts --dir ../foo/bar/ --suffix -c
function parseArgv(argv: string[]) {
  const copy = [...argv],
    options: CLIArgs = {}

  while (copy.length > 2) {
    const [key, val] = copy.splice(2, 2)
    options[key.slice(2)] = val
  }

  return options
}

// scan files under the given directory
async function getCurrentFilenames(dir: string) {
  const result: string[] = []

  try {
    console.log('Scanning files:\n')
    const files = await readdir(normalize(dir))

    files.forEach((file, i) => {
      result.push(file)
      console.log(`[${i}] ${file}`)
    })
  } catch(e) {
    console.log(e)
  } finally {
    console.log('\nScanning completed.\n')
  }

  return result
}

// decorate all selected files with given suffix
async function suffixAll(dir: string, files: string[], suffix: string) {
  console.log('Start renaming ...\n')
  const start = performance.now()

  files.forEach(async file => {
    const [name, ...ext] = file.split('.')
    const oldPath = normalize(`${dir}/${file}`),
      newPath = normalize(`${dir}/${name}${suffix}.${ext.join('')}`)

    try {
      await rename(oldPath, newPath)
    } catch(e) {
      console.log(e)
    }
  })

  const end = performance.now(),
    duration = (end - start) / 1000
  console.log(`Renamed totally ${files.length} files in ${duration} s.\n`)
}
