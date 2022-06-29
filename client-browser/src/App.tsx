import React from "react";
import Join from "./controls/Join";
import { ChatSocketProvider } from "./network/ChatSocket";

export default function App() {
  return (
    <ChatSocketProvider>
      <div className="container">
        <div className="row align-items-start">
          <div className="col-9">First column</div>
          <div className="col-3">
            <Join />
          </div>
        </div>
      </div>
    </ChatSocketProvider>
  );
}
