import '../imports/api/roomMethods';
import '../imports/api/userMethods';
import '../imports/api/gameMethods';
import '../imports/api/publications';

import { Meteor } from 'meteor/meteor';

Meteor.startup(() => {
  console.log('server startup');
});
