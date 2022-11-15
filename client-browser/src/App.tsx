import { useEffect, useState } from "react";
import Join from "./sidebar/Join";
import Room from "./sidebar/Room";
import { ErrorPage } from "./error/ErrorPage";
import { ChatSocketProvider, useChatSocket } from "./network/ChatSocket";
import { ChatMessage, User } from "./network/ChatSocket.types";
import { DisplayMessages } from "./chat/DisplayMessages";
import { SendMessage } from "./chat/SendMessage";

export default function App() {
  const chatSocket = useChatSocket();
  const [users, setUsers] = useState<ReadonlyArray<User>>([]);
  const [errors, setErrors] = useState<ReadonlyArray<string>>([]);
  const [messages, setMessages] = useState<ReadonlyArray<ChatMessage>>([]);
  useEffect(() => {
    return chatSocket.subscribeToMessage((cs) => {
      setUsers(cs.users);
      setErrors(cs.lastErrors);
      setMessages(cs.messages);
    });
  });
  return (
    <ChatSocketProvider>
      <div className="container">
        <div className="row align-items-start">
          <div className="col-9 vh-100">
            <ErrorPage errors={errors} />
            <DisplayMessages messages={messages} />
            <SendMessage />
          </div>
          <div className="col-3">
            <h1 className={"mt-2"}>tiny-chat</h1>
            <Join />
            <Room users={users} />
          </div>
        </div>
      </div>
    </ChatSocketProvider>
  );
}
