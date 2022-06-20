const lobbyMessages: string[] = [];

export function sendMessageToLobby(message: string) {
  lobbyMessages.push(message);
}
