import { IObject } from '../../interface';

/**
 * Console Transport specific data
 */
export interface IConsoleData extends IObject {
  to: string,
  text: string,
}
