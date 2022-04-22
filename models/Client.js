const mongoose = require("mongoose");

const ClientSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true,
  },
  prenom: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  dateNaissance: {
    type: Date,
    required: true,
  },
  numPermis: {
    type: String,
    required: true,
  },
  tel: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("client", ClientSchema);
