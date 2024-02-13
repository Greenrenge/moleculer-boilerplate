import type { ClaimRawRule, SubjectRawRule } from '@casl/ability'
import type { Context } from 'moleculer'

export type AppContextMeta<Params> = Context<
	Params,
	{
		userId: string
		permissions: (ClaimRawRule<any> | SubjectRawRule<any, any, any>)[]
		$fileInfo?: {
			filename: string
			mimetype: string
			// size: number
		}
	}
>
