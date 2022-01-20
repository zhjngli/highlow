import { Meteor } from 'meteor/meteor';
import React, { SyntheticEvent } from 'react';
import { RouteComponentProps } from 'react-router-dom';

type HomeProps = RouteComponentProps;

type HomeState = {
  howToPlay: boolean;
  username: string;
};

class Home extends React.Component<HomeProps, HomeState> {
  constructor(props: RouteComponentProps) {
    super(props);

    this.state = {
      howToPlay: false,
      username: ''
    };

    this.toggleHowToPlay = this.toggleHowToPlay.bind(this);
    this.setUsername = this.setUsername.bind(this);
    this.createRoom = this.createRoom.bind(this);
  }

  toggleHowToPlay(): void {
    this.setState((_prevState: HomeState) => ({
      howToPlay: !_prevState.howToPlay
    }));
  }

  setUsername(u: string): void {
    this.setState((_prevState: HomeState) => ({
      howToPlay: _prevState.howToPlay,
      username: u
    }));
  }

  createRoom(e: SyntheticEvent): void {
    e.preventDefault();
    if (!this.state.username) {
      console.log('need a username!');
      return;
    }
    Meteor.call('rooms.create', this.state.username, (err: any, res: string) => {
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
        <form onSubmit={this.createRoom}>
          <input
            type="text"
            placeholder="choose a username"
            value={this.state.username}
            onChange={(e) => this.setUsername(e.target.value)}
          />

          <button type="submit">Create room</button>
        </form>
      </div>
    );
  }
}

export default Home;
