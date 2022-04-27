const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const { check, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const config = require("config");

const Admin = require("../models/Admin");
const isAdmin = require("../middleware/isAdmin");

// @route    GET admin/dashboard
// @desc     dashboard
// @access   Admin ONLY
router.get("/dashboard", isAdmin, async (req, res) => {
  let admin = await Admin.findById(req.session.userid);
  console.log(admin);
  res.render("admin/dashboard", {
    nom: admin.nom,
    prenom: admin.prenom,
    email: admin.email,
  });
});

// @route    GET admin/dashboard
// @desc     dashboard
// @access   Admin ONLY
router.get("/login", async (req, res) => {
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
  check("password", "Invalid Password").trim().isLength({ min: 1 }),
  async (req, res) => {
    if (req.session.isAdmin) {
      return res.redirect("/admin/dashboard");
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("admin/login", { errors: errors.array() });
    }

    const { email, password } = req.body;
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

module.exports = router;
