import { Meteor } from 'meteor/meteor';
import React from 'react';
import { render } from 'react-dom';

import { setUserId } from '../imports/api/session';
import App from '../imports/ui/app';

Meteor.startup(() => {
  render(<App />, document.getElementById('react-target'));

  Meteor.call('user.create', '', (err: Meteor.Error, res: string) => {
    if (err) {
      alert(err);
    } else {
      setUserId(res);
    }
  });
});
