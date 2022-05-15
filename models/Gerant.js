const mongoose = require("mongoose");

const GerantSchema = new mongoose.Schema({
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
  tel: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  agences: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "agence",
      default: [],
    },
  ],
});

module.exports = mongoose.model("gerant", GerantSchema);
