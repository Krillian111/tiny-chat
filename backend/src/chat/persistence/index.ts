import { addMessageToLobby, getMessagesFromLobby } from "./message/message.repository";
import { addUserToLobby, findUser, getUsersFromLobby, removeFromLobby } from "./user/user.repository";

export const userRepo = {
  addToLobby: addUserToLobby,
  removeFromLobby: removeFromLobby,
  getAllFromLobby: getUsersFromLobby,
  findUser: findUser,
};

export const messageRepo = {
  addMessageToLobby: addMessageToLobby,
  getMessagesFromLobby: getMessagesFromLobby,
};
