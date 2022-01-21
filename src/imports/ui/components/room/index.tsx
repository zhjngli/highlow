import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Room, RoomsCollection } from '/src/imports/db/rooms';

type RoomRouteProps = RouteComponentProps<{ hash: string }>;

type RoomProps = {
  hash: string;
  room?: Room;
}

type RoomUIProps = RoomProps & RoomRouteProps;

class RoomUI extends React.Component<RoomUIProps> {
  constructor(props: RoomUIProps) {
    super(props);
  }

  render(): React.ReactElement {
    if (this.props.room) {
      const players = this.props.room.players;
      return (
        <div>
          <ul>
            {players.map(player => (
              <li key={player._id}>{player.username} is in the room.</li>
            ))}
          </ul>
        </div>
      );
    }
    return <div><p>couldn't find room: {this.props.hash}!</p></div>;
  }
}

export default withTracker(function (props: RoomRouteProps) {
  Meteor.subscribe('rooms', props.match.params.hash);
  const rooms = RoomsCollection.find({
      hash: props.match.params.hash,
    }
  ).fetch();
  if (rooms.length == 1){
    return {
      hash: props.match.params.hash,
      room: rooms[0]
    }
  }
  else {
    // too many rooms (shouldn't ever happen), or room doesn't exist
    return {
      hash: props.match.params.hash
    };
  }
})(RoomUI);
