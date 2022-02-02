import { Mongo } from 'meteor/mongo';

export interface User {
  _id?: string;
  username: string;
  createdAt: Date;
  roomHash?: string;
}

export const UsersCollection = new Mongo.Collection<User>('users');
