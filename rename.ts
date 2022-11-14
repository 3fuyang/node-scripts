import { readdir, rename } from 'node:fs/promises'
import { normalize } from 'node:path'
import { argv } from 'node:process'
import { performance } from 'node:perf_hooks'

const options = parseArgv(argv)

console.log(options)

const files = await getCurrentFilenames(options.dir)

postfixAll(options.dir, files as string[], options.postfix)

//renameSync()

interface CLIArgs {
  [key: string]: string
}

// i.e. tsx rename.ts --dir ../foo/bar/ --postfix -c
function parseArgv(argv: string[]) {
  const copy = [...argv],
    options: CLIArgs = {}

  while (copy.length > 2) {
    const [key, val] = copy.splice(2, 2)
    options[key.slice(2)] = val
  }

  return options
}

async function getCurrentFilenames(dir: string) {
  try {
    const files = await readdir(normalize(dir))
    
    console.log('Scanning files:\n')
    files.forEach(file => console.log(file))

    return files
  } catch(e) {
    console.log(e)
  } finally {
    console.log('\nScanning completed.\n')
  }
}

async function postfixAll(dir: string, files: string[], postfix: string) {
  console.log('Start renaming ...\n')
  const start = performance.now()

  files.forEach(async file => {
    const [name, ext] = file.split('.')
    const oldPath = normalize(`${dir}/${file}`),
      newPath = normalize(`${dir}/${name}${postfix}.${ext}`)

    await rename(oldPath, newPath)
  })

  const end = performance.now(),
    duration = (end - start) / 1000
  console.log(`Totally ${files.length} files renamed in ${duration} s.\n`)
}
