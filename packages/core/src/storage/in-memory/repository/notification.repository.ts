import { INotificationEntity, INotificationRepository, IOptions } from '../../../interface';
import { NotificationStatusEnum, PartialProps } from '../../../type';
import { MemoryNotificationEntity } from '../entity/notification.entity';
import { MemoryBaseRepository } from './base.repository';

type Entity = INotificationEntity<string, string>;

export class MemoryNotificationRepository extends MemoryBaseRepository<Entity> implements INotificationRepository<string, string> {
  entityClass = MemoryNotificationEntity.name;

  instantiate(data?: Partial<INotificationEntity<string>>): PartialProps<Entity, 'id'> {
    const entity = new MemoryNotificationEntity();
    Object.assign(entity, data);

    return entity;
  }

  markAsRead(id: string): Promise<Entity | null> {
    return this.updateEntity({ id, status: NotificationStatusEnum.READ });
  }

  findByTransport(transport: string | string[], options?: IOptions): Promise<Entity[]> {
    if (transport.length < 1) {
      throw new Error('Undefined transport');
    }

    return this.findBy({ transport }, options);
  }
}
