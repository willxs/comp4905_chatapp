// Cite:“Introduction,” SocketIO RSS, 01-Apr-2022. [Online]. Available: https://socket.io/docs/v4/.
//Cite:Redis, “redis/node-redis: A high-performance Node.js Redis client.,” GitHub. [Online]. Available: https://github.com/redis/node-redis.
const express = require("express");
const app = require("express")();
const server = require("http").createServer(app);
const redis = require("redis");
const http = require("http");
const cors = require("cors");
const client = redis.createClient({
  url: "redis://redis:6379",
});

const sub = client.duplicate();
const pub = client.duplicate();

const socketIdtoUser = {};

app.use(cors());
app.use(express.json());

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

server.listen(5000, () => {
  console.log("Server ready");
});

client.connect();
sub.connect();
pub.connect();

client.on("connect", function () {
  console.log("Redis Connected!");
});

io.on("connection", (socket) => {
  console.log("connected");
  console.log(socket.id);

  socket.on("joinedUser", (data) => {
    socketIdtoUser[socket.id] = data.username;
    console.log("joined?", data.username);
    //Enable in Redis: CONFIG SET notify-keyspace-events Ks
    sub.subscribe("__keyspace@0__:online:users", (message, channel) => {
      (async function () {
        socket.emit("userOnlineChanged", await getOnlineUsers());
      })();
    });
  });

  socket.on("joinRoom", (data) => {
    console.log("joining room");
    console.log(data.roomId);

    setRoomsSubcribedByUser(data.username, data.roomId);

    sub.subscribe(data.roomId, (message, channel) => {
      let currentTime = Date.parse(new Date());
      let sentMessage = {
        fromUser: data.username,
        messageContent: message,
        room: data.roomId,
        timeSent: currentTime,
      };
      socket.emit("receive_message", sentMessage);
    });

    console.log("User: " + data.username + " |Joined roomid: " + data.roomId);
  });

  socket.on("sendMessage", (data) => {
    console.log(data.username);
    let focusedRoomId = createRoomKey(data.focusedRoomId);
    let currentTime = Date.parse(new Date());
    let sentMessage = {
      fromUser: data.username,
      messageContent: data.message,
      room: data.focusedRoomId,
      timeSent: currentTime,
    };

    client.zAdd(focusedRoomId, [
      { score: currentTime, value: JSON.stringify(sentMessage) },
    ]);

    pub.publish(data.focusedRoomId, data.message);
  });

  socket.on("disconnect", () => {
    console.log("disconnected");
    let user = socketIdtoUser[socket.id];
    (async function () {
      setUserOnlineStatus(user, false);
      let onlineUsers = await getOnlineUsers();
      console.log("emit disconnect message");

      socket.emit("change_online", "testing");
    })();
  });
});

function createUsernameKey(username) {
  return "userTest:" + username;
}

function createRoomKey(room) {
  return "roomIdTest:" + room;
}

function createUserOnlineKey(username) {
  return "online:" + username;
}

function createRoomSubscribedByuserKey(username) {
  return "userRoomSubscribed:" + username;
}

async function userExist(username) {
  redisUserId = createUsernameKey(username);
  let res = await client.exists(redisUserId);
  if (res === 0) {
    return false;
  } else {
    return true;
  }
}

async function userPassCorrect(username, password) {
  redisUserId = createUsernameKey(username);
  let res = await client.hmGet(redisUserId, "password");
  if (password === res[0]) {
    return true;
  } else {
    return false;
  }
}

async function createUser(username, password) {
  redisUserId = createUsernameKey(username);
  jsonUserData = {
    password: password,
  };
  await client.hSet(redisUserId, jsonUserData);
  // console.log("REDIS createUSER: ", username)
}

async function setUserOnlineStatus(username, isOnline) {
  if (isOnline) {
    await client.sAdd("online:users", username);
  } else {
    await client.sRem("online:users", username);
  }
}

async function getOnlineUsers() {
  let res = await client.sMembers("online:users");

  return { onlineUsers: res };
}

async function setRoomsSubcribedByUser(username, room) {
  let roomSubUserKey = createRoomSubscribedByuserKey(username);

  await client.sAdd(roomSubUserKey, room);
}

async function getRoomsSubcribedByUser(username) {
  let roomSubUserKey = createRoomSubscribedByuserKey(username);
  let res = await client.sMembers(roomSubUserKey);

  return { userRoomSubscribed: res };
}

async function getChatRoomHistory(roomId) {
  let roomIdKey = createRoomKey(roomId);
  let res = await client.zRange(roomIdKey, 0, -1, "REV");
  return res;
}

app.post("/api/getChatHistory/", (req, res) => {
  (async function () {
    res.status(200).send(await getChatRoomHistory(req.body.focusedRoomId));
  })();
});

app.get("/api/getOnlineUsers/", (req, res) => {
  (async function () {
    res.status(200).send(await getOnlineUsers());
  })();
});

app.post("/api/login", (req, res) => {
  // res.setHeader('Content-Type', 'application/json')
  console.log("api login test");
  (async function () {
    let username = req.body.username;
    let password = req.body.password;
    let userExists = await userExist(username);
    if (userExists === true) {
      console.log("in here");
      if ((await userPassCorrect(username, password)) === true) {
        setUserOnlineStatus(username, true);
        res
          .status(200)
          .send(JSON.stringify(await getRoomsSubcribedByUser(username)));
      } else {
        //access forbidden due to password is not being correct
        res.status(403).send();
      }
    } else {
      console.log("create user");
      setUserOnlineStatus(username, true);
      await createUser(username, password);
      res
        .status(200)
        .send(JSON.stringify(await getRoomsSubcribedByUser(username)));
    }
  })();
});
