import { ChatMessage } from "../network/ChatSocket.types";

export function DisplayMessages(props: {
  messages: ReadonlyArray<ChatMessage>;
}) {
  return (
    <div className="container h-75 overflow-scroll">
      {[...props.messages, { userName: "User", message: "Message", id: 0 }]
        .reverse()
        .map((message) => (
          <div key={message.id} className="">
            <div className="row align-items-start">
              <div className="col-2 overflow-hidden border border- border-1">
                {message.userName}
              </div>
              <div className="col-10 border border-bottom border-1">
                {message.message}
              </div>
            </div>
          </div>
        ))}
    </div>
  );
}
