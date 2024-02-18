import type { ServiceSchema } from 'moleculer'
import type { AppContextMeta } from '@/common-types'
import { ServiceValidationError, ValidationError } from '@/constants/errors'
import {
	createUploadPictureSignedURL,
	createUploadBuffer,
	createUploadStream,
} from '@/services/auth-service/utils/s3'

export interface CreateUploadPictureSignedURLParams {
	objectKey: string
	onlyImage?: boolean
	publicRead?: boolean
	minSize?: number
	maxSize?: number
	expiresInSec?: number
	startsWith?: string
}

export interface SingleFileUploadBufferParams {
	objectKey: string
	buffer: {
		data: Buffer
	}
}

const service = {
	name: 'upload',
	version: 1,
	actions: {
		createUploadPictureSignedURL: {
			params: {
				objectKey: { type: 'string' },
				onlyImage: { type: 'boolean', optional: true, default: true },
				publicRead: { type: 'boolean', optional: true, default: false },
				minSize: {
					type: 'number',
					positive: true,
					integer: true,
					optional: true,
					default: 1000,
				},
				maxSize: {
					type: 'number',
					positive: true,
					integer: true,
					optional: true,
					default: 10000000,
				},
				expiresInSec: {
					type: 'number',
					positive: true,
					integer: true,
					optional: true,
					default: 5 * 60,
				},
				startsWith: { type: 'string', optional: true },
			},
			/**
			 * @param {import('moleculer').Context<CreateUploadPictureSignedURLParams>} ctx
			 */
			handler(ctx: AppContextMeta<CreateUploadPictureSignedURLParams>) {
				const { objectKey, onlyImage, publicRead, minSize, maxSize, expiresInSec, startsWith } =
					ctx.params
				return createUploadPictureSignedURL({
					objectKey,
					onlyImage,
					publicRead,
					minSize,
					maxSize,
					expiresInSec,
					startsWith,
				})
			},
		},
		singleFileUploadBuffer: {
			params: {
				objectKey: { type: 'string' },
				buffer: { type: 'any' },
			},
			/**
			 * @param {import('moleculer').Context<SingleFileUploadBufferParams>} ctx
			 */
			async handler(ctx: AppContextMeta<SingleFileUploadBufferParams>) {
				if (!ctx.meta.$fileInfo) throw new ServiceValidationError('FILE_NOT_FOUND')
				return createUploadBuffer(ctx.params, ctx.meta.$fileInfo)
			},
		},
		singleFileUploadStream: {
			/**
			 * @param {import('moleculer').Context} ctx
			 */
			async handler(ctx) {
				const { objectKey, $fileInfo } = ctx.meta
				const uploadStream = createUploadStream(objectKey, $fileInfo)
				ctx.params.pipe(uploadStream.writeStream)
				const result = await uploadStream.promise
				return result
			},
		},
	},
} as ServiceSchema

export default service
