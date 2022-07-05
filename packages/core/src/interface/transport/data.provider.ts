import { IObject } from '../common';
import { IOriginalData } from './original.data';

/**
 * Transform data from ORIGINAL_DATA format to TRANSPORT_DATA format
 */
export interface IDataProvider<TRANSPORT_DATA extends IObject, ORIGINAL_DATA extends IOriginalData = IOriginalData> {
  /**
   * Prepare specific Transport Data from general Origin Data
   */
  originToTransport(data: ORIGINAL_DATA, transportData?: Partial<TRANSPORT_DATA>): Promise<TRANSPORT_DATA>;
}
