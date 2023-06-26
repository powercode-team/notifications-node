export interface IEventEmitter {
  emit(eventName: string | symbol, ...args: any[]): boolean;
}
