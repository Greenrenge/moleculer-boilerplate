import UIDGenerator from 'uid-generator'

const uidgen = new UIDGenerator(256)

export default {
	methods: {
		generateToken() {
			return uidgen.generateSync()
		},
	},
}
