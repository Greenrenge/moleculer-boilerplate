import fs from 'fs'
import path from 'path'
import callerPath from 'caller-path'
const importDir = require('directory-import')
import fromPairs from 'lodash/fromPairs'

function findAllFilePath(dir: string, files: string[] = []) {
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

function load<T>(folder: string) {
	const callPath = callerPath()
	if (!callPath) throw new Error('callerPath not found')

	const scanPath = path.dirname(callPath)
	const scanDir = `${scanPath}/${folder}`
	return fs.existsSync(scanDir)
		? fromPairs(
				Object.entries(importDir({ directoryPath: scanDir }))
					.map(
						([k, v]: any) =>
							v.default && [
								k.replace('/', '').replace('.ts', '').replace('.ts', '').replace(/\//g, '.'),
								v.default,
							],
					)
					.filter((a) => !!a)
					.filter(([k, v]) => !k.split('.').some((f: any) => f.startsWith('__'))), // exclude all .ss.as.__xxxx
			)
		: undefined
}

export default load
