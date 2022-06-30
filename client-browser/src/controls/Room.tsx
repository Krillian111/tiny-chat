import { useContext } from "react";
import { ChatSocketContext } from "../network/ChatSocket";
import { User } from "../network/ChatSocket.types";

export default function Room(props: { users: ReadonlyArray<User> }) {
  const chatSocket = useContext(ChatSocketContext);

  const onClick = () => chatSocket.room();
  return (
    <div className="border border-5">
      <button type="button" className="btn btn-primary m-1" onClick={onClick}>
        Get list of users
      </button>
      <div>Users ({props.users.length})</div>
      <div>
        {props.users.map((user) => (
          <div key={user}>{user}</div>
        ))}
      </div>
    </div>
  );
}
