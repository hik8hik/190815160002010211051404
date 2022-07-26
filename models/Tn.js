// Just A simple store for current number
const mongoose = require("mongoose");

const TnSchema = new mongoose.Schema(
  {
    tn: {
      type: Number,
    },
  },
  { timestamps: true }
);

const Tn = mongoose.model("Tn", TnSchema);

module.exports = Tn;
