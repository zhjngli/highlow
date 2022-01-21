import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import React from 'react';
import { RouteComponentProps } from 'react-router-dom';

import { Player, PlayersCollection } from '/src/imports/db/players';
import { Room, RoomsCollection } from '/src/imports/db/rooms';

type RoomRouteProps = RouteComponentProps<{ hash: string }>;

type RoomProps = {
  hash: string;
  room: Room;
  players?: Array<Player>;
};

type RoomUIProps = RoomProps & RoomRouteProps;

class RoomUI extends React.Component<RoomUIProps> {
  constructor(props: RoomUIProps) {
    super(props);
  }

  render(): React.ReactElement {
    if (this.props.room && this.props.players) {
      return (
        <div>
          <ul>
            {this.props.players.map((player) => (
              <li key={player._id}>{player.username} is in the room.</li>
            ))}
          </ul>
        </div>
      );
    }
    return (
      <div>
        <p>couldn&apos;t find room: {this.props.hash}!</p>
      </div>
    );
  }
}

export default withTracker(function (props: RoomRouteProps) {
  const roomHash = props.match.params.hash;
  Meteor.subscribe('rooms', roomHash);
  Meteor.subscribe('players', roomHash);

  const rooms = RoomsCollection.find({ hash: roomHash }).fetch();
  const players = PlayersCollection.find({ roomHash: roomHash }).fetch();

  if (rooms.length == 1) {
    return {
      hash: roomHash,
      room: rooms[0],
      players: players
    };
  } else {
    // too many rooms (shouldn't ever happen), or room doesn't exist
    return {
      hash: roomHash,
      room: { hash: roomHash, createdAt: new Date(), playerIds: [''] }
    };
  }
})(RoomUI);
