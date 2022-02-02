import { Mongo } from 'meteor/mongo';
import { Player } from './players';

export interface PlayerCard {
  player: Player;
  card: number;
}

export interface Game {
  _id?: string;
  createdAt: Date;
  roomHash: string;
  cards: Array<PlayerCard>;
}

export const GamesCollection = new Mongo.Collection<Game>('games');
