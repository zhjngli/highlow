import { Mongo } from 'meteor/mongo';

import { Player } from './players';

export interface Room {
  _id?: string;
  hash: string;
  createdAt: Date;
  players: Array<Player>;
}

export const RoomsCollection = new Mongo.Collection<Room>('rooms');
