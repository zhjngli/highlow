import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import React from 'react';
import { getPlayerId } from '/src/imports/api/session';
import { GamesCollection, PlayerCard } from '/src/imports/db/games';

type GameProps = {
  roomHash: string;
  gameId: string;
}

type GameTrackerProps = {
  playerCards: Array<PlayerCard>;
  self: PlayerCard
};

type GameUIProps = GameProps & GameTrackerProps;

type GameState = {
  revealed: boolean;
}

class GameUI extends React.Component<GameUIProps, GameState> {
  constructor(props: GameUIProps) {
    super(props);

    this.state = { revealed: false };

    this.revealCard = this.revealCard.bind(this);
  }

  revealCard(e: React.MouseEvent): void {
    e.preventDefault();
    this.setState((_prevState: GameState) => ({
      revealed: true
    }));
  }

  render(): React.ReactElement {
    return (
      <div>
        <ul>
          {this.props.playerCards.map(({ player, card }) =>
          (
             <li key={player._id}>{player.username} is holding {card}.</li>)
          )}
          <hr />
          {this.state.revealed && <li key={this.props.self.player._id}>{this.props.self.player.username} is holding {this.props.self.card}.</li>}
        </ul>
        {!this.state.revealed && <button onClick={this.revealCard}>reveal card</button>}
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
      playerCards: games[0].cards.filter(({ player }) => (player._id != getPlayerId())),
      self: games[0].cards.filter(({ player }) => (player._id == getPlayerId()))[0]
    };
  } else {
    // too many games (shouldn't ever happen), or game doesn't exist
    return {
      playerCards: [],
      self: { player: { username: '', createdAt: new Date() }, card: 0 }
    };
  }
})(GameUI);
