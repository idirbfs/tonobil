const express = require("express");
const isAdmin = require("../middleware/isAdmin");
const Admin = require("../models/Admin");
const Vehicule = require("../models/Vehicule");
const router = express.Router();
const { check, body, validationResult } = require("express-validator");
const multer = require("multer");
const upload = multer({ dest: "public/uploads/" });

// @route    POST /vehicule/admin/add
// @desc     add vehicule
// @access   admin only
router.post(
  "/admin/add",
  isAdmin,
  check("modele", "Entrez un modele valide").trim().not().isEmpty(),
  check("marque", "Entrez une marque valide").trim().not().isEmpty(),
  check("capaciteCoffre", "Entrez une capacité valide").trim().isNumeric(),
  body("carburant").custom((value) => {
    if (!["essence", "diesel"].includes(value)) {
      throw new Error("Choisissez entre Essence et diesel");
    }
    return true;
  }),
  body("transmission").custom((value) => {
    if (!["manuelle", "automatique"].includes(value)) {
      throw new Error("Choisissez entre Manuelle et Automatique");
    }
    return true;
  }),
  check("prix", "Entrez un prix valide").trim().isNumeric(),
  //upload.single("photo"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json(errors);
    }
    try {
      const { modele, marque, capaciteCoffre, carburant, transmission, prix } =
        req.body;

      const vehicule = new Vehicule({
        modele,
        marque,
        capaciteCoffre,
        carburant,
        transmission,
        prix,
      });
      await vehicule.save();
      return res.json(vehicule);
    } catch (err) {
      console.error(err.msg);
      return res.status(500).send("Server error");
    }
  }
);

module.exports = router;
