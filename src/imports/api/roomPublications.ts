import { Meteor } from 'meteor/meteor';
import { RoomsCollection } from '../db/rooms';

Meteor.publish('rooms', function publishRooms(roomHash: string) {
  return RoomsCollection.find({ hash: roomHash });
});
