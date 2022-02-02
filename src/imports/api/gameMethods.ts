import { Meteor } from 'meteor/meteor';

import { GamesCollection, PlayerCard } from '../db/games';
import { Player } from '../db/players';
import { RoomsCollection } from '../db/rooms';

function randomCard(): number {
  const cards = [2,3,4,5,6,7,8,9];
  return cards[Math.floor(Math.random() * cards.length)];
}

Meteor.methods({
  'games.create'(roomHash: string, players: Array<Player>) {
    if (!players || players.length == 0) {
      throw new Meteor.Error('there must be at least one player to start a game');
    }

    let playerCards: Array<PlayerCard> = players.map((p) => ({
      player: p,
      card: randomCard()
    }));
    
    const gameId: string = GamesCollection.insert({
      createdAt: new Date(),
      roomHash: roomHash,
      cards: playerCards
    });

    const rooms = RoomsCollection.find({ hash: roomHash }).fetch();
    if (rooms.length == 1) {
      const roomId = rooms[0]._id;

      RoomsCollection.update(
        { _id: roomId },
        {
          $set: {
            gameId: gameId
          }
        }
      );

      return gameId;
    } else if (rooms.length == 0) {
      throw new Meteor.Error(`could not find room with id: ${roomHash}`);
    } else {
      throw new Meteor.Error(`found more than one room with id: ${roomHash}`);
    }
  }
});
