import { useState } from "react";
import { useChatSocket } from "../network/ChatSocket";

export default function Join(props: { userName: string }) {
  const [pickedUserName, setPickedUserName] = useState("");
  const chatSocket = useChatSocket();

  const onClick = () => {
    chatSocket.join(pickedUserName);
  };
  const joinSuccessful = chatSocket.isReadyFor("room");
  return (
    <div className="border border-5">
      {!joinSuccessful && (
        <>
          <label htmlFor="userName" className="m-1">
            Username
          </label>
          <input
            id="userName"
            className="m-1 w-75"
            value={pickedUserName}
            onChange={(e) => setPickedUserName(e.target.value)}
          ></input>
          <button
            type="button"
            className="btn btn-primary m-1"
            disabled={!pickedUserName}
            onClick={onClick}
          >
            Join lobby
          </button>
        </>
      )}
      {joinSuccessful && (
        <div className="fs-4">Username: {chatSocket.userName}</div>
      )}
    </div>
  );
}
