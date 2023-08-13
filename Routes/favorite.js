const express = require("express");
const router = express.Router();
const Favorite = require("../models/Favorite");

router.post("/add", async (req, res) => {
  try {
    const userId = req.body.userId;
    const character = req.body.character;
    let favorite = await Favorite.findOne({ userId });

    if (!favorite) {
      favorite = new Favorite({ userId, characters: [character] });
    } else {
      favorite.characters.push(character);
    }

    await favorite.save();
    res.status(200).send(favorite);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.get("/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const favorite = await Favorite.findOne({ userId });
    res.status(200).send(favorite);
  } catch (err) {
    res.status(400).send(err);
  }
});

// Autres routes pour supprimer, mettre à jour, etc.

module.exports = router;
