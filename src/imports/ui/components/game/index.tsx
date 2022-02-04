import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import React from 'react';

import { getUserId } from '/src/imports/api/session';
import { GamesCollection, Player } from '/src/imports/db/games';

type GameProps = {
  roomHash: string;
  gameId: string;
};

type GameTrackerProps = {
  players: Array<Player>;
  self: Player;
};

type GameUIProps = GameProps & GameTrackerProps;

type GameState = {
  revealed: boolean;
};

class GameUI extends React.Component<GameUIProps, GameState> {
  constructor(props: GameUIProps) {
    super(props);

    this.state = { revealed: false };

    this.revealCard = this.revealCard.bind(this);
    this.toLobby = this.toLobby.bind(this);
  }

  revealCard(e: React.MouseEvent): void {
    e.preventDefault();
    this.setState((_prevState: GameState) => ({
      revealed: true
    }));
  }

  toLobby(e: React.MouseEvent): void {
    e.preventDefault();
    Meteor.call('games.quit', this.props.roomHash, this.props.gameId, (err: Meteor.Error, _: string) => {
      if (err) {
        alert(err);
      }
    });
  }

  render(): React.ReactElement {
    return (
      <div>
        <ul>
          {this.props.players.map(({ user, card, guess1, guess2 }) => {
            if (user._id == getUserId()) {
              const c = this.state.revealed ? card : '?';
              return (
                <li key={user._id}>
                  <p>You are holding {c}.</p>
                  {guess1 && <p>You guessed rank {guess1} in round 1.</p>}
                  {guess2 && <p>You guessed rank {guess2.rank} and card {guess2.card} in round 2.</p>}
                </li>
              );
            } else {
              return (
                <li key={user._id}>
                  <p>{user.username} is holding {card}.</p>
                  {guess1 && <p>{user.username} guessed rank {guess1} in round 1.</p>}
                  {guess2 && <p>{user.username} guessed rank {guess2.rank} and card {guess2.card} in round 2.</p>}
                </li>
              );
            }
          })}
        </ul>
        {!this.state.revealed && <button onClick={this.revealCard}>reveal card</button>}
        <button onClick={this.toLobby}>back to lobby</button>
      </div>
    );
  }
}

export default withTracker(function (props: GameProps) {
  const gameId = props.gameId;
  Meteor.subscribe('games', gameId);

  const games = GamesCollection.find({ _id: gameId }).fetch();

  if (games.length == 1) {
    return {
      players: games[0].players,
      self: games[0].players.filter(({ user }) => user._id == getUserId())[0]
    };
  } else {
    // too many games (shouldn't ever happen), or game doesn't exist
    return {
      players: [],
      self: { user: { username: '', createdAt: new Date() }, card: 0 }
    };
  }
})(GameUI);
