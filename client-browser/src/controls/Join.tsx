import { useContext, useEffect, useState } from "react";
import { ChatSocketContext } from "../network/ChatSocket";

export default function Join() {
  const [pickedUserName, setPickedUserName] = useState("");
  const chatSocket = useContext(ChatSocketContext);
  const [, triggerRerender] = useState(0);
  useEffect(() => {
    const cleanUp = chatSocket.subscribeToMessage(() => {
      triggerRerender((val) => val + 1);
    });
    return cleanUp;
  });

  const onClick = () => chatSocket.join(pickedUserName);
  const joinSuccessful = !!chatSocket.userName;
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
      {joinSuccessful && <div>Username: {chatSocket.userName}</div>}

      {!joinSuccessful && chatSocket.lastErrors && (
        <>
          {chatSocket.lastErrors.map((error) => (
            <span>{error}</span>
          ))}
        </>
      )}
    </div>
  );
}
