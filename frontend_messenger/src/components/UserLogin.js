import React, { useState } from "react";
import { Box, TextField, Paper, Grid, Button, Typography } from "@mui/material";
import PropTypes from "prop-types";
const axios = require("axios");

function UserLogin({ setUserName, setSubscribedRooms }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState(false);

  async function login() {
    let userPayload = { username, password };
    await axios
      .post("http://localhost:80/api/login", JSON.stringify(userPayload), {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then(function (response) {
        //get rooms that user is in
        //get users that are online in those rooms
        let data = response.data;
        console.log("Login Success");
        setSubscribedRooms(data.userRoomSubscribed);
        setUserName(username);
        setLoginError(false);
      })
      .catch(function (err) {
        console.log("not working");
        setLoginError(true);
      });
  }

  return (
    <Grid
      container
      alignItems="center"
      justifyContent="center"
      spacing={0}
      style={{ minHeight: "100vh" }}
    >
      <Paper
        elevation={3}
        sx={{
          borderRadius: "10px",
          width: 460,
          minHeight: 400,
          maxHeight: 400,
        }}
      >
        <Grid
          container
          spacing={0}
          direction="column"
          sx={{ pl: "32px", pr: "32px" }}
        >
          <Box
            component="span"
            sx={{
              textAlign: "center",
              fontFamily: "Helvetica",
              fontWeight: "bold",
              pt: "37px",
              pb: "27px",
              fontSize: 25,
            }}
          >
            Welcome back!
          </Box>
          <Typography sx={{ fontWeight: "bold", pb: "0px" }}>
            {" "}
            Username{" "}
          </Typography>
          <TextField
            onChange={(event) => {
              setUsername(event.target.value);
            }}
            sx={{ mb: "22px", mt: "8px" }}
            fullWidth
            required
            size="small"
            id="username"
            margin="normal"
          />
          <Typography sx={{ fontWeight: "bold" }}> Password </Typography>
          <TextField
            onChange={(event) => {
              setPassword(event.target.value);
            }}
            sx={{ mt: "8px" }}
            pb="1px"
            fullWidth
            required
            size="small"
            id="password"
            error={loginError}
            helperText={loginError ? "Incorrect Password" : " "}
          />
          <Button
            onClick={login}
            sx={{ height: "43px", mt: "30px", mb: "14px", mt: "15px" }}
            type="submit"
            variant="contained"
            fullWidth
          >
            Sign In / Register
          </Button>
        </Grid>
      </Paper>
    </Grid>
  );
}

export default UserLogin;
