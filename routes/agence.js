const express = require("express");
const router = express.Router();
const { check, validationResult, body } = require("express-validator");
const isGerant = require("../middleware/isGerant");
const Gerant = require("../models/Gerant");
const Agence = require("../models/Agence");

// @route    GET /agence/all
// @desc     get all agences
// @access   gerant only

router.get("/all", isGerant, async (req, res) => {
  try {
    const gerant = await Gerant.findById(req.session.userid).populate(
      "agences"
    );
    return res.json(gerant.agences);
  } catch (err) {
    console.error(err.msg);
    return res.status(500).send("Server error");
  }
});

// @route    POST /agence/add
// @desc     add new agence
// @access   gerant only

router.post(
  "/add",
  isGerant,
  check("nom", "Entrez un nom valide").trim().not().isEmpty(),
  check("numAgrement", "Entrez un num d'agrement valide").trim().isNumeric(),
  check("adresse", "Erreur dans le champs adresse").trim().isMongoId(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({ errors: errors.array() });
    }
    try {
      const { nom, numAgrement, adresse } = req.body;
      let gerant = await Gerant.findById(req.session.userid);
      if (!gerant) {
        return res.status(500).send("server error");
      }
      let agence = new Agence({ nom, numAgrement, adresse });
      await agence.save();
      gerant.agences.push(agence.id);
      await gerant.save();
      return res.json(agence);
    } catch (err) {
      console.error(err.msg);
      return res.status(500).send("Server error");
    }
  }
);

// @route    GET /agence/:index
// @desc     get agence dashboard by index
// @access   gerant only

router.get("/:index", isGerant, async (req, res) => {
  try {
    let gerant = await Gerant.findById(req.session.userid).populate("agences");
    if (!gerant) {
      return res.status(500).send("server error");
    }

    if (!Number.parseInt(req.params["index"])) {
      return res.status(404).send("not found");
    }

    if (Number.parseInt(req.params["index"]) > gerant.agences.length) {
      return res.status(404).send("Not found");
    }

    return res.json(gerant.agences[Number.parseInt(req.params["index"])]);
  } catch (err) {
    console.error(err.msg);
    return res.status(500).send("Server error");
  }
});

module.exports = router;
