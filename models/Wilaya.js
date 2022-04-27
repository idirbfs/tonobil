const mongoose = require("mongoose");

const WilayaSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
  },
  nom: {
    type: String,
    required: true,
    unique: true,
  },
  communes: [
    {
      idCommune: {
        type: Number,
        required: true,
      },
      nom: {
        type: String,
        required: true,
      },
    },
  ],
});

module.exports = mongoose.model("wilaya", WilayaSchema);
