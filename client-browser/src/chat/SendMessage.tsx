import { useState } from "react";
import { useChatSocket } from "../network/ChatSocket";

export function SendMessage() {
  const chatSocket = useChatSocket();
  const [message, setMessage] = useState("");
  const onClick = () => {
    chatSocket.send(message);
    setMessage("");
  };
  return (
    <div className="container">
      <input
        id="message"
        className="m-1 w-75"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      ></input>
      <button
        type="button"
        className="btn btn-primary m-1"
        disabled={!message || !chatSocket.isReadyFor("send")}
        onClick={onClick}
      >
        Send
      </button>
    </div>
  );
}
