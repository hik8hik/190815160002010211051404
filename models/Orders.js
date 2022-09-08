const mongoose = require("mongoose");

const OrdersSchema = new mongoose.Schema(
  {
    itemid: {
      type: String,
      required: [true, "Id required."],
    },
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
    sp: {
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
    deleted: {
      type: Boolean,
    },
    addedby: {
      type: String,
    },
    removedby: {
      type: String,
    },
    itemdescription: {
      type: String,
    },
  },
  { timestamps: true }
);

const Orders = mongoose.model("Orders", OrdersSchema);

module.exports = Orders;
