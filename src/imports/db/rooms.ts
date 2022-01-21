import { Mongo } from 'meteor/mongo';

export interface Room {
  _id?: string;
  hash: string;
  createdAt: Date;
  playerIds: Array<string>;
}

export const RoomsCollection = new Mongo.Collection<Room>('rooms');
