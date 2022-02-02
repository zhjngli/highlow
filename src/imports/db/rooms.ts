import { Mongo } from 'meteor/mongo';

export interface Room {
  _id?: string;
  hash: string;
  createdAt: Date;
  userIds: Array<string>;
  gameId?: string;
}

export const RoomsCollection = new Mongo.Collection<Room>('rooms');
