import { Meteor } from 'meteor/meteor';
import React from 'react';
import { RouteComponentProps } from 'react-router-dom';

import { getUserId } from '/src/imports/api/session';

type HomeProps = RouteComponentProps;

type HomeState = {
  howToPlay: boolean;
};

interface CreateRoomFormElements extends HTMLFormControlsCollection {
  username: HTMLInputElement
}

interface CreateRoomForm extends HTMLFormElement {
 readonly elements: CreateRoomFormElements
}

interface JoinRoomFormElements extends HTMLFormControlsCollection {
  username: HTMLInputElement;
  roomId: HTMLInputElement;
}

interface JoinRoomForm extends HTMLFormElement {
 readonly elements: JoinRoomFormElements
}

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

  createRoom(e: React.FormEvent<CreateRoomForm>): void {
    e.preventDefault();

    const username = e.currentTarget.elements.username.value.trim();
    if (!username) {
      alert('need a username!');
      return;
    }

    Meteor.call('rooms.create', getUserId(), username, (err: Meteor.Error, res: string) => {
      if (err) {
        alert(err);
      } else {
        this.props.history.push(`/r/${res}`);
      }
    });
  }

  joinRoom(e: React.FormEvent<JoinRoomForm>): void {
    e.preventDefault();

    const username = e.currentTarget.elements.username.value.trim();
    if (!username) {
      alert('need a username!');
      return;
    }

    const roomHash = e.currentTarget.elements.roomId.value.trim();
    if (!roomHash) {
      alert('need a room id!');
      return;
    }

    Meteor.call('rooms.join', roomHash, getUserId(), username, (err: Meteor.Error, res: string) => {
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
        <form onSubmit={this.createRoom}>
          <div>
            <label htmlFor="username"></label>
            <input id="username" type="text" placeholder="choose a username" name="username" />
          </div>

          <button type="submit">Create room</button>
        </form>
        <hr />
        <p>or, join a room!</p>
        <form onSubmit={this.joinRoom}>
          <div>
            <label htmlFor="username"></label>
            <input id="username" type="text" placeholder="choose a username" name="username" />
          </div>
          <div>
            <label htmlFor="roomId"></label>
            <input id="roomId" type="text" placeholder="room id" name="roomId" />
          </div>

          <button type="submit">Join room</button>
        </form>
      </div>
    );
  }
}

export default Home;
