import { useChatSocket } from "../network/ChatSocket";
import { User } from "../network/ChatSocket.types";

export default function Room(props: { users: ReadonlyArray<User> }) {
  const chatSocket = useChatSocket();

  const onClick = () => chatSocket.room();
  return (
    <div className="border border-5">
      <button
        type="button"
        className="btn btn-primary m-1"
        onClick={onClick}
        disabled={!chatSocket.isReadyFor("room")}
      >
        Manually refresh
      </button>
      <div className="fs-4">Users ({props.users.length})</div>
      <ul className="fs-5">
        {props.users.map((user) => (
          <li key={user}>{user}</li>
        ))}
      </ul>
    </div>
  );
}
