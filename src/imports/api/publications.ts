import { Meteor } from 'meteor/meteor';

import { GamesCollection } from '../db/games';
import { PlayersCollection } from '../db/players';
import { RoomsCollection } from '../db/rooms';

Meteor.publish('rooms', function publishRooms(roomHash: string) {
  return RoomsCollection.find({ hash: roomHash });
});

Meteor.publish('players', function publishPlayers(roomHash: string) {
  return PlayersCollection.find({ roomHash: roomHash });
});

Meteor.publish('games', function publishGames(roomHash: string) {
  return GamesCollection.find({ roomHash: roomHash });
});
