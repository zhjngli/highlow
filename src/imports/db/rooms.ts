import { Mongo } from 'meteor/mongo';

export interface User {
  username: string;
}

export interface Room {
  _id?: string;
  hash: string;
  createdAt: Date;
  users: Array<User>;
}

export const RoomsCollection = new Mongo.Collection<Room>('rooms');
