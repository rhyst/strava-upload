const express = require("express");
const axios = require("axios").default;
const cookieParser = require("cookie-parser");
const cookieEncrypter = require("cookie-encrypter");
const multer = require("multer");
const FormData = require("form-data");
var fs = require("fs");

const app = express();

const port = process.env.PORT || 3000;
const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;
const secretKey = process.env.SECRET_KEY;
const appUrl = process.env.APP_URL;

const AUTH_URL = `http://www.strava.com/oauth/authorize?client_id=${client_id}&response_type=code&redirect_uri=${appUrl}/exchange_token&approval_prompt=auto&scope=activity:write`;

const setAuthCookie = (authData, res) => {
  const cookieParams = {
    httpOnly: true,
    signed: true,
    maxAge: 300000,
  };
  res.cookie("auth", authData, cookieParams);
};

const handleAuth = async (req, res) => {
  if (req.signedCookies.auth) {
    if (Date.now() > req.signedCookies.auth.expires_at) {
      console.log("Authorisation valid");
      return true;
    } else {
      console.log("Authorisation expired - refreshing");
      const authResponse = await axios.post(
        "https://www.strava.com/oauth/token ",
        null,
        {
          params: {
            refresh_token: req.signedCookies.auth.refresh_token,
            client_id,
            client_secret,
            grant_type: "refresh_token",
          },
        }
      );
      console.log(authResponse.data);
      setAuthCookie(authResponse.data, res);
      return true;
    }
  }
  console.log("Authorisation does not exist");
  return false;
};

app.use(cookieParser(secretKey));
app.use(cookieEncrypter(secretKey));

app.get("/", async (req, res, next) => {
  const isAuthed = await handleAuth(req, res);
  if (!isAuthed) {
    return res.redirect(AUTH_URL);
  }
  console.log(req.signedCookies.auth.access_token);
  next();
});
app.use("/", express.static("public"));

app.get("/exchange_token", async (req, res) => {
  const authResponse = await axios.post(
    "https://www.strava.com/oauth/token ",
    null,
    {
      params: {
        code: req.query.code,
        client_id,
        client_secret,
        grant_type: "authorization_code",
      },
    }
  );

  setAuthCookie(authResponse.data, res);
  res.redirect("/");
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.post("/upload", upload.single("file"), async (req, res, next) => {
  const isAuthed = handleAuth(req, res);
  if (!isAuthed) {
    return res.redirect(AUTH_URL);
  }

  const form = new FormData();
  form.append("name", req.body.name);
  form.append("description", req.body.description);
  form.append("trainer", req.body.trainer);
  form.append("commute", req.body.commute);
  form.append("data_type", req.body.data_type);
  form.append("file", req.file.buffer, "track.gpx");

  try {
    const response = await axios.post(
      "https://www.strava.com/api/v3/uploads",
      form,
      {
        headers: {
          ...form.getHeaders(),
          Authorization: `Bearer ${req.signedCookies.auth.access_token}`,
        },
      }
    );
  } catch (e) {
    if (e.response && e.response.data) {
      console.log(e.response.data);
    } else {
      console.log(e);
    }
  }
  return res.redirect("/");
});

app.listen(port, () =>
  console.log(`App listening at http://${appUrl}:${port}`)
);
