import { Mongo } from "meteor/mongo";

export interface Player {
  _id?: string;
  username: string;
  roomHash?: string;
}

export const PlayersCollection = new Mongo.Collection<Player>('players');
