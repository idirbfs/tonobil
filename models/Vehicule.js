const mongoose = require("mongoose");

const VehiculeSchema = new mongoose.Schema({
  modele: {
    type: String,
    required: true,
  },
  marque: {
    type: String,
    required: true,
  },
  capaciteCoffre: {
    type: String,
  },
  carburant: {
    type: String,
    enum: ["essence", "diesel"],
    required: true,
  },
  transmission: {
    type: String,
    enum: ["manuelle", "automatique"],
    required: true,
  },
  prix: {
    type: Number,
    required: true,
  },
  photo: {
    type: Buffer,
    contentType: String,
    required: true,
  },
});

module.exports = mongoose.model("vehicule", VehiculeSchema);
