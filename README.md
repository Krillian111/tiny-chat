# tiny-chat

Inspired by [tinyprojects.dev](https://tinyprojects.dev/) I wanted to build a very simplified browser room client. The goal is not to monetize anything but to double check that I am not missing any of the skills involved in doing so.

See [my blog](https://blog.krillian.dev/projects/tiny-chat) for lessons learned.

## Road map

### Done

- User can join lobby
  - Persistence
    - List of current users
    - enforce uniqueness of usernames
- User exits lobby on websocket disconnect
- Messages are guaranteed to be sent by the displayed users
  - sign messages with asymmetric keys and verify signatures in backend
    - send public key to backend when joining a room; backend can save this and verify signatures of each message to guarantee authenticity
    - sign messages with private key
    - reject unsigned or invalidly signed messages
- Users see room history
  - Limits
    - max 100 messages in room history
- All users see a consistent version of the room
  - Persistence
    - Messages needs to be ordered in some centralized data structure to avoid clients seeing different versions of the room

### Open

- Stability
  - Limit length of message, e.g. 1000 UTF-8 characters
  - Limit number of users
- Users can exit lobby
- See [technical TODOs](./TODO.md)

## MVP

- Only one global room => no need for logic to create rooms yet
- No horizontal scaling and no resilience to backend restarts => persistence can be restricted to in-memory
