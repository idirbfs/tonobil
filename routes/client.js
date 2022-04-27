const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const { check, validationResult } = require("express-validator");
const Client = require("../models/Client");
const isClient = require("../middleware/isClient");

// @route    GET client/dashboard
// @desc     Register CLIENT & get token
// @access   Public
router.get("/dashboard", isClient, async (req, res) => {
  let client = await Client.findById(req.session.userid);
  res.render("client/dashboard", {
    nom: client.nom,
    prenom: client.prenom,
    email: client.email,
  });
});

// @route    GET client/login
// @desc     Register CLIENT & get token
// @access   Public
router.get("/login", (req, res) => {
  res.render("client/login");
});

// @route    POST client/login
// @desc     login CLIENT
// @access   Public
router.post(
  "/login",
  check("email", "Invalid email").isEmail(),
  check("password", "Invalid Password").trim().isLength({ min: 1 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("home", { errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
      let client = await Client.findOne({ email });
      if (!client) {
        return res.render("home", {
          errors: [{ msg: "Invalid Credentials (email)" }],
        });
      }

      const isMatch = await bcrypt.compare(password, client.password);

      if (!isMatch) {
        return res.render("home", {
          errors: [{ msg: "Invalid Credentials (password)" }],
        });
      }

      req.session.userid = client.id;
      req.session.isClient = true;

      return res.redirect("/client/dashboard");
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

// @route    GET client/register
// @desc     Register CLIENT & get token
// @access   Public
router.get("/register", (req, res) => {
  res.render("client/register");
});

// @route    POST client/register
// @desc     Register CLIENT & get token
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
  check("dateNaissance", "Entrez votre date de naissance").isDate(),
  check("tel", "Entrez un numéro de telephone valide").isMobilePhone(),
  check("numPermis", "Entrez votre numero de permis").isNumeric(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      //res.render("register client") // pass errors array
      return res.status(400).json({ errors: errors.array() });
    }

    const { nom, prenom, email, password, dateNaissance, tel, numPermis } =
      req.body;

    try {
      let client = await Client.findOne({ email });

      if (client) {
        return res
          .status(400)
          .json({ errors: [{ msg: "User already exists" }] });
        //res.render("register client") // pass errors array
      }

      client = await Client.findOne({ numPermis });

      if (client) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Num permis est déjà utilisé" }] });
        //res.render("register client") // pass errors array
      }

      client = new Client({
        nom,
        prenom,
        email,
        password,
        dateNaissance,
        numPermis,
        tel,
      });

      const salt = await bcrypt.genSalt(10);
      client.password = await bcrypt.hash(password, salt);

      await client.save();

      req.session.userid = client.id;
      req.session.isClient = true;

      res.redirect("/client/dashboard");
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

// @route    POST client/logout
// @desc     logout client
// @access   client only

router.post("/logout", isClient, (req, res) => {
  req.session.destroy();
  res.redirect("/client/login");
});

module.exports = router;
