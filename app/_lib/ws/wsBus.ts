
export class WsBus {

    private subscriptions = new Map<string, ((msg: string) => void)[]>()

    subscribe(topic: string, callback: (msg: string) => void) {

        const list = this.subscriptions.get(topic) ?? []
        list.push(callback);
        this.subscriptions.set(topic, list)

        return () => {
            const updated = this.subscriptions.get(topic)?.filter(fn => fn !== callback)
            if (updated?.length) this.subscriptions.set(topic, updated)
            else this.subscriptions.delete(topic)
        }

    }
    
    dispatch(topic: string, msg: string) {
        this.subscriptions.get(topic)?.forEach(fn => fn(msg))
    }

    hasSubscribers(topic: string) {
        return this.subscriptions.has(topic)
    }

}