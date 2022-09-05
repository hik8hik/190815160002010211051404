const mongoose = require("mongoose");

const CoverSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    cover: {
      data: Buffer,
      contentType: String,
    },
  },
  { timestamps: true }
);

const Cover = mongoose.model("Cover", CoverSchema);

module.exports = Cover;
