const mongoose = require("mongoose");

const AgenceSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true,
  },
  gerant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "gerant",
  },
  vehicules: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "vehicule",
    },
  ],
  adresses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "adresse",
    },
  ],
});

module.exports = mongoose.model("agence", AgenceSchema);
