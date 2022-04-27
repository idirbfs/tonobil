const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const { check, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const config = require("config");

const Admin = require("../models/Admin");

// @route    GET admin/dashboard
// @desc     dashboard
// @access   Admin ONLY
router.get("/dashboard", (req, res) => {
  const session = req.session;
  console.log(session.userid);
  if (session.userid) {
    res.render("adminDashboard");
  }
});

// @route    POST admin/
// @desc     Authenticate ADMIN & get token
// @access   Public
router.post(
  "/",
  check("email", "Invalid email").isEmail(),
  check("password", "Invalid Password").trim().isLength({ min: 1 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("home", { errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
      let admin = await Admin.findOne({ email });
      if (!admin) {
        return res.render("home", {
          errors: [{ msg: "Invalid Credentials (email)" }],
        });
      }

      const isMatch = await bcrypt.compare(password, admin.password);

      if (!isMatch) {
        return res.render("home", {
          errors: [{ msg: "Invalid Credentials (password)" }],
        });
      }

      var payload = {
        user: {
          id: admin.id,
        },
      };
      jwt.sign(
        payload,
        config.get("jwtSecret"),
        { expiresIn: 3600 },
        (err, token) => {
          if (err) throw err;
          console.log(token);
          req.cookies = ("token", token);
        }
      );

      res.send("ça marche");
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

module.exports = router;
