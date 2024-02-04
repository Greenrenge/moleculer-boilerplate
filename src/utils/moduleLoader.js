import fs from 'fs'
import path from 'path'
// import { fileURLToPath } from 'url'
import callsites from 'callsites'
import fromPairs from 'lodash/fromPairs.js'

// const __filename = fileURLToPath(import.meta.url)
// const __dirname = path.dirname(__filename)

function findAllFilePath(dir, files = []) {
  if (!fs.existsSync(dir)) return files
  const fileNames = fs.readdirSync(dir)
  fileNames.forEach((fileName) => {
    const filePath = path.join(dir, fileName)
    const stat = fs.statSync(filePath)
    if (stat.isDirectory()) {
      findAllFilePath(filePath, files)
    } else if (stat.isFile()) {
      files.push(filePath)
    }
  })
  return files
}

async function load(folder) {
  const callPath = callsites()[1].getFileName()
  const scanPath = path.dirname(callPath.replace('file://', ''))
  const scanDir = `${scanPath}/${folder}`

  const keyWithModulePromises = findAllFilePath(scanDir)
    .filter((f) => f.endsWith('.js'))
    .map((p) => [
      p
        .replace(scanDir, '')
        .replace('/', '')
        .replace('/index.js', '')
        .replace('.js', '')
        .replace(/\//g, '.'), // fileName
      p,
    ])
    .filter(([k, v]) => !k.split('.').some((f) => f.startsWith('__'))) // exclude all .ss.as.__xxxx
    .map(async ([k, v]) => [k, await import(v)])
  const loaded = await Promise.all(keyWithModulePromises)
  return fromPairs(loaded.map(([k, v]) => (v.default ? [k, v.default] : undefined)).filter(Boolean))
}

export default load
