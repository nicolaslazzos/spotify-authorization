import express, { Request, Response } from "express";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";

import { getParams } from "./helpers/get-params";

const app = express();

dotenv.config();

app.use(express.json({ extended: false } as any));

app.use(cors());

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const AUTHORIZATION = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");

const HOST = process.env.HOST;
const CLIENT_HOST = process.env.CLIENT_HOST;

const REDIRECT_URI = `${HOST}/api/auth/callback`;

app.get("/api/auth", (req: Request, res: Response) => {
  const query = getParams({ response_type: "code", client_id: CLIENT_ID, redirect_uri: REDIRECT_URI });

  res.redirect(`https://accounts.spotify.com/authorize?${query}`);
});

app.get("/api/auth/callback", async (req: Request, res: Response) => {
  try {
    const { code, error } = req.query;

    if (error) throw new Error("Permission was not granted");

    const body = getParams({ grant_type: "authorization_code", code, redirect_uri: REDIRECT_URI });

    const response = await axios.post("https://accounts.spotify.com/api/token", body, {
      headers: { authorization: `Basic ${AUTHORIZATION}`, "content-type": "application/x-www-form-urlencoded" }
    });

    const query = getParams(response.data);

    res.redirect(`${CLIENT_HOST}?${query}`);
  } catch (e) {
    console.error(e.message);

    res.redirect(`${CLIENT_HOST}`);
  }
});

app.post("/api/auth/token", async (req: Request, res: Response) => {
  try {
    const { refresh_token } = req.params;

    const body = getParams({ grant_type: "refresh_token", refresh_token });

    const response = await axios.post("https://accounts.spotify.com/api/token", body, {
      headers: { authorization: `Basic ${AUTHORIZATION}`, "content-type": "application/x-www-form-urlencoded" }
    });

    res.send(response.data);
  } catch (e) {
    console.error(e.message);

    res.status(500).send("Internal server error");
  }
});

const PORT = process.env.PORT;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
