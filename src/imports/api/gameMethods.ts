import { Meteor } from 'meteor/meteor';

import { GamesCollection, Phase, Player } from '../db/games';
import { RoomsCollection } from '../db/rooms';
import { User } from '../db/users';
import { findRoomAnd } from './roomMethods';

function randomCard(): number {
  const cards = [2, 3, 4, 5, 6, 7, 8, 9];
  return cards[Math.floor(Math.random() * cards.length)];
}

function shuffle<T>(arr: Array<T>): Array<T> {
  let i = arr.length;
  let j;

  while (i != 0) {
    j = Math.floor(Math.random() * i);
    i--;
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr;
}

Meteor.methods({
  'games.create'(roomHash: string, users: Array<User>) {
    if (!users || users.length == 0) {
      throw new Meteor.Error('there must be at least one user to start a game');
    }

    return findRoomAnd(roomHash, (roomId) => {
      let players: Array<Player> = users.map((user) => ({
        user: user,
        card: randomCard()
      }));
      players = shuffle(players);

      const gameId: string = GamesCollection.insert({
        createdAt: new Date(),
        roomHash: roomHash,
        players: players,
        phase: Phase.CountRanks,
        turn: 0
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
