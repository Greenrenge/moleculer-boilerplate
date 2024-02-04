export default function (eventNamesPair) {
	const events = {}

	eventNamesPair.forEach(([depsEvent, localActionEvent]) => {
		events[depsEvent] = function () {
			if (this.broker.cacher) {
				this.logger.debug(`Clear local '${this.name}' cache`)
				this.broker.cacher.clean(`${localActionEvent}`)
				this.broker.broadcast(
					`cache.clean.${localActionEvent.replace('.**', '').replace('**', '')}`,
				)
			}
		}
	})

	return {
		events,
	}
}
