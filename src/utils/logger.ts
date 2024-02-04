import broker from '@/customBroker'

const logger = process.env.REPL ? console : broker.logger

export default logger
