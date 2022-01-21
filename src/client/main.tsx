import { Meteor } from 'meteor/meteor';
import React from 'react';
import { render } from 'react-dom';

import { setPlayerId } from '../imports/api/session';
import App from '../imports/ui/app';

Meteor.startup(() => {
  render(<App />, document.getElementById('react-target'));
  setPlayerId(Meteor.call('player.create', ''));
});
