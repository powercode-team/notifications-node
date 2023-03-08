import { INotificationEntity, INotificationRepository, IOptions, NotificationStatusEnum } from '@node-notifications/core';
import { In } from 'typeorm';
import { FindWhere } from '../type';
import { BaseRepository } from './base.repository';

type Entity = INotificationEntity<number, string>;

export class NotificationRepository extends BaseRepository<Entity> implements INotificationRepository<number, string> {
  markAsRead(id: number): Promise<Entity | null> {
    return this.updateEntity({ id, status: NotificationStatusEnum.READ });
  }

  findByRecipient(userId: string, filter?: FindWhere<Entity>, options?: IOptions): Promise<Entity[]> {
    return this.find({
      where: { ...filter, recipientId: <any> userId },
      ...this.prepareFindManyOptions(options),
    });
  }

  findBySender(userId: string, filter?: FindWhere<Entity>, options?: IOptions): Promise<Entity[]> {
    return this.find({
      where: { ...filter, senderId: <any> userId },
      ...this.prepareFindManyOptions(options),
    });
  }

  findByTransport(transport: string | string[], options?: IOptions): Promise<Entity[]> {
    if (transport.length < 1) {
      throw new Error('Undefined transport');
    }
    const where: FindWhere<Entity> = {
      transport: typeof transport === 'string' ? transport : transport.length > 1 ? In(transport) : transport[0],
    };

    return this.find({ where, ...this.prepareFindManyOptions(options) });
  }
}
