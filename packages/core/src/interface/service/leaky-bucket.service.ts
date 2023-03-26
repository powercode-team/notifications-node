export interface ILeakyBucketService {
  /** Count limit by transport alias, should clear old and mark returned count as unavailable */
  calcLimit(transport: string): Promise<number | undefined>;
}
