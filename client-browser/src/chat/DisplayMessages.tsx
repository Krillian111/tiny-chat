import { ChatMessage } from "../network/ChatSocket.types";

export function DisplayMessages(props: {
  messages: ReadonlyArray<ChatMessage>;
}) {
  return (
    <>
      <div className="container p-3">
        <Message userName={"User"} msg={"Message"} />
      </div>
      <div className="container h-75 overflow-scroll border border-5 p-3">
        {[...props.messages].reverse().map((message) => (
          <Message
            key={message.id}
            userName={message.userName}
            msg={message.message}
          />
        ))}
      </div>
    </>
  );
}

export function Message({ userName, msg }: { userName: string; msg: string }) {
  return (
    <div className="">
      <div className="row align-items-start">
        <div className="col-2 overflow-hidden mt-1 mb-1">{userName}</div>
        <div className="col-10 mt-1 mb-1">{msg}</div>
      </div>
    </div>
  );
}
