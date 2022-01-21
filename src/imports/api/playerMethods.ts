import { Meteor } from 'meteor/meteor';

import { PlayersCollection } from '../db/players';

Meteor.methods({
  'player.create'(username: string) {
    const playerId: string = PlayersCollection.insert({
      username: username
    });
    return playerId;
  }
});
