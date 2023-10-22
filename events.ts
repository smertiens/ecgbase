interface EventAware {
  addEventListener: (eventType: string, fn : (...args : any[]) => boolean) => void
  removeEventListener: (eventType: string, fn : (...args : any[]) => boolean) => void
  emit(eventType: string, ...args: any): void
}

class EventBase implements EventAware {
  _events: { [key: string]: ((...args : any[]) => boolean)[] } = {}

  hasEvent(eventType: string): boolean {
    return Object.keys(this._events).indexOf(eventType) > -1
  }

  public addEventListener(eventType: string, fn : (...args : any[]) => boolean): void {
    if (! this.hasEvent(eventType)) {
      this._events[eventType] = []
    }
    
    this._events[eventType].push(fn)
  }

  removeEventListener(eventType: string, fn : (...args : any[]) => boolean): void {
    if (! this.hasEvent(eventType)) {
      return
    }
    
    let ind = this._events[eventType].indexOf(fn)

    if (ind > -1) {
      this._events[eventType].splice(ind, 1)
    }
  } 
  
  emit(eventType: string, ...args: any): void {
    if (! this.hasEvent(eventType)) {
      return
    }
    
    for (let item of this._events[eventType]) {
      if (!item(args)) {
        break
      }
    }
  }
}

export { EventAware, EventBase }