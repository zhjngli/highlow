import { Mongo } from 'meteor/mongo';
import { User } from './users';

export interface Player {
  user: User;
  card: number;
}

export interface Game {
  _id?: string;
  createdAt: Date;
  roomHash: string;
  players: Array<Player>;
}

export const GamesCollection = new Mongo.Collection<Game>('games');
