const mongoose = require("mongoose");

const items = new mongoose.Schema(
  {
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
      type: String,
      required: [true, "Auto Buying Price Missing."],
    },
    totalitemsdiscount: {
      type: String,
      required: [true, "Auto Buying Price Missing."],
    },
    itemtotalbp: {
      type: String,
      required: [true, "Total Item Buying Price is required."],
    },
    singleitemsp: {
      type: String,
      required: [true, "Auto Selling Price Missing."],
    },
  },
  { timestamps: true }
);

const TicketSchema = new mongoose.Schema(
  {
    ticketnumber: {
      type: String,
    },
    noitems: {
      type: Number,
      required: [true, "Quantity Bought is required."],
    },
    items: [items],
    totaldiscount: {
      type: Number,
      required: [true, "Auto Buying Price Missing."],
    },
    total: {
      type: Number,
      required: [true, "Total Item Buying Price is required."],
    },
    ticketstatus: {
      type: Boolean,
      default: true,
    },
    status: {
      type: Boolean,
      default: true,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Ticket = mongoose.model("Ticket", TicketSchema);

module.exports = Ticket;
