import broker from '@/broker.js'

const logger = process.env.REPL ? console : broker.logger

export default logger
