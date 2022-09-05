const mongoose = require("mongoose");

const ErrorSchema = new mongoose.Schema(
  {
    errortype: {
      type: String,
    },
    errormsg: {
      type: String,
    },
  },
  { timestamps: true }
);

const Errors = mongoose.model("Errors", ErrorSchema);

module.exports = Errors;
