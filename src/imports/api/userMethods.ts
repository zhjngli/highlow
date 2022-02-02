import { Meteor } from 'meteor/meteor';

import { UsersCollection } from '../db/users';

Meteor.methods({
  'user.create'(username: string) {
    const userId: string = UsersCollection.insert({
      username: username,
      createdAt: new Date()
    });
    return userId;
  }
});
