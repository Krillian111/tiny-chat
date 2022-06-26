import { ChatMessage } from "./message.types";

const bufferSize = 100;
let idCounter = 0;
const lobbyMessages: ChatMessage[] = [];

export function addMessageToLobby(message: string, userName: string): string {
  const id = idCounter++;
  const idAsString = id.toString();
  lobbyMessages.push({ message, id: idAsString, userName });
  if (lobbyMessages.length > bufferSize) {
    lobbyMessages.splice(0, lobbyMessages.length - bufferSize);
  }
  return idAsString;
}

export function getMessagesFromLobby(lastMessageId?: string) {
  let lastMessageIndex = 0;
  if (lastMessageId) {
    lastMessageIndex = lobbyMessages.findIndex((msg) => msg.id === lastMessageId) + 1;
  }
  return lobbyMessages.slice(lastMessageIndex);
}
