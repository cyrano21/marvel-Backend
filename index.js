require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
// const User = require("./models/user");

const app = express();
app.use(express.json());
app.use(cors());

const MARVEL_API_KEY = process.env.MARVEL_API_KEY;
const MARVEL_API_URL = "https://lereacteur-marvel-api.herokuapp.com";

const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.status(200).json({ message: "Bienvenue sur mon serveur Marvel!" });
});

app.get("/characters", async (req, res) => {
  try {
    let filters = "";
    if (req.query.name) {
      filters += `&name=${req.query.name}`;
    }
    const response = await axios.get(
      `${MARVEL_API_URL}/characters?apiKey=${MARVEL_API_KEY}${filters}`
    );
    res.status(200).json(response.data);
  } catch (error) {
    console.error("An error occurred while fetching characters:", error);
    res.status(500).send("An error occurred");
  }
});

app.get("/character/:characterId", async (req, res) => {
  try {
    const response = await axios.get(
      `${MARVEL_API_URL}/character/${req.params.characterId}?apiKey=${MARVEL_API_KEY}`
    );
    return res.status(200).json(response.data);
  } catch (error) {
    console.error("An error occurred while fetching character details:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/comics", async (req, res) => {
  try {
    const response = await axios.get(
      `${MARVEL_API_URL}/comics?apiKey=${MARVEL_API_KEY}`
    );
    res.send(response.data);
  } catch (error) {
    console.error("An error occurred while fetching comics:", error);
    res.status(500).send("An error occurred");
  }
});

app.get("/comic/:comicId", async (req, res) => {
  try {
    const { comicId } = req.params;
    const comic = await axios.get(
      `https://lereacteur-marvel-api.herokuapp.com/comic/${comicId}?apiKey=${MARVEL_API_KEY}`
    );
    // console.log(comic.data);
    res.json(comic.data);
  } catch (error) {
    res.status(500).json({ message: "Error fetching data." });
  }
});

app.get("/comics/:characterId", async (req, res) => {
  try {
    const { characterId } = req.params;
    const comics = await axios.get(
      `https://lereacteur-marvel-api.herokuapp.com/comics/${characterId}?apiKey=${MARVEL_API_KEY}`
    );
    res.json(comics.data);
  } catch (error) {
    res.status(500).json({ message: "Error fetching data." });
  }
});

app.get("/comics/detail/:comicId", async (req, res) => {
  try {
    const response = await axios.get(
      `https://gateway.marvel.com/v1/public/comics/${req.params.comicId}?apiKey=${MARVEL_API_KEY}`
    );
    res.send(response.data);
  } catch (error) {
    console.error("An error occurred while fetching comic details:", error);
    res.status(500).send("An error occurred");
  }
});

app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const user = new User({ username, password });
  await user.save();
  res.json({ success: true });
});

app.all("*", (req, res) => {
  return res.status(404).json({ message: "not route found" });
});

app.listen(port, () => {
  console.log("Server started 🔥");
});
