require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const bcrypt = require("bcrypt");
const mailgun = require("mailgun-js");
const mongoose = require("mongoose");
const User = require("./models/User");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());
app.use(cors());

const {
  MAILGUN_API_KEY,
  MAILGUN_DOMAIN,
  PORT,
  JWT_SECRET_KEY,
  MARVEL_API_KEY,
} = process.env;
const MARVEL_API_URL = "https://lereacteur-marvel-api.herokuapp.com";
const port = PORT || 3000;
const mg = mailgun({ apiKey: MAILGUN_API_KEY, domain: MAILGUN_DOMAIN });

const connectToDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("connected to MongoDB");
  } catch (error) {
    console.error("Could not connect to MongoDB", error);
  }
};
connectToDatabase();

app.get("/", (req, res) => {
  res.status(200).json({ message: "Bienvenue sur mon serveur Marvel!" });
});

app.get("/characters", async (req, res) => {
  try {
    let filters = "";
    if (req.query.name) {
      filters += `&name=${req.query.name}`;
    }
    if (req.query.skip) {
      filters += `&skip=${req.query.skip}`;
    }
    const response = await axios.get(
      `https://lereacteur-marvel-api.herokuapp.com/characters?apiKey=${process.env.MARVEL_API_KEY}${filters}`
    );

    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(400).json({ message: error.message });
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

app.post("/Signup", async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = new User({
      email: req.body.email,
      password: hashedPassword,
      username: req.body.username,
    });
    await user.save();
    const data = {
      from: "Louis Olivier <louis.olivier.louiscyrano@gmail.com>",
      to: req.body.email,
      subject: "Confirmation d'inscription",
      text: "Cliquez sur ce lien pour confirmer votre inscription...",
    };

    mg.messages().send(data, (error, body) => {
      if (error) {
        throw error;
      }
      const token = jwt.sign({ _id: user._id }, JWT_SECRET_KEY);
      res.status(200).send({
        token,
        message: "Inscription réussie! Veuillez confirmer votre e-mail.",
      });
    });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).send({ message: "Cet e-mail existe déjà." }); // Adjusted the error message
    } else {
      console.error("Erreur lors de l'inscription:", error);
      res.status(500).send({ message: "Erreur lors de l'inscription." });
    }
  }
});

app.all("*", (req, res) => {
  return res.status(404).json({ message: "not route found" });
});

app.listen(port, () => {
  console.log("Server started 🔥");
});
