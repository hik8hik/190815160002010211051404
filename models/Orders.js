const mongoose = require("mongoose");

const OrdersSchema = new mongoose.Schema(
  {
    ordertype: {
      type: String,
      default: "direct",
    },
    invoicenumber: {
      type: String,
      required: [true, "Invoice Number is required."],
    },
    itemname: {
      type: String,
      required: [true, "Item Name is required."],
    },
    itemcategory: {
      type: String,
      required: [true, "Item Category is required."],
    },
    itemsubcategory: {
      type: String,
      required: [true, "Item Full Name is Required."],
    },
    itembrand: {
      type: String,
      required: [true, "Item Brand is required."],
    },
    itemvariant: {
      type: String,
      required: [true, "Item Variant is required."],
    },
    itembarcode: {
      type: String,
    },
    qbought: {
      type: Number,
      required: [true, "Quantity Bought is required."],
    },
    singleitembp: {
      type: Number,
      required: [true, "Total Item Buying Price is required."],
    },
    singleitemsp: {
      type: Number,
      required: [true, "Total Item Buying Price is required."],
    },
    itemalloweddiscount: {
      type: Number,
      required: [true, "Total Item Buying Price is required."],
    },
    status: {
      type: Boolean,
      default: true,
    },
    itemdescription: {
      type: String,
    },
  },
  { timestamps: true }
);

const Orders = mongoose.model("Orders", OrdersSchema);

module.exports = Orders;
