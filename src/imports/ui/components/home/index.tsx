import $ from 'jquery';
import { Meteor } from 'meteor/meteor';
import React, { SyntheticEvent } from 'react';
import { RouteComponentProps } from 'react-router-dom';

import { getPlayerId } from '/src/imports/api/session';

type HomeProps = RouteComponentProps;

type HomeState = {
  howToPlay: boolean;
};

const JOIN_ROOM_FORM = 'joinRoomForm';
const CREATE_ROOM_FORM = 'createRoomForm';

class Home extends React.Component<HomeProps, HomeState> {
  constructor(props: RouteComponentProps) {
    super(props);

    this.state = {
      howToPlay: false
    };

    this.toggleHowToPlay = this.toggleHowToPlay.bind(this);
    this.createRoom = this.createRoom.bind(this);
    this.joinRoom = this.joinRoom.bind(this);
  }

  toggleHowToPlay(): void {
    this.setState((_prevState: HomeState) => ({
      howToPlay: !_prevState.howToPlay
    }));
  }

  createRoom(e: SyntheticEvent): void {
    e.preventDefault();

    const username = $(`form.${CREATE_ROOM_FORM}`).serializeArray()[0]['value'].trim();
    if (!username) {
      alert('need a username!');
      return;
    }

    Meteor.call('rooms.create', getPlayerId(), username, (err: Meteor.Error, res: string) => {
      if (err) {
        alert(err);
      } else {
        this.props.history.push(`/r/${res}`);
      }
    });
  }

  joinRoom(e: SyntheticEvent): void {
    e.preventDefault();
    const formData = $(`form.${JOIN_ROOM_FORM}`).serializeArray();

    const username = formData[0]['value'].trim();
    if (!username) {
      alert('need a username!');
      return;
    }

    const roomHash = formData[1]['value'].trim();
    if (!roomHash) {
      alert('need a room id!');
      return;
    }

    Meteor.call('rooms.join', roomHash, getPlayerId(), username, (err: Meteor.Error, res: string) => {
      if (err) {
        alert(err);
      } else {
        this.props.history.push(`/r/${res}`);
      }
    });
  }

  renderHowToPlay(): React.ReactElement {
    return (
      <div>
        <p>instructions coming soon!</p>
      </div>
    );
  }

  render(): React.ReactElement {
    return (
      <div>
        welcome to high low!
        <p>
          <button onClick={this.toggleHowToPlay}>how to play?</button>
          {this.state.howToPlay && this.renderHowToPlay()}
        </p>
        <p>Create a room!</p>
        <form className={CREATE_ROOM_FORM} onSubmit={this.createRoom}>
          <input type="text" placeholder="choose a username" name="username" />

          <button type="submit">Create room</button>
        </form>
        <hr />
        <p>or, join a room!</p>
        <form className={JOIN_ROOM_FORM} onSubmit={this.joinRoom}>
          <input type="text" placeholder="choose a username" name="username" />
          <input type="text" placeholder="room id" name="roomId" />

          <button type="submit">Join room</button>
        </form>
      </div>
    );
  }
}

export default Home;
