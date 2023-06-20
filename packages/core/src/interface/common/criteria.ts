import { PK } from '../../type';
import { IObject } from './object';

export type Criteria<Id extends PK = PK> = Id | Id[] | IObject;
