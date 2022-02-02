import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import GameUI from '../game';
import { getUserId } from '/src/imports/api/session';

import { User, UsersCollection } from '/src/imports/db/users';
import { Room, RoomsCollection } from '/src/imports/db/rooms';

type RoomRouteProps = RouteComponentProps<{ hash: string }>;

type RoomProps = {
  hash: string;
  room: Room;
  users?: Array<User>;
};

type RoomUIProps = RoomProps & RoomRouteProps;

class RoomUI extends React.Component<RoomUIProps> {
  constructor(props: RoomUIProps) {
    super(props);

    this.leaveRoom = this.leaveRoom.bind(this);
    this.startGame = this.startGame.bind(this);
  }

  leaveRoom(e: React.MouseEvent): void {
    e.preventDefault();
    Meteor.call('rooms.leave', this.props.room.hash, getUserId(), (err: Meteor.Error, _: string) => {
      if (err) {
        alert(err);
      } else {
        this.props.history.push(`/`);
      }
    });
  }

  startGame(e: React.MouseEvent): void {
    e.preventDefault();
    Meteor.call('games.create', this.props.room.hash, this.props.users, (err: Meteor.Error, _: string) => {
      if (err) {
        alert(err);
      }
    });
  }

  renderLobby(): React.ReactElement {
    if (this.props.room && this.props.users) {
      return (
        <div>
          <ul>
            {this.props.users.map((user) => (
              <li key={user._id}>{user.username} is in the room.</li>
            ))}
          </ul>
          <button onClick={this.leaveRoom}>leave room</button>
          <button onClick={this.startGame}>start game</button>
        </div>
      );
    }
    return (
      <div>
        <p>couldn&apos;t find room: {this.props.hash}!</p>
      </div>
    );
  }

  render(): React.ReactElement {
    if (this.props.room?.gameId) {
      return <GameUI roomHash={this.props.hash} gameId={this.props.room.gameId} />;
    }
    return this.renderLobby();
  }
}

export default withTracker(function (props: RoomRouteProps) {
  const roomHash = props.match.params.hash;
  Meteor.subscribe('rooms', roomHash);
  Meteor.subscribe('users', roomHash);

  const rooms = RoomsCollection.find({ hash: roomHash }).fetch();
  const users = UsersCollection.find({ roomHash: roomHash }).fetch();

  if (rooms.length == 1) {
    return {
      hash: roomHash,
      room: rooms[0],
      users: users
    };
  } else {
    // too many rooms (shouldn't ever happen), or room doesn't exist
    return {
      hash: roomHash,
      room: { hash: roomHash, createdAt: new Date(), userIds: [''] }
    };
  }
})(RoomUI);
