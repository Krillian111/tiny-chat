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
  const [userName, setUserName] = useState("");
  const [users, setUsers] = useState<ReadonlyArray<User>>([]);
  const [errors, setErrors] = useState<ReadonlyArray<string>>([]);
  const [messages, setMessages] = useState<ReadonlyArray<ChatMessage>>([]);
  useEffect(() => {
    return chatSocket.subscribeToMessage((cs) => {
      setUserName(cs.userName);
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
            <h1>tiny-chat</h1>
            <SendMessage />
            <ErrorPage errors={errors} />
            <DisplayMessages messages={messages} />
          </div>
          <div className="col-3">
            <Join userName={userName} />
            <Room users={users} />
          </div>
        </div>
      </div>
    </ChatSocketProvider>
  );
}
