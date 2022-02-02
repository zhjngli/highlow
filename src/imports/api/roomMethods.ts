import { Meteor } from 'meteor/meteor';

import { UsersCollection } from '../db/users';
import { RoomsCollection } from '../db/rooms';

function randomRoomHash(): string {
  let hash = '';
  const possible = 'abcdefghijklmnopqrstuvwxyz';

  for (let i = 0; i < 4; i++) hash += possible.charAt(Math.floor(Math.random() * possible.length));

  return hash;
}

Meteor.methods({
  'rooms.create'(userId: string, username: string) {
    if (!username) {
      throw new Meteor.Error('username must be supplied');
    }

    let roomHash: string = randomRoomHash();
    let rooms = RoomsCollection.find({ hash: roomHash }).count();
    while (rooms > 0) {
      roomHash = randomRoomHash();
      rooms = RoomsCollection.find({ hash: roomHash }).count();
    }

    UsersCollection.update({ _id: userId }, { $set: { username: username, roomHash: roomHash } });

    RoomsCollection.insert({
      hash: roomHash,
      createdAt: new Date(),
      userIds: [userId]
    });

    return roomHash;
  },
  'rooms.join'(roomHash: string, userId: string, username: string) {
    if (!roomHash) {
      throw new Meteor.Error("can't join null room");
    }
    if (!username) {
      throw new Meteor.Error('username must be supplied');
    }
    console.log(`user when joining room: ${userId}, ${username}, ${roomHash}`);

    const rooms = RoomsCollection.find({ hash: roomHash }).fetch();
    if (rooms.length == 1) {
      const roomId = rooms[0]._id;

      UsersCollection.update({ _id: userId }, { $set: { username: username, roomHash: roomHash } });

      RoomsCollection.update(
        { _id: roomId },
        {
          $addToSet: {
            userIds: userId
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
  'rooms.leave'(roomHash: string, userId: string) {
    if (!roomHash) {
      throw new Meteor.Error("can't leave null room");
    }
    console.log(`user leaving room: ${userId}, ${roomHash}`);

    const rooms = RoomsCollection.find({ hash: roomHash }).fetch();
    if (rooms.length == 1) {
      const roomId = rooms[0]._id;

      UsersCollection.update({ _id: userId }, { $unset: { roomHash: '' } });

      RoomsCollection.update(
        { _id: roomId },
        { $pull: { userIds: userId } }
      );
    } else if (rooms.length == 0) {
      throw new Meteor.Error(`could not find room with id: ${roomHash}`);
    } else {
      throw new Meteor.Error(`found more than one room with id: ${roomHash}`);
    }
  }
});
