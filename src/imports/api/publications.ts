import { Meteor } from 'meteor/meteor';

import { GamesCollection } from '../db/games';
import { RoomsCollection } from '../db/rooms';
import { UsersCollection } from '../db/users';

Meteor.publish('rooms', function publishRooms(roomHash: string) {
  return RoomsCollection.find({ hash: roomHash });
});

Meteor.publish('users', function publishUsers(roomHash: string) {
  return UsersCollection.find({ roomHash: roomHash });
});

Meteor.publish('games', function publishGames(gameId: string) {
  return GamesCollection.find({ _id: gameId });
});
