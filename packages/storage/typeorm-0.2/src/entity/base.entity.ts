import { IEntity, PrimaryKey } from '@notifications-system/core';

export abstract class BaseEntity<ID extends PrimaryKey> implements IEntity<ID> {
  abstract id: ID;
}
