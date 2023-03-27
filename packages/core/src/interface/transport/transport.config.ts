import { IErrorHandler, ILeakyBucketService } from '../service';

export interface ITransportConfig {
  /**
   * Error Processing
   *
   * If defined, overrides the general configuration for this transport
   */
  errorHandler?: IErrorHandler;

  /**
   * Leaky Bucket
   *
   * If defined, overrides the general configuration for this transport
   */
  leakyBucket?: ILeakyBucketService;

  /**
   * Processing Interval (sec)
   *
   * If defined, overrides the general configuration for this transport
   */
  processingInterval?: number; // in seconds
}
