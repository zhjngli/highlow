import { Session } from 'meteor/session';

const PLAYER_ID: string = 'PLAYER_ID';

export function setPlayerId(id: string): void {
  Session.set(PLAYER_ID, id);
}

export function getPlayerId(): string {
  return Session.get(PLAYER_ID);
}
