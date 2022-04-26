import RoomsList from "./RoomsList";
import React, { useState, useEffect, useRef } from "react";
import {
  ListItem,
  ListItemIcon,
  IconButton,
  Container,
  Grid,
  Box,
  AppBar,
  Toolbar,
  Typography,
  TextField,
  Button,
  Divider,
  List,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";

import io from "socket.io-client";
import MessageBubble from "./MessageBubble";
const socket = io.connect(window.location.href); //moved from connect direct
const axios = require("axios");

const style = {
  position: "absolute",
  bottom: "0",
  width: "inherit",
};



function NavBar(props) {
  console.log("How many time is this loagind")
  const [roomId, setRoomId] = useState("");
  const [focusedRoomId, setFocusedRoomId] = useState("");
  const textInputMessageBox = useRef(null);
  const [message, setMessage] = useState("");
  const [MessageListHistory, setMessageListHistory] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [NavSubscribedRooms, setNavSubscribedRooms] = useState(
    props.subscribedRooms
  );

  let username = props.username;



  const focusedRoomIdCallBack = (roomId) => {
    setFocusedRoomId(roomId);
    
  };

  useEffect(() => {
    console.log("useeffect focusroomID")
    joinRoomOther();
    getChatRoomHistory()
    getOnlineUsers()
  }, [focusedRoomId]);


  socket.emit("joinedUser", { username });

  function isValidJoinRoomString(room){
    if (room.trim().length !== 0) {
      return true
    } else{
      return false
    }
  }

  async function getChatRoomHistory() {
    if (isValidJoinRoomString(focusedRoomId)){
      console.log(focusedRoomId)
      let userPayload = { focusedRoomId };
      await axios
        .post(
          "http://localhost:80/api/getChatHistory/",
          JSON.stringify(userPayload),
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        )
        .then(function (response) {
          let data = response.data
          setMessageListHistory(data)
        })
        .catch(function (err) {});
    }
   
  }

  async function getOnlineUsers() {
    await axios
      .get("http://localhost:80/api/getOnlineUsers/")
      .then(function (response) {
        let data = response.data
        setOnlineUsers(data.onlineUsers)
      })
      .catch(function (err) {});
  }

  useEffect(() => {
    console.log("useeffect socket recieve")
    socket.on("receive_message", (data) => {
      console.log("recieved data", data);
      setMessageListHistory((MessageListHistory) => [
        ...MessageListHistory,
        JSON.stringify(data),
      ]);
    });

    console.log("useeffect onlinechange")
     socket.on("userOnlineChanged", (data) => {
      setOnlineUsers(data.onlineUsers)

     });

  }, [socket]);

  function sendMessage() {
    
    let username = props.username;
    let payload = { username, focusedRoomId, message };
    

    socket.emit("sendMessage", payload);
  }

  function joinRoomOther() {
    if (isValidJoinRoomString(focusedRoomId)){
      console.log("joinroom other")
      let username = props.username;
      let payload = { username, "roomId": focusedRoomId };
      socket.emit("joinRoom", payload);

    }
    
   
  }
  function joinRoom() {
    if (isValidJoinRoomString(roomId) && NavSubscribedRooms.indexOf(roomId) < 0) {
      setNavSubscribedRooms((NavSubscribedRooms) => [
        ...NavSubscribedRooms,
        roomId,
      ]);
      setFocusedRoomId(roomId);
    }
  }

  function clearMessageBox() {
    textInputMessageBox.current.value = "";
  }

  function createRoomLists(subscribedRooms) {
    return subscribedRooms.map(function (room) {
      return (
        <div>
          <RoomsList
            roomName={room}
            focusedRoomIdCallBack={focusedRoomIdCallBack}
          ></RoomsList>
        </div>
      );
    });
  }

  function createMessageList(messagesList, onlineUsers) {
    return (messagesList.map(function (message) {
      return (
        <div>
          <MessageBubble messageContent={JSON.parse(message).messageContent} timeStamp ={JSON.parse(message).timeSent} userName={JSON.parse(message).fromUser} onlineUsers={onlineUsers}></MessageBubble>
        </div>
      );
    }));
  }

  return (
    <div>
      <Grid container spacing={0}>
        <Grid sx={{ minWidth: "334px" }}>
          <AppBar sx={{ height: "50px" }} position="static">
            <Container>
              <Toolbar>
                <Typography variant="h6">Chat</Typography>
              </Toolbar>
            </Container>
          </AppBar>
          <TextField
            onChange={(event) => {
              setRoomId(event.target.value);
            }}
            sx={{ mb: "22px", mt: "8px" }}
            fullWidth
            required
            size="small"
            id="username"
            margin="normal"
          />
          <Button
            onClick={joinRoom}
            sx={{ height: "43px", mt: "30px", mb: "14px", mt: "15px" }}
            color="secondary"
            type="submit"
            variant="contained"
            fullWidth
          >
            Join Room
          </Button>
          <Divider />
          <List
            sx={{
              width: "100%",
              height: "calc(100vh - 250px)",
              overflow: "auto",
            }}
          >
            {createRoomLists(NavSubscribedRooms)}
          </List>
        </Grid>
        <Grid xs>
          <AppBar sx={{ height: "50px" }} position="static">
            <Container>
              <Toolbar>
                <Typography variant="h6">{focusedRoomId}</Typography>
              </Toolbar>
            </Container>
          </AppBar>

          <Box sx={{ border: "1px dashed grey" }}>
            <List
              sx={{
                height: "calc(100vh - 160px)",
                width: "100%",
                overflow: "auto",
              }}
            >
              {createMessageList(MessageListHistory, onlineUsers)}

            </List>
          </Box>

          <Grid container direction="row">
            <Grid xs={10}>
              <TextField
                multiline
                maxRows={2}
                inputRef={textInputMessageBox}
                onChange={(event) => {
                  setMessage(event.target.value);
                }}
                id="outlined-basic"
                size="small"
                variant="outlined"
                fullWidth
              />
            </Grid>
            <Grid xs={2}>
              <IconButton
                onClick={() => {
                  sendMessage();
                  clearMessageBox();
                }}
                size="large"
              >
                <SendIcon />
              </IconButton>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
}

export default NavBar;