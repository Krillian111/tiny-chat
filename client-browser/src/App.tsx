import { useContext, useEffect, useState } from "react";
import Join from "./controls/Join";
import Room from "./controls/Room";
import { ErrorPage } from "./error/ErrorPage";
import { ChatSocketContext, ChatSocketProvider } from "./network/ChatSocket";
import { User } from "./network/ChatSocket.types";

export default function App() {
  const chatSocket = useContext(ChatSocketContext);
  const [userName, setUserName] = useState("");
  const [users, setUsers] = useState<ReadonlyArray<User>>([]);
  const [errors, setErrors] = useState<ReadonlyArray<string>>([]);
  useEffect(() => {
    const cleanUp = chatSocket.subscribeToMessage((cs) => {
      setUserName(cs.userName);
      setUsers(cs.users);
      setErrors(cs.lastErrors);
    });
    return cleanUp;
  });
  return (
    <ChatSocketProvider>
      <div className="container">
        <div className="row align-items-start">
          <div className="col-9">
            <h1>tiny-chat</h1>
            <ErrorPage errors={errors} />
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
