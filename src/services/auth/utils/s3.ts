import { PassThrough } from 'stream'
import AWS from 'aws-sdk'
import config from '@/config'
import type { SingleFileUploadBufferParams } from '@/services/upload'

const {
	accessKeyId,
	secretAccessKey,
	bucketName: Bucket,
	signatureVersion,
	region,
} = config.s3 ?? {}

const s3 = new AWS.S3({
	accessKeyId,
	secretAccessKey,
	signatureVersion,
	region,
})

/**
 * S3 Create Presigned with Post method
 * @param {Object} params
 * @returns {Promise<Object>}
 * {
 *   url: 'https://s3-ap-southeast-1.amazonaws.com/commandsee-storage-dev',
 *   fields: {
 *     key: 'profile/commandsee logo.png',
 *     bucket: 'commandsee-storage-dev',
 *     'X-Amz-Algorithm': 'AWS4-HMAC-SHA256',
 *     'X-Amz-Credential': 'AKIAWAZROR...',
 *     'X-Amz-Date': '20210206T061149Z',
 *     Policy: 'eyJleHBpcmF0aW9uIjoiMjAy...',
 *     'X-Amz-Signature': 'eb22987a73df4d...'
 *   }
 * }
 */
function _createPresignedPostPromise(params: any): Promise<any> {
	return new Promise((resolve, reject) => {
		s3.createPresignedPost(params, (err, data) => {
			if (err) reject(err)
			else resolve(data)
		})
	})
}

export function createUploadBuffer(
	{ buffer, objectKey }: SingleFileUploadBufferParams,
	fileInfo: {
		[key: string]: any
		mimetype: string
	},
): Promise<any> {
	return new Promise((resolve, reject) => {
		s3.upload({
			Bucket,
			Key: objectKey,
			Body: Buffer.from(buffer.data),
			ContentType: fileInfo?.mimetype,
		})
			.promise()
			.then(resolve, reject)
	})
}

export function createUploadStream(
	objectKey: string,
	fileInfo: { [key: string]: any; mimetype: string },
): { writeStream: PassThrough; promise: Promise<AWS.S3.ManagedUpload.SendData> } {
	const pass = new PassThrough()
	return {
		writeStream: pass,
		promise: s3
			.upload({
				Bucket,
				Key: objectKey,
				Body: pass,
				ContentType: fileInfo?.mimetype,
			})
			.promise(),
	}
}

export const createUploadPictureSignedURL = async ({
	objectKey,
	onlyImage = true,
	minSize = 1000, // 1KB
	maxSize = 10000000, // 10MB
	publicRead = false,
	expiresInSec = 5 * 60, // 5 minutes
	startsWith = 'profile/',
}: {
	objectKey: string
	onlyImage?: boolean
	minSize?: number
	maxSize?: number
	publicRead?: boolean
	expiresInSec?: number
	startsWith?: string
}): Promise<any> => {
	const params = {
		Bucket,
		Fields: {
			key: objectKey,
			...(publicRead && { acl: 'public-read' }),
		},
		Expires: expiresInSec,
		Conditions: [
			['content-length-range', minSize, maxSize],
			onlyImage ? ['starts-with', '$Content-Type', 'image/'] : undefined,
			['starts-with', '$key', startsWith],
			publicRead ? ['eq', '$acl', 'public-read'] : undefined,
		].filter((a) => !!a),
	}
	const data = await _createPresignedPostPromise(params)
	return {
		path: objectKey,
		fullUrl: `${config.cdn.url}/${objectKey}`,
		data: {
			url: data.url,
			fields: {
				key: data.fields.key,
				acl: data.fields.acl,
				bucket: data.fields.bucket,
				XAmzAlgorithm: data.fields['X-Amz-Algorithm'],
				XAmzCredential: data.fields['X-Amz-Credential'],
				XAmzDate: data.fields['X-Amz-Date'],
				Policy: data.fields.Policy,
				XAmzSignature: data.fields['X-Amz-Signature'],
			},
		},
	}
}
