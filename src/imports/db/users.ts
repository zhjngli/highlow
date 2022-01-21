import { Mongo } from "meteor/mongo";

export interface User {
  _id?: string;
  username: string;
  roomHash?: string;
}

export const UsersCollection = new Mongo.Collection<User>('users');
