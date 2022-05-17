const mongoose = require("mongoose");

const AgenceSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true,
    unique: true,
  },
  numAgrement: {
    type: Number,
    required: true,
    unique: true,
  },
  vehicules: [
    {
      vehicule: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "vehicule",
        required: true,
      },
      numChassis: { type: String, required: true, unique: true },
      matricule: { type: String, required: true, unique: true },
      kilometrage: { type: Number, required: true },
      fichesMaintenance: [
        {
          operationType: {
            type: String,
            enum: ["vidange", "courroie distribution", "disques frein"], //à mettre à jour
            required: true,
          },
          kilometrage: { type: Number, required: true },
          mecanicien: {
            nom: { type: String, required: true },
            adresse: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "wilaya.communes[]",
            },
          },
        },
      ],
    },
  ],
  adresses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "wilaya.communes[]",
    },
  ],
});

module.exports = mongoose.model("agence", AgenceSchema);
