import { Meteor } from 'meteor/meteor';

import { PlayersCollection } from '../db/players';
import { RoomsCollection } from '../db/rooms';

function randomRoomHash(): string {
  let hash = '';
  const possible = 'abcdefghijklmnopqrstuvwxyz';

  for (let i = 0; i < 4; i++) hash += possible.charAt(Math.floor(Math.random() * possible.length));

  return hash;
}

Meteor.methods({
  'rooms.create'(playerId: string, username: string) {
    if (!username) {
      throw new Meteor.Error('username must be supplied');
    }

    let roomHash: string = randomRoomHash();
    let rooms = RoomsCollection.find({ hash: roomHash }).count();
    while (rooms > 0) {
      roomHash = randomRoomHash();
      rooms = RoomsCollection.find({ hash: roomHash }).count();
    }

    PlayersCollection.update({ _id: playerId }, { $set: { username: username, roomHash: roomHash } });

    RoomsCollection.insert({
      hash: roomHash,
      createdAt: new Date(),
      playerIds: [playerId]
    });

    return roomHash;
  },
  'rooms.join'(roomHash: string, playerId: string, username: string) {
    if (!roomHash) {
      throw new Meteor.Error("can't join null room");
    }
    if (!username) {
      throw new Meteor.Error('username must be supplied');
    }
    console.log(`player when joining room: ${playerId}, ${username}, ${roomHash}`);

    const rooms = RoomsCollection.find({ hash: roomHash }).fetch();
    if (rooms.length == 1) {
      const roomId = rooms[0]._id;

      PlayersCollection.update({ _id: playerId }, { $set: { username: username, roomHash: roomHash } });

      RoomsCollection.update(
        { _id: roomId },
        {
          $addToSet: {
            playerIds: playerId
          }
        }
      );
      return roomHash;
    } else if (rooms.length == 0) {
      throw new Meteor.Error(`could not find room with id: ${roomHash}`);
    } else {
      throw new Meteor.Error(`found more than one room with id: ${roomHash}`);
    }
  },
  'rooms.leave'(roomHash: string, playerId: string) {
    if (!roomHash) {
      throw new Meteor.Error("can't leave null room");
    }
    console.log(`player leaving room: ${playerId}, ${roomHash}`);

    const rooms = RoomsCollection.find({ hash: roomHash }).fetch();
    if (rooms.length == 1) {
      const roomId = rooms[0]._id;

      PlayersCollection.update({ _id: playerId }, { $unset: { roomHash: '' } });

      RoomsCollection.update(
        { _id: roomId },
        { $pull: { playerIds: playerId } }
      );
    } else if (rooms.length == 0) {
      throw new Meteor.Error(`could not find room with id: ${roomHash}`);
    } else {
      throw new Meteor.Error(`found more than one room with id: ${roomHash}`);
    }
  }
});
