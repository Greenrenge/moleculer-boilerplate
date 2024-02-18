/* eslint-disable @typescript-eslint/ban-ts-comment */
import fs from 'fs'
import path from 'path'
import callerPath from 'caller-path'
// @ts-ignore
import importDir from 'directory-import'
import fromPairs from 'lodash/fromPairs'

// const importDir = require('directory-import')

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
