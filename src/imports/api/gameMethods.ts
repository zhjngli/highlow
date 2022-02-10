import _ from 'lodash';
import { Meteor } from 'meteor/meteor';

import { Card, Game, GamesCollection, Phase, Player } from '../db/games';
import { RoomsCollection } from '../db/rooms';
import { User } from '../db/users';
import { findRoomAnd } from './roomMethods';

function shuffle<T>(arr: Array<T>): Array<T> {
  let i = arr.length;
  let j;

  while (i != 0) {
    j = Math.floor(Math.random() * i);
    i--;
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr;
}

function createDeck(): Array<Card> {
  const suit = [
    Card.TWO,
    Card.THREE,
    Card.FOUR,
    Card.FIVE,
    Card.SIX,
    Card.SEVEN,
    Card.EIGHT,
    Card.NINE,
    Card.TEN,
    Card.JACK,
    Card.QUEEN,
    Card.KING,
    Card.ACE
  ];
  const deck = [];
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < suit.length; j++) {
      deck.push(suit[j]);
    }
  }
  return shuffle(deck);
}

export function findGameAnd(gameId: string, f: (game: Game) => unknown) {
  const games = GamesCollection.find({ _id: gameId }).fetch();
  if (games.length == 1) {
    const game = <Game>games[0];
    return f(game);
  } else if (games.length == 0) {
    throw new Meteor.Error(`could not find game with id: ${gameId}`);
  } else {
    throw new Meteor.Error(`found more than one game with id: ${gameId}`);
  }
}

Meteor.methods({
  'games.create'(roomHash: string, users: Array<User>) {
    if (!users || users.length == 0) {
      throw new Meteor.Error('there must be at least one user to start a game');
    }
    if (users.length > 52) {
      throw new Meteor.Error('too many users');
    }

    return findRoomAnd(roomHash, (roomId) => {
      const deck = createDeck();
      const cards: Array<Card> = [];
      for (let i = 0; i < users.length; i++) {
        cards.push(<Card>deck.pop());
      }
      const ranks: Array<Card> = [...new Set(cards)];
      ranks.sort();
      ranks.reverse();
      console.log('ranks: ' + ranks);
      console.log('cards: ' + cards);

      let players: Array<Player> = users.map((user, i) => ({
        user: user,
        rank: ranks.indexOf(cards[i]) + 1,
        card: cards[i]
      }));
      players = shuffle(players);

      const gameId: string = GamesCollection.insert({
        createdAt: new Date(),
        roomHash: roomHash,
        perspectives: [],
        players: players,
        phase: Phase.CountRanks,
        turn: 0
      });

      RoomsCollection.update(
        { _id: roomId },
        {
          $set: {
            gameId: gameId
          }
        }
      );

      return gameId;
    });
  },
  'games.quit'(roomHash: string, gameId: string) {
    GamesCollection.remove({ _id: gameId });

    findRoomAnd(roomHash, (roomId) => {
      RoomsCollection.update(
        { _id: roomId },
        {
          $unset: {
            gameId: gameId
          }
        }
      );
    });
  },
  'games.sharePerspective'(gameId: string, userId: string, ds: number, ts: number, qs: number) {
    findGameAnd(gameId, (game) => {
      // did player already share?
      game.perspectives.forEach(({ player }) => {
        if (player.user._id == userId) {
          throw new Meteor.Error('You already shared a perspective');
        }
      });
      // did player share correct perspective?
      const otherCards: Array<Card> = game.players.filter(({ user }) => user._id != userId).map(({ card }) => card);
      const multiples: _.NumericDictionary<number> = _.countBy(Object.values(_.countBy(otherCards)));
      const actualDs = multiples[2] ? multiples[2] : 0;
      const actualTs = multiples[3] ? multiples[3] : 0;
      const actualQs = multiples[4] ? multiples[4] : 0;
      if (actualQs != qs || actualTs != ts || actualDs != ds) {
        throw new Meteor.Error('You should see a different number of doubles, triples, or quadruples');
      }
      // does player's perspective add new information?
      const perspectiveValues = game.perspectives.map(
        ({ doubles, triples, quadruples }) => 2 * doubles + 3 * triples + 4 * quadruples
      );
      perspectiveValues.forEach((v) => {
        if (2 * ds + 3 * ts + 4 * qs <= v) {
          throw new Meteor.Error("Your perspective doesn't add new information");
        }
      });
      // add perspective
      const player = game.players.filter(({ user }) => user._id == userId)[0];
      GamesCollection.update(
        { _id: gameId },
        {
          $push: {
            perspectives: {
              player,
              doubles: ds,
              triples: ts,
              quadruples: qs
            }
          }
        }
      );
    });
  },
  'games.finishShare'(gameId: string) {
    GamesCollection.update({ _id: gameId }, { $set: { phase: Phase.Round1 } });
  },
  'games.guess1'(gameId: string, userId: string, rank: number) {
    findGameAnd(gameId, (game) => {
      const player = game.players[game.turn];
      if (player.user._id != userId) {
        throw new Meteor.Error('Out of turn to guess!');
      }
      let nextTurn = game.turn + 1;
      let nextPhase = false;
      if (nextTurn >= game.players.length) {
        nextTurn = 0;
        nextPhase = true;
      }
      GamesCollection.update(
        { _id: gameId },
        {
          $set: {
            ['players.' + game.turn + '.guess1']: { rank },
            phase: nextPhase ? Phase.Round2 : Phase.Round1,
            turn: nextTurn
          }
        }
      );
    });
  },
  'games.guess2'(gameId: string, userId: string, rank: number, card: Card) {
    findGameAnd(gameId, (game) => {
      const player = game.players[game.turn];
      if (player.user._id != userId) {
        throw new Meteor.Error('Out of turn to guess!');
      }
      let nextTurn = game.turn + 1;
      let nextPhase = false;
      if (nextTurn >= game.players.length) {
        nextTurn = 0;
        nextPhase = true;
      }
      GamesCollection.update(
        { _id: gameId },
        {
          $set: {
            ['players.' + game.turn + '.guess2']: { rank, card },
            phase: nextPhase ? Phase.Revealable : Phase.Round2,
            turn: nextTurn
          }
        }
      );
    });
  },
  'games.reveal'(gameId: string) {
    GamesCollection.update({ _id: gameId }, { $set: { phase: Phase.Revealed } });
  }
});
