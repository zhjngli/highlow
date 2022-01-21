import { Meteor } from 'meteor/meteor';

import { RoomsCollection } from '../db/rooms';
import { Player } from '../db/players';

function randomRoomHash(): string {
  let hash = '';
  const possible = 'abcdefghijklmnopqrstuvwxyz';

  for (let i = 0; i < 4; i++) hash += possible.charAt(Math.floor(Math.random() * possible.length));

  return hash;
}

Meteor.methods({
  'rooms.create'(username: string) {
    if (!username) {
      throw new Meteor.Error('username must be supplied');
    }

    let roomHash: string = randomRoomHash();
    let rooms = RoomsCollection.find({ hash: roomHash }).count();
    while (rooms > 0) {
      roomHash = randomRoomHash();
      rooms = RoomsCollection.find({ hash: roomHash }).count();
    }

    const players: Array<Player> = [];
    players.push({ username: username, roomHash: roomHash });

    RoomsCollection.insert({
      hash: roomHash,
      createdAt: new Date(),
      players: players
    });

    return roomHash;
  },
  'rooms.join'(roomHash: string, username: string) {
    if (!roomHash) {
      throw new Meteor.Error("can't join null room");
    }
    if (!username) {
      throw new Meteor.Error('username must be supplied');
    }

    const rooms = RoomsCollection.find({ hash: roomHash }).fetch();
    if (rooms.length == 1) {
      const roomId = rooms[0]._id;
      RoomsCollection.update({ _id: roomId }, {
        $addToSet: {
          players: {
            username: username,
            roomHash: roomHash
          }
        }
      });
      return roomHash;
    } else if (rooms.length == 0) {
      throw new Meteor.Error(`could not find room with id: ${roomHash}`);
    } else {
      throw new Meteor.Error(`found more than one room with id: ${roomHash}`);
    }
  }
});
