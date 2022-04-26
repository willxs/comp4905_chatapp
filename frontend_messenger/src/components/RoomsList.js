import React, { useState, useEffect } from "react";
import { ListItemIcon, ListItemButton, ListItemText } from "@mui/material";
import TagIcon from "@mui/icons-material/Tag";

function RoomsList({ roomName, focusedRoomIdCallBack }) {
  return (
    <ListItemButton>
      <ListItemIcon>
        <TagIcon />
      </ListItemIcon>
      <ListItemText
        onClick={() => {
          focusedRoomIdCallBack(roomName);
        }}
        sx={{ ml: "3px" }}
        primary={roomName}
      />
    </ListItemButton>
  );
}

export default RoomsList;
