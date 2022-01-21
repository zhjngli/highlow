import { Session } from 'meteor/session';

const PLAYER_ID = 'PLAYER_ID';

export function setPlayerId(id: string): void {
  Session.set(PLAYER_ID, id);
  console.log(`player id: ${id}`);
}

export function getPlayerId(): string {
  return Session.get(PLAYER_ID);
}
