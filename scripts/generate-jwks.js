#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-console */

const fs = require('fs')
const path = require('path')
const jose = require('jose')

const exportKey = (keyPair) =>
	Promise.all([jose.exportJWK(keyPair.privateKey), jose.exportJWK(keyPair.publicKey)])

const applyKidAndUse =
	(use) =>
	async ([privateKey, publicKey]) => {
		const kid = await jose.calculateJwkThumbprint(publicKey)
		return [
			{
				...privateKey,
				kid,
				use,
			},
			{
				...publicKey,
				kid,
				use,
			},
		]
	}

Promise.all([
	jose
		.generateKeyPair('RSA-OAEP-256', {
			modulusLength: 2048,
		})
		.then(exportKey)
		.then(applyKidAndUse('sig')),
	jose
		.generateKeyPair('RSA-OAEP-256', {
			modulusLength: 2048,
		})
		.then(exportKey)
		.then(applyKidAndUse('enc')),

	jose.generateKeyPair('ES256', {}).then(exportKey).then(applyKidAndUse('sig')),
	jose.generateKeyPair('ES256', {}).then(exportKey).then(applyKidAndUse('enc')),

	jose.generateKeyPair('EdDSA', {}).then(exportKey).then(applyKidAndUse('sig')),
]).then(async (res) => {
	const publicKey = res.map((keyPair) => keyPair[1])
	const privateKey = res.map((keyPair) => keyPair[0])
	console.log(publicKey)
	const jwks = {
		keys: publicKey,
	}
	const privateJwks = {
		keys: privateKey,
	}
	// write to file
	fs.writeFileSync(path.resolve(__dirname, '../jwks.json'), JSON.stringify(jwks, null, 2))
	fs.writeFileSync(
		path.resolve(__dirname, '../private-jwks.json'),
		JSON.stringify(privateJwks, null, 2),
	)
})

// jose.createLocalJWKSet().then((jwks) => {

// }

// https://github.com/panva/jose/blob/e65299c50e3d5ee4e84f4ec2b5bfff009d0e4092/docs/functions/jwks_local.createLocalJWKSet.md
/*

 const key = await lib.importJWK({ ...jwk, alg: 'PS256' })
      const jws = await new lib.CompactSign(new Uint8Array(1))
        .setProtectedHeader({ alg: 'PS256', kid: jwk.kid })
        .sign(key)



	 const jws = await new lib.FlattenedSign(new Uint8Array(1))
        .setProtectedHeader({ alg: 'PS256' })
        .setUnprotectedHeader({ kid: jwk.kid })
        .sign(key)
      const { key: resolvedKey } = await lib.flattenedVerify(jws, JWKS)



       const jws = await new lib.GeneralSign(new Uint8Array(1))
        .addSignature(key)
        .setProtectedHeader({ alg: 'PS256' })
        .setUnprotectedHeader({ kid: jwk.kid })
        .sign()
      const { key: resolvedKey } = await lib.generalVerify(jws, JWKS)
	*/
