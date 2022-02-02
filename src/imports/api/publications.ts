import { Meteor } from 'meteor/meteor';

import { GamesCollection } from '../db/games';
import { UsersCollection } from '../db/users';
import { RoomsCollection } from '../db/rooms';

Meteor.publish('rooms', function publishRooms(roomHash: string) {
  return RoomsCollection.find({ hash: roomHash });
});

Meteor.publish('users', function publishUsers(roomHash: string) {
  return UsersCollection.find({ roomHash: roomHash });
});

Meteor.publish('games', function publishGames(roomHash: string) {
  return GamesCollection.find({ roomHash: roomHash });
});
