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

export type Perspective = {
  player: Player;
  doubles: number;
  triples: number;
  quadruples: number;
};

export enum Phase {
  CountRanks,
  Round1,
  Round2,
  Revealable,
  Revealed
}

export type Guess1 = {
  rank: number;
};

export type Guess2 = Guess1 & {
  card: Card;
};

export interface Player {
  user: User;
  rank: number;
  card: Card;
  guess1?: Guess1;
  guess2?: Guess2;
}

export interface Game {
  _id?: string;
  createdAt: Date;
  roomHash: string;
  perspectives: Array<Perspective>;
  players: Array<Player>;
  phase: Phase;
  turn: number;
}

export const GamesCollection = new Mongo.Collection<Game>('games');
