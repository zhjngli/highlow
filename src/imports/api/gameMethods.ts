import { Meteor } from 'meteor/meteor';

import { GamesCollection, Player } from '../db/games';
import { RoomsCollection } from '../db/rooms';
import { User } from '../db/users';

function randomCard(): number {
  const cards = [2, 3, 4, 5, 6, 7, 8, 9];
  return cards[Math.floor(Math.random() * cards.length)];
}

Meteor.methods({
  'games.create'(roomHash: string, users: Array<User>) {
    if (!users || users.length == 0) {
      throw new Meteor.Error('there must be at least one user to start a game');
    }

    const players: Array<Player> = users.map((user) => ({
      user: user,
      card: randomCard()
    }));

    const gameId: string = GamesCollection.insert({
      createdAt: new Date(),
      roomHash: roomHash,
      players: players
    });

    const rooms = RoomsCollection.find({ hash: roomHash }).fetch();
    if (rooms.length == 1) {
      const roomId = rooms[0]._id;

      RoomsCollection.update(
        { _id: roomId },
        {
          $set: {
            gameId: gameId
          }
        }
      );

      return gameId;
    } else if (rooms.length == 0) {
      throw new Meteor.Error(`could not find room with id: ${roomHash}`);
    } else {
      throw new Meteor.Error(`found more than one room with id: ${roomHash}`);
    }
  },
  'games.quit'(roomHash: string, gameId: string) {
    GamesCollection.remove({ _id: gameId });

    const rooms = RoomsCollection.find({ hash: roomHash }).fetch();
    if (rooms.length == 1) {
      const roomId = rooms[0]._id;

      RoomsCollection.update(
        { _id: roomId },
        {
          $unset: {
            gameId: gameId
          }
        }
      );
    } else if (rooms.length == 0) {
      throw new Meteor.Error(`could not find room with id: ${roomHash}`);
    } else {
      throw new Meteor.Error(`found more than one room with id: ${roomHash}`);
    }
  }
});
