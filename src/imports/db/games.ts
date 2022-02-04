import { Mongo } from 'meteor/mongo';

import { User } from './users';

export enum Card {
  TWO,
  THREE,
  FOUR,
  FIVE,
  SIX,
  SEVEN,
  EIGHT,
  NINE,
  TEN,
  JACK,
  QUEEN,
  KING,
  ACE
}

export enum Phase {
  CountRanks,
  Round1,
  Round2,
  Reveal
}

export type Rank = number;
export type RankAndCard = [number, Card];

export interface Player {
  user: User;
  card: Card;
  guess1?: Rank;
  guess2?: RankAndCard;
}

export interface Game {
  _id?: string;
  createdAt: Date;
  roomHash: string;
  players: Array<Player>;
  phase: Phase;
  turn: number;
}

export const GamesCollection = new Mongo.Collection<Game>('games');
