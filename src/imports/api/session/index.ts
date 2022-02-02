import { Session } from 'meteor/session';

const USER_ID = 'USER_ID';

export function setUserId(id: string): void {
  Session.set(USER_ID, id);
  console.log(`user id: ${id}`);
}

export function getUserId(): string {
  return Session.get(USER_ID);
}
