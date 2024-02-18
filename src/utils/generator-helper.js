export const getChunk = (size) =>
	async function* (iterator) {
		while (true) {
			let i = 0
			const values = []
			let value

			do {
				value = await iterator.next()
				if (value) values.push(value)
				i++
			} while (i < size && value !== null)

			yield values
			if (values.length < size) break
		}
	}
