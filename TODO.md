# TODOs

## General

- dockerize

## Backend

### Possible Cleanup / Improvements

- integrate public key validation into fastify's validation framework
- (de)serialize websocket messages with fastify's serialization library instead of `JSON.parse`

### Next

- prevent impersonation by someone rejoining with username of someone who just left (some timeout before username can be reused?)
- add Dockerfile + Kubernetes setup
- broadcast users joining/exiting and new messages to all

## Frontend

- Write tests
  - is there a nock equivalent for websockets or do I just implement a mock version of the server websocket?
  - write e2e test by starting both frontend+backend and use something like puppeteer?
- Add reconnection support && deal with multiple joins
- Deal with "timeouts", i.e. when no corresponding message is observed
- Execute crypto operations in webworker thread (to get familiar with API and practice offloading computation extensive tasks)
