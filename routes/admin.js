const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const { check, validationResult } = require("express-validator");

const Admin = require("../models/Admin");
const Client = require("../models/Client");
const isAdmin = require("../middleware/isAdmin");

// @route    GET admin/dashboard
// @desc     dashboard
// @access   Admin ONLY
router.get("/dashboard", isAdmin, async (req, res) => {
  let admin = await Admin.findById(req.session.userid);
  res.render("admin/dashboard", {
    nom: admin.nom,
    prenom: admin.prenom,
    email: admin.email,
  });
});

// @route    GET admin/login
// @desc     dashboard
// @access
router.get("/login", (req, res) => {
  if (req.session.isAdmin) {
    res.redirect("/admin/dashboard");
  }

  res.render("admin/login");
});

// @route    POST admin/
// @desc     Authenticate ADMIN
// @access   Public
router.post(
  "/",
  check("email", "Invalid email").isEmail(),
  check("password", "Invalid Password").trim().isLength({ min: 8 }),
  async (req, res) => {
    if (req.session.isAdmin) {
      return res.redirect("/admin/dashboard");
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("admin/login", { errors: errors.array() });
    }

    let { email, password } = req.body;
    email = email.toLowerCase();
    try {
      let admin = await Admin.findOne({ email });
      if (!admin) {
        return res.render("admin/login", {
          errors: [{ msg: "Invalid Credentials (email)" }],
        });
      }

      const isMatch = await bcrypt.compare(password, admin.password);

      if (!isMatch) {
        return res.render("admin/login", {
          errors: [{ msg: "Invalid Credentials (password)" }],
        });
      }

      req.session.userid = admin.id;
      req.session.isAdmin = true;

      res.redirect("/admin/dashboard");
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

// @route    POST admin/logout
// @desc     logout ADMIN
// @access   admin only

router.post("/logout", isAdmin, (req, res) => {
  req.session.destroy();
  res.redirect("/admin/login");
});

// @route    DELETE admin/client/:id
// @desc     delete client by ADMIN
// @access   admin only
router.delete(
  "/client/:id",
  isAdmin,
  check("password", "Entrer votre propre mot de passe").isLength({ min: 8 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({ errors: errors.array() });
    }
    try {
      //return res.send(req.params["id"]);
      const admin = await Admin.findById(req.session.userid);
      const isMatch = await bcrypt.compare(req.body.password, admin.password);
      if (!isMatch) {
        return res
          .status(401)
          .json({ errors: [{ msg: "entrez votre propre mot de passe" }] });
      }

      const client = await Client.findById(req.params["id"]);
      if (!client) {
        return res.status(404).send("Client not found");
      }
      await Client.findByIdAndDelete(client.id);

      return res.status(200).send("client deleted");
    } catch (err) {
      console.error(err.message);
      return res.status(500).send("Server error");
    }
  }
);

// @route    GET admin/client/all
// @desc     get all clients
// @access   admin only
router.get("/client/all", isAdmin, async (req, res) => {
  const clients = await Client.find();
  return res.send(clients);
});

// @route    DELETE admin/client/:id
// @desc     delete agence by ADMIN
// @access   admin only
router.delete(
  "/agence/:id",
  isAdmin,
  check("password", "Entrer votre propre mot de passe").isLength({ min: 8 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({ errors: errors.array() });
    }
    try {
      const admin = await Admin.findById(req.session.userid);
      const isMatch = await bcrypt.compare(req.body.password, admin.password);
      if (!isMatch) {
        return res
          .status(401)
          .json({ errors: [{ msg: "entrez votre propre mot de passe" }] });
      }

      const agence = await Agence.findById(req.params["id"]);
      if (!agence) {
        return res.status(404).send("Agence not found");
      }
      await Agence.findByIdAndDelete(agence.id);

      return res.status(200).send("client deleted");
    } catch (err) {
      console.error(err.message);
      return res.status(500).send("Server error");
    }
  }
);

module.exports = router;
