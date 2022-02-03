import { Meteor } from 'meteor/meteor';

import { GamesCollection, Player } from '../db/games';
import { RoomsCollection } from '../db/rooms';
import { User } from '../db/users';
import { findRoomAnd } from './roomMethods';

function randomCard(): number {
  const cards = [2, 3, 4, 5, 6, 7, 8, 9];
  return cards[Math.floor(Math.random() * cards.length)];
}

Meteor.methods({
  'games.create'(roomHash: string, users: Array<User>) {
    if (!users || users.length == 0) {
      throw new Meteor.Error('there must be at least one user to start a game');
    }

    findRoomAnd(roomHash, (roomId) => {
      const players: Array<Player> = users.map((user) => ({
        user: user,
        card: randomCard()
      }));

      const gameId: string = GamesCollection.insert({
        createdAt: new Date(),
        roomHash: roomHash,
        players: players
      });

      RoomsCollection.update(
        { _id: roomId },
        {
          $set: {
            gameId: gameId
          }
        }
      );

      return gameId;
    });
  },
  'games.quit'(roomHash: string, gameId: string) {
    GamesCollection.remove({ _id: gameId });

    findRoomAnd(roomHash, (roomId) => {
      RoomsCollection.update(
        { _id: roomId },
        {
          $unset: {
            gameId: gameId
          }
        }
      );
    });
  }
});
