import { useState } from "react";
import { useChatSocket } from "../network/ChatSocket";

export default function Join() {
  const [pickedUserName, setPickedUserName] = useState("");
  const chatSocket = useChatSocket();

  const onClick = () => {
    chatSocket.join(pickedUserName);
  };
  const joinSuccessful = chatSocket.isReadyFor("room");
  return (
    <div className="border border-5 mb-3 p-2">
      <h2>Lobby</h2>
      {!joinSuccessful && (
        <>
          <label htmlFor="userName" className="m-1">
            Username
          </label>
          <input
            id="userName"
            className="m-1 w-75"
            value={pickedUserName}
            placeholder={"Enter username and 'Join'"}
            onChange={(e) => setPickedUserName(e.target.value)}
          ></input>
          <button
            type="button"
            className="btn btn-primary m-1"
            disabled={!pickedUserName}
            onClick={onClick}
          >
            Join
          </button>
        </>
      )}
      {joinSuccessful && (
        <div className="fs-4">Username: {chatSocket.userName}</div>
      )}
    </div>
  );
}
