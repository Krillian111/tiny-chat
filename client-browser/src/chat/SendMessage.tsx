import { useRef, useState } from "react";
import { useChatSocket } from "../network/ChatSocket";

export function SendMessage() {
  const chatSocket = useChatSocket();
  const [message, setMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const onSubmitClick = () => {
    chatSocket.send(message);
    setMessage("");
    inputRef.current?.focus();
  };
  return (
    <div className="container mt-3">
      <input
        id="message"
        className="m-1 w-75"
        placeholder={"Once joined, type your message..."}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyUp={(event) => {
          if (event.key === "Enter") {
            onSubmitClick();
          }
        }}
        ref={inputRef}
      ></input>
      <button
        type="button"
        className="btn btn-primary m-1"
        disabled={!message || !chatSocket.isReadyFor("send")}
        onClick={onSubmitClick}
      >
        Send
      </button>
    </div>
  );
}
