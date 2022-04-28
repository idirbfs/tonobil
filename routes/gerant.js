const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const { check, validationResult } = require("express-validator");

const Gerant = require("../models/Gerant");
const isGerant = require("../middleware/isGerant");
const isAdmin = require("../middleware/isAdmin");

// @route    GET gerant/dashboard
// @desc     load dashboard
// @access   gerant
router.get("/dashboard", isGerant, async (req, res) => {
  let gerant = await Gerant.findById(req.session.userid);
  res.render("gerant/dashboard", {
    nom: gerant.nom,
    prenom: gerant.prenom,
    email: gerant.email,
  });
});

// @route    GET gerant/register
// @desc     load register page
// @access   Public
router.get("/register", (req, res) => {
  res.render("gerant/register");
});

// @route    POST gerant/register
// @desc     Register gerant & get token
// @access   Public
router.post(
  "/register",
  check("nom", "Le nom est obligatoire").isAlpha(),
  check("prenom", "Le prenom est obligatoire").isAlpha(),
  check("email", "Entrer un email valide").isEmail(),
  check(
    "password",
    "La taille du mot de passe doit être de minimum 8"
  ).isLength({
    min: 8,
  }),
  check("tel", "Entrez un numéro de telephone valide").isMobilePhone(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      //res.render("register gerant") // pass errors array
      return res.status(400).json({ errors: errors.array() });
    }

    let { nom, prenom, email, password, tel } = req.body;
    nom = nom.toLowerCase();
    prenom = prenom.toLowerCase();
    email = email.toLowerCase();

    try {
      let gerant = await Gerant.findOne({ email });

      if (gerant) {
        return res
          .status(400)
          .json({ errors: [{ msg: "User already exists" }] });
        //res.render("register gerant") // pass errors array
      }

      gerant = new Gerant({
        nom,
        prenom,
        email,
        password,
        tel,
      });

      const salt = await bcrypt.genSalt(10);
      gerant.password = await bcrypt.hash(password, salt);

      await gerant.save();

      req.session.userid = gerant.id;
      req.session.isGerant = true;
      res.redirect("/gerant/dashboard");
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

// @route    GET gerant/login
// @desc     login gerant
// @access   Public
router.get("/login", (req, res) => {
  res.render("gerant/login");
});

// @route    POST gerant/login
// @desc     login gerant
// @access   Public
router.post(
  "/login",
  check("email", "Invalid email").isEmail(),
  check("password", "Invalid Password").trim().isLength({ min: 1 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("gerant/login", { errors: errors.array() });
    }

    let { email, password } = req.body;
    email = email.toLowerCase();
    try {
      let gerant = await Gerant.findOne({ email });
      if (!gerant) {
        return res.render("gerant/login", {
          errors: [{ msg: "Invalid Credentials (email)" }],
        });
      }

      const isMatch = await bcrypt.compare(password, gerant.password);

      if (!isMatch) {
        return res.render("gerant/login", {
          errors: [{ msg: "Invalid Credentials (password)" }],
        });
      }

      req.session.userid = gerant.id;
      req.session.isGerant = true;
      res.redirect("/gerant/dashboard");
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

// @route    POST gerant/logout
// @desc     logout ADMIN
// @access   gerant only

router.post("/logout", isAdmin, (req, res) => {
  req.session.destroy();
  res.redirect("/gerant/login");
});

module.exports = router;
