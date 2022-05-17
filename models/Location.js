const mongoose = require("mongoose");

const LocationSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "vehicule",
    required: true,
  },
  vehicule: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "agence.vehicules.vehicule", //pas sûr que ça marcherai
    required: true,
  },
  kilometrageParcouru: {
    type: Number,
    required: true,
  },
  prix: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model("location", LocationSchema);
