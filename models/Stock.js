const mongoose = require("mongoose");

const StockSchema = new mongoose.Schema(
  {
    brandnametypeid: {
      type: String,
      required: [true, "Brandtype ID is required"],
    },
    brandname: {
      type: String,
      required: [true, "Brandtype ID is required"],
    },
    brandtype: {
      type: String,
      required: [true, "Brandtype ID is required"],
    },
    openingstock: {
      type: Number,
      required: [true, "The opening stock is required"],
    },
    addedstock: {
      type: Number,
      required: [true, "Stocks added is required"],
    },
    closingstock: {
      type: Number,
      required: [true, "Closing stock is required"],
    },
    soldstock: {
      type: Number,
      required: [true, "Sold  stock is required"],
    },
    ws: {
      type: Number,
      required: [true, "Wholesale sales is required"],
    },
    rtl: {
      type: Number,
      required: [true, "Retail sales is required"],
    },
    profit: {
      type: Number,
      required: [true, "Profit is required"],
    },
    wssales: {
      type: Number,
      required: [true, "Profit is required"],
    },
    rtlsales: {
      type: Number,
      required: [true, "Profit is required"],
    },
  },
  { timestamps: true }
);

const Stock = mongoose.model("Stock", StockSchema);

module.exports = Stock;
