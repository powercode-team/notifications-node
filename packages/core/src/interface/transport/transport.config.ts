import { ILeakyBucketService, IResendStrategy } from '../service';

export interface ITransportConfig {
  /**
   * Leaky Bucket
   *
   * If defined, overrides the general configuration for this transport
   */
  leakyBucket?: ILeakyBucketService;

  /**
   * Leaky Bucket
   *
   * If defined, overrides the general configuration for this transport
   */
  resendStrategy?: IResendStrategy;

  /**
   * Processing Interval (sec)
   *
   * If defined, overrides the general configuration for this transport
   */
  processingInterval?: number; // in seconds
}
