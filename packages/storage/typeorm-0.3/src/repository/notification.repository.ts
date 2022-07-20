import { INotificationEntity, INotificationRepository, IOptions, NotificationStatusEnum, PrimaryKey } from '@notifications-system/core';
import { In } from 'typeorm';
import { FindWhere } from '../type';
import { BaseRepository } from './base.repository';

type Entity<USER_ID extends PrimaryKey> = INotificationEntity<string, USER_ID>;

export class NotificationRepository<USER_ID extends PrimaryKey = PrimaryKey> extends BaseRepository<Entity<USER_ID>, string>
  implements INotificationRepository<string, USER_ID> {

  markAsRead(id: string): Promise<Entity<USER_ID> | null> {
    return this.updateEntity({ id, status: NotificationStatusEnum.READ });
  }

  findByRecipient(userId: USER_ID, filter?: FindWhere<Entity<USER_ID>>, options?: IOptions): Promise<Entity<USER_ID>[]> {
    return this.find({
      where: { ...filter, recipientId: <any> userId },
      ...this.prepareFindManyOptions(options),
    });
  }

  findBySender(userId: USER_ID, filter?: FindWhere<Entity<USER_ID>>, options?: IOptions): Promise<Entity<USER_ID>[]> {
    return this.find({
      where: { ...filter, senderId: <any> userId },
      ...this.prepareFindManyOptions(options),
    });
  }

  findByTransport(transport: string | string[], options?: IOptions): Promise<Entity<USER_ID>[]> {
    if (transport.length < 1) {
      throw new Error('Undefined transport');
    }
    const where: FindWhere<Entity<USER_ID>> = {
      transport: typeof transport === 'string' ? transport : transport.length > 1 ? In(transport) : transport[0],
    };

    return this.find({ where, ...this.prepareFindManyOptions(options) });
  }
}
