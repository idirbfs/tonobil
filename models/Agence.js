const mongoose = require("mongoose");

const AgenceSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true,
    unique: true,
  },
  vehicules: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "vehicule",
      // numChassis: { type: String },
      // matricule: String,
      // kilometrage: String,
      // fichesMaintenance: [{}],
    },
  ],
  adresses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "wilaya",
    },
  ],
});

module.exports = mongoose.model("agence", AgenceSchema);
