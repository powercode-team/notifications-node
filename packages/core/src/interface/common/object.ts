export interface IObject<Value = any> extends Partial<object> {
  [key: string]: Value;
}
