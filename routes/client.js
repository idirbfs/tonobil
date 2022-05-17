const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const { check, validationResult, body } = require("express-validator");
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
  check("password", "Invalid Password").trim().isLength({ min: 8 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("client/login", { errors: errors.array() });
    }

    let { email, password } = req.body;
    email = email.toLowerCase();
    try {
      let client = await Client.findOne({ email });
      if (!client) {
        return res.render("client/login", {
          errors: [{ msg: "Invalid Credentials (email)" }],
        });
      }

      const isMatch = await bcrypt.compare(password, client.password);

      if (!isMatch) {
        return res.render("client/login", {
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
      return res.render("client/register", { errors: errors.array() });
    }

    let { nom, prenom, email, password, dateNaissance, tel, numPermis } =
      req.body;

    nom = nom.toLowerCase();
    prenom = prenom.toLowerCase();
    email = email.toLowerCase();

    try {
      let client = await Client.findOne({ email });

      if (client) {
        return res.render("client/register", {
          errors: [{ msg: "User already exists" }],
        });
        //res.render("register client") // pass errors array
      }

      client = await Client.findOne({ numPermis });

      if (client) {
        return res.render("client/register", {
          errors: [{ msg: "Num permis est déjà utilisé" }],
        });
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

// @route    PUT client/update
// @desc     update profile client
// @access   client only
router.put(
  "/update",
  isClient,
  check("nom", "Entrer un nom valide").isAlpha(),
  check("prenom", "Entrer un nom valide").isAlpha(),
  check("email", "Entrer un email valide").isEmail(),

  check("dateNaissance", "Entrez votre date de naissance").isDate(),
  check("tel", "Entrez un numéro de telephone valide").isMobilePhone(),
  check("numPermis", "Entrez votre numero de permis").isNumeric(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json(errors);
      //res.render("register client") // pass errors array
      //return res.render("client/register", { errors: errors.array() });
    }
    try {
      let { nom, prenom, email, password, dateNaissance, tel, numPermis } =
        req.body;

      let client = await Client.findById(req.session.userid);

      if (!client) {
        return res.status(401);
      }

      const isMatch = bcrypt.compare(password, client.password);
      if (!isMatch) {
        return res.status(403);
      }

      nom = nom.toLowerCase();
      prenom = prenom.toLowerCase();
      email = email.toLowerCase();

      const verifierEmail = await Client.findOne({ email });
      if (verifierEmail && verifierEmail.id !== client.id) {
        return res.status(401).send("Utilisez un email different");
      }

      const verifierPermis = await Client.findOne({ numPermis });
      if (verifierPermis && verifierPermis.id !== client.id) {
        return res.status(401).send("entrer votre propore numero de permis");
      }

      client.nom = nom;
      client.prenom = prenom;
      client.email = email;
      client.dateNaissance = dateNaissance;
      client.tel = tel;
      client.numPermis = numPermis;

      await client.save();

      //return res.json({ client });

      return res.redirect("/client/dashboard", { client });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

// @route    PUT client/update/password
// @desc     update profile client
// @access   client only
router.put(
  "/update/password",
  isClient,
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
      let client = await Client.findById(req.session.userid);
      const isMatch = await bcrypt.compare(oldPassword, client.password);
      console.log(isMatch);

      if (!isMatch) {
        return res
          .status(403)
          .send("Votre mot de passe actuelle est incorrecte");
      }

      const salt = await bcrypt.genSalt(10);
      const newPasswordHashed = await bcrypt.hash(newPassword, salt);

      client.password = newPasswordHashed;
      await client.save();

      return res.json(client);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("serverError");
    }
  }
);

// @route    DELETE client/profile/delete
// @desc     delete profile client
// @access   client only
router.delete(
  "/profile/delete",
  isClient,
  check("password", "Entrer votre propre mot de passe").isLength({ min: 8 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({ errors: errors.array() });
    }
    try {
      const client = await Client.findById(req.session.userid);
      const isMatch = await bcrypt.compare(req.body.password, client.password);

      if (!isMatch) {
        return res
          .status(401)
          .json({ errors: [{ msg: "entrez votre propre mot de passe" }] });
      }

      await Client.findByIdAndDelete(req.session.userid);

      req.session.destroy();

      res.status(200).send("client deleted");
    } catch (err) {
      console.error(err.message);
      return res.status(500).send("Server error");
    }
  }
);

module.exports = router;
