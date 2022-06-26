import { randomUUID } from "node:crypto";
import { User, UserId } from "./user.types";

const lobby: Map<UserId, User> = new Map();

export function addUserToLobby(userName: string, publicKey: string): User | string {
  for (const user of lobby.values()) {
    if (user.publicKey === publicKey) {
      return "User already in channel";
    }
  }
  const userId = randomUUID();
  const user = { userId, userName, publicKey };
  lobby.set(userId, user);
  return user;
}

export function removeFromLobby(userId: string) {
  lobby.delete(userId);
}

export function getUsersFromLobby(): string[] {
  const names = [];
  for (const user of lobby.values()) {
    names.push(user.userName);
  }
  return names;
}

export function findUser(userId: string): User | undefined {
  return lobby.get(userId);
}
