import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import React from 'react';

import { getUserId } from '/src/imports/api/session';
import { GamesCollection, Perspective, Phase, Player } from '/src/imports/db/games';

type GameProps = {
  roomHash: string;
  gameId: string;
};

type GameTrackerProps = {
  players: Array<Player>;
  self: Player;
  perspectives: Array<Perspective>;
  phase: Phase;
  turn: number;
};

type GameUIProps = GameProps & GameTrackerProps;

type GameState = {
  revealed: boolean;
};

interface SharePerspectiveFormElements extends HTMLFormControlsCollection {
  double: HTMLInputElement;
  triple: HTMLInputElement;
  quadruple: HTMLInputElement;
}

interface SharePerspectiveForm extends HTMLFormElement {
  readonly elements: SharePerspectiveFormElements;
}

class GameUI extends React.Component<GameUIProps, GameState> {
  constructor(props: GameUIProps) {
    super(props);

    this.state = { revealed: false };

    this.revealCard = this.revealCard.bind(this);
    this.toLobby = this.toLobby.bind(this);
    this.sharePerspective = this.sharePerspective.bind(this);
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

  sharePerspective(e: React.FormEvent<SharePerspectiveForm>) {
    e.preventDefault();

    const doubleInp = e.currentTarget.elements.double.value.trim();
    const tripleInp = e.currentTarget.elements.triple.value.trim();
    const quadrupleInp = e.currentTarget.elements.quadruple.value.trim();
    const double = doubleInp == '' ? 0 : parseInt(doubleInp);
    const triple = tripleInp == '' ? 0 : parseInt(tripleInp);
    const quadruple = quadrupleInp == '' ? 0 : parseInt(quadrupleInp);

    if (isNaN(double) || isNaN(triple) || isNaN(quadruple)) {
      alert('input must be numbers only!');
      return;
    }

    Meteor.call(
      'games.sharePerspective',
      this.props.gameId,
      getUserId(),
      double,
      triple,
      quadruple,
      (err: Meteor.Error, _: string) => {
        if (err) {
          alert(err);
        }
      }
    );
  }

  renderHeadline(): React.ReactElement {
    let headline;
    if (this.props.phase == Phase.CountRanks) {
      headline = 'Share perspectives!';
    } else if (this.props.phase == Phase.Round1) {
      headline = 'Round 1 guessing (Rank only)';
    } else if (this.props.phase == Phase.Round2) {
      headline = 'Round 2 guessing (Rank and Card)';
    } else if (this.props.phase == Phase.Reveal) {
      headline = 'Revealed all cards and rank';
    } else {
      throw new Error(`unrecognized phase ${this.props.phase}`);
    }
    return <h3>{headline}</h3>;
  }

  renderForm(): React.ReactElement {
    if (this.props.phase == Phase.CountRanks) {
      return (
        <div>
          <ul>
            {this.props.perspectives.map(({ player, doubles, triples, quadruples }) => {
              let nameSees;
              if (player.user._id == getUserId()) {
                nameSees = 'You see';
              } else {
                nameSees = `${player.user.username} sees`;
              }
              const multiples = `${doubles} doubles, ${triples} triples, ${quadruples} quadruples`;
              return (
                <li key={player.user._id}>
                  {nameSees} {multiples}
                </li>
              );
            })}
          </ul>
          <hr />
          <form onSubmit={this.sharePerspective}>
            <div>
              <label htmlFor="double"></label>
              <input id="double" type="number" placeholder="how many doubles do you see?" name="double" />
            </div>
            <div>
              <label htmlFor="triple"></label>
              <input id="triple" type="number" placeholder="how many triples do you see?" name="triple" />
            </div>
            <div>
              <label htmlFor="quadruple"></label>
              <input id="quadruple" type="number" placeholder="how many quadruples do you see?" name="quadruples" />
            </div>
            <button type="submit">share</button>
          </form>
        </div>
      );
    } else if (this.props.phase == Phase.Round1) {
      return <></>;
    } else if (this.props.phase == Phase.Round2) {
      return <></>;
    } else if (this.props.phase == Phase.Reveal) {
      return <></>;
    } else {
      throw new Error(`unrecognized phase ${this.props.phase}`);
    }
  }

  render(): React.ReactElement {
    return (
      <div>
        <div>
          {this.renderHeadline()}
          {this.renderForm()}
        </div>
        <ul>
          {this.props.players.map(({ user, card, guess1, guess2 }) => {
            if (user._id == getUserId()) {
              const c = this.props.phase == Phase.Reveal ? card : '?';
              return (
                <li key={user._id}>
                  <p>You are holding {c}.</p>
                  {guess1 && <p>You guessed rank {guess1} in round 1.</p>}
                  {guess2 && (
                    <p>
                      You guessed rank {guess2.rank} and card {guess2.card} in round 2.
                    </p>
                  )}
                </li>
              );
            } else {
              return (
                <li key={user._id}>
                  <p>
                    {user.username} is holding {card}.
                  </p>
                  {guess1 && (
                    <p>
                      {user.username} guessed rank {guess1} in round 1.
                    </p>
                  )}
                  {guess2 && (
                    <p>
                      {user.username} guessed rank {guess2.rank} and card {guess2.card} in round 2.
                    </p>
                  )}
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
      self: games[0].players.filter(({ user }) => user._id == getUserId())[0],
      perspectives: games[0].perspectives,
      phase: games[0].phase,
      turn: games[0].turn
    };
  } else {
    // too many games (shouldn't ever happen), or game doesn't exist
    return {
      players: [],
      self: { user: { username: '', createdAt: new Date() }, card: 0 },
      perspectives: [],
      phase: Phase.CountRanks,
      turn: 0
    };
  }
})(GameUI);
