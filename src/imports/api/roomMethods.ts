import { Meteor } from 'meteor/meteor';

import { RoomsCollection, User } from '../db/rooms';

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

    const users: Array<User> = [];
    users.push({ username: username });

    RoomsCollection.insert({
      hash: roomHash,
      createdAt: new Date(),
      users: users
    });

    return roomHash;
  },
  'rooms.join'(roomHash: string, username: string) {
    if (!roomHash) {
      throw new Meteor.Error("can't join null room");
    }
    if (!username) {
      throw new Meteor.Error('unknown user');
    }

    const rooms = RoomsCollection.find({ hash: roomHash }).fetch();
    console.log(rooms);
  }
});
