import { IDataProvider, IOriginalData } from '../../interface';
import { IConsoleData } from './console-data.interface';

export class ConsoleDataProvider<ORIGINAL_DATA extends IOriginalData = IOriginalData> implements IDataProvider<IConsoleData, ORIGINAL_DATA> {
  originToTransport(originalData: ORIGINAL_DATA, transportData?: Partial<IConsoleData>): Promise<IConsoleData> {
    return Promise.resolve({
      to: typeof originalData.recipient === 'string' ? originalData.recipient : JSON.stringify(originalData.recipient),
      text: typeof originalData.payload === 'string'
        ? originalData.payload
        : `${originalData.payload.title}|${originalData.payload.body}`,
      ...transportData,
    });
  }
}
