import type { ClaimRawRule, SubjectRawRule } from '@casl/ability'
import type { Context, Service, ServiceSettingSchema } from 'moleculer'
import type { ResolveTokenReturn } from 'v1.auth.resolveToken'

export type MoleculerService = Service<ServiceSettingSchema>

export type AppContextMeta<Params> = Context<
	Params,
	{
		// // from mixin at the gateway level
		// userId: string
		// roleId?: string
		// permissions: (ClaimRawRule<any> | SubjectRawRule<any, any, any>)[]
		userId: Awaited<ResolveTokenReturn>['_id']
		$fileInfo?: {
			filename: string
			mimetype: string
			// size: number
		}
	} & Omit<Awaited<ResolveTokenReturn>, '_id'>
>

export type ObjectValues<T> = T[keyof T]

type IfAny<IFTYPE, THENTYPE, ELSETYPE = IFTYPE> = 0 extends 1 & IFTYPE ? THENTYPE : ELSETYPE
type IfUnknown<IFTYPE, THENTYPE> = unknown extends IFTYPE ? THENTYPE : IFTYPE

// type StringIfTruthy<T> = IfAny<T, string, never>;

// // If T is truthy, StringIfTruthy<T> will be string, otherwise never
// let s1: StringIfTruthy<string> = "hello"; // Valid: string is truthy
// let s2: StringIfTruthy<number> = 123; // Error: number is not truthy, never cannot be assigned to string

// type UserDefinedType<T> = IfAny<T, T extends { name: string } ? T : never>;

// // If T has a property named "name" of type string, UserDefinedType<T> will be T, otherwise never
// interface User {
//   name: string;
//   age: number;
// }

// let u1: UserDefinedType<User> = { name: "Alice", age: 30 }; // Valid: User has a name property
// let u2: UserDefinedType<number> = 10; // Error: number does not have a name property
