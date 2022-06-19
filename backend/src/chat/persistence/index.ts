import { addUserToLobby, findPublicKeyInLobby, getUsersFromLobby, removeFromLobby } from "./user/user.repository";

export const userRepo = {
  addToLobby: addUserToLobby,
  removeFromLobby: removeFromLobby,
  getAllFromLobby: getUsersFromLobby,
  findPublicKeyInLobby: findPublicKeyInLobby,
};
