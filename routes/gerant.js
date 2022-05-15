const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const config = require("config");
const { check, validationResult, body } = require("express-validator");

const Gerant = require("../models/Gerant");
const isGerant = require("../middleware/isGerant");

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
// @desc     logout Gerant
// @access   gerant only

router.post("/logout", isGerant, (req, res) => {
  req.session.destroy();
  res.redirect("/gerant/login");
});

// @route    PUT gerant/profile/update
// @desc     update profile gerant
// @access   gerant only
router.put(
  "/profile/update",
  isGerant,
  check("nom", "Entrer un nom valide").isAlpha(),
  check("prenom", "Entrer un nom valide").isAlpha(),
  check("email", "Entrer un email valide").isEmail(),
  check("tel", "Entrez un numéro de telephone valide").isMobilePhone(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json(errors);
    }
    try {
      let { nom, prenom, email, password, tel } = req.body;

      let gerant = await Gerant.findById(req.session.userid);

      if (!gerant) {
        throw new Error("Utilisateur introuvable");
      }

      const isMatch = bcrypt.compare(password, gerant.password);
      if (!isMatch) {
        return res
          .status(403)
          .json({ errors: [{ msg: "Entrez votre propre mot de passe" }] });
      }

      const verifierEmail = await Gerant.findOne({ email });
      if (verifierEmail && verifierEmail.id !== gerant.id) {
        return res.status(401).send("Utilisez un email different");
      }

      nom = nom.toLowerCase();
      prenom = prenom.toLowerCase();
      email = email.toLowerCase();

      gerant.nom = nom;
      gerant.prenom = prenom;
      gerant.email = email;
      gerant.tel = tel;

      await gerant.save();

      res.json({ gerant });

      //res.redirect("/gerant/dashboard");
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

// @route    PUT gerant/profile/update/password
// @desc     update password gerant
// @access   gerant only
router.put(
  "/profile/update/password",
  isGerant,
  check("newPassword", "Entrer un mot de passe de taille 8 minimum").isLength({
    min: 8,
  }),
  body("newPasswordConfirmation").custom((value, { req }) => {
    if (value !== req.body.newPassword) {
      throw new Error(
        "Le mot de passe et sa confirmation ne correspendent pas"
      );
    }
    return true;
  }),
  check("oldPassword", "Entrez votre mot de passe").isLength({
    min: 8,
  }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json(errors);
      //res.render("register client") // pass errors array
      //return res.render("client/register", { errors: errors.array() });
    }
    try {
      const { newPassword, oldPassword } = req.body;

      if (newPassword === oldPassword) {
        return res
          .status(401)
          .send("Essayez avec un mot de passe different que l'ancien");
      }
      let gerant = await Gerant.findById(req.session.userid);
      const isMatch = await bcrypt.compare(oldPassword, gerant.password);
      console.log(isMatch);
      if (!isMatch) {
        return res
          .status(403)
          .send("Votre mot de passe actuelle est incorrecte");
      }

      const salt = await bcrypt.genSalt(10);
      const newPasswordHashed = await bcrypt.hash(newPassword, salt);

      gerant.password = newPasswordHashed;
      await gerant.save();

      return res.json(gerant);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("serverError");
    }
  }
);

// @route    DELETE gerant/profile/delete
// @desc     delete profile gerant
// @access   gerant only
router.delete(
  "/profile/delete",
  isGerant,
  check("password", "Entrer votre propre mot de passe").isLength({ min: 8 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({ errors: errors.array() });
    }
    try {
      const gerant = await Gerant.findById(req.session.userid);
      const isMatch = await bcrypt.compare(req.body.password, gerant.password);

      if (!isMatch) {
        return res
          .status(401)
          .json({ errors: [{ msg: "entrez votre propre mot de passe" }] });
      }
      await Gerant.findByIdAndDelete(req.session.userid);
      req.session.destroy();
      res.status(200).send("gerant deleted");
    } catch (err) {
      console.error(err.message);
      return res.status(500).send("Server error");
    }
  }
);

module.exports = router;
