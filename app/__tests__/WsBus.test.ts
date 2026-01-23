import { WsBus } from '../_lib/ws/wsBus'

describe('WsBus', () => {
  it('notifies subscribers when message is dispatched', () => {
    const bus = new WsBus()
    const callback = jest.fn()
    
    bus.subscribe('/topic/test', callback)
    bus.dispatch('/topic/test', 'hello')
    
    expect(callback).toHaveBeenCalledWith('hello')
  })

  it('allows unsubscribe', () => {
    const bus = new WsBus()
    const callback = jest.fn()
    
    const unsubscribe = bus.subscribe('/topic/test', callback)
    unsubscribe()
    bus.dispatch('/topic/test', 'hello')
    
    expect(callback).not.toHaveBeenCalled()
  })

  it('supports multiple subscribers', () => {
    const bus = new WsBus()
    const callback1 = jest.fn()
    const callback2 = jest.fn()
    
    bus.subscribe('/topic/test', callback1)
    bus.subscribe('/topic/test', callback2)
    bus.dispatch('/topic/test', 'hello')
    
    expect(callback1).toHaveBeenCalledWith('hello')
    expect(callback2).toHaveBeenCalledWith('hello')
  })
})