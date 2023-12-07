import load from '../../utils/moduleLoader.js'

export default {
  name: 'hello',
  version: 1,
  actions: await load('actions'),
  events: await load('events'),
  methods: await load('methods'),
}
