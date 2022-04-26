import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import React, { useState, useEffect, useRef } from "react";
import {
  ListItem,
  Typography,
  Badge,
  ListItemText,
  ListItemAvatar,
  Avatar,
} from "@mui/material";
import { createTheme, ThemeProvider, styled } from "@mui/material/styles";

const onlineBadgeTheme = createTheme({
  palette: {
    primary: {
      main: "#3ba55d", //green online
    },
    secondary: {
      main: "#be3d41", //red offline
    },
  },
});

function MessageBubble({ messageContent, timeStamp, userName, onlineUsers }) {
  let badgeColor = useRef("primary");

  if (onlineUsers.includes(userName)) {
    badgeColor = "primary";
  } else {
    badgeColor = "secondary";
  }
  return (
    <ThemeProvider theme={onlineBadgeTheme}>
      <ListItem alignItems="flex-start">
        <ListItemAvatar>
          <Badge
            //onlineStatus dictate color of message bubble
            color={badgeColor}
            overlap="circular"
            badgeContent=" "
            variant="dot"
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
          >
            <Avatar sx={{ width: 33, height: 33 }}>
              <AccountCircleIcon />
            </Avatar>
          </Badge>
        </ListItemAvatar>
        <ListItemText
          primary={
            <React.Fragment>
              {userName}
              <Typography
                sx={{ display: "inline" }}
                component="span"
                variant="body2"
                color="text.primary"
              >
                {" " + timeStamp}
              </Typography>
            </React.Fragment>
          }
          secondary={messageContent}
        />
      </ListItem>
    </ThemeProvider>
  );
}

export default MessageBubble;
