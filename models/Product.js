const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    pin: {
      type: Number,
      required: [true, "PIN is required"],
    },
    pinserial: {
      type: Number,
      required: [true, "PIN serial is required"],
    },
    provider: {
      type: String,
      required: [true, "Full name of service provider is required"],
    },
    worth: {
      type: Number,
      required: [true, "PIN Worth is required"],
    },
    expdate: {
      type: Date,
      required: [true, "PIN expiry date is required"],
    },
    status: {
      type: Boolean,
      required: [true, "PIN status is required"],
      default: true,
    },
    reqby: {
      type: String,
      required: [true, "Full name of service provider is required"],
      default: "-",
    },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", ProductSchema);

module.exports = Product;
