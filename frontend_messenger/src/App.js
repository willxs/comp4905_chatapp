import React, { useState } from "react";
import NavBar from "./components/NavBar";
import UserLogin from "./components/UserLogin";

function App() {
  const [Username, setUserName] = useState("");
  const [SubscribedRooms, setSubscribedRooms] = useState([]);

  if (Username === "") {
    return (
      <UserLogin
        setUserName={setUserName}
        setSubscribedRooms={setSubscribedRooms}
      />
    );
  }

  return (
    <div>
      <NavBar username={Username} subscribedRooms={SubscribedRooms} />
    </div>
  );
}

export default App;
