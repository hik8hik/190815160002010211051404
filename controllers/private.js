const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const express = require("express");

const assert = require("assert");
const mongodb = require("mongodb");

const User = require("../models/User");
const Product = require("../models/Product");
const Orders = require("../models/Orders");
const Invoice = require("../models/Invoice");
const Invoicereport = require("../models/Invoicereport");
const Ticket = require("../models/Ticket");
const Tn = require("../models/Tn");
const Stock = require("../models/Stock");
const Covers = require("../models/Covers");
const Errors = require("../models/Errors");

// constants global varialbles
const thisYear = new Date().getFullYear();
const lastYear = thisYear - 1;

exports.getPrivateData = (req, res, next) => {
  res.status(200).json({
    success: true,
    data: "You got access to private data in this route",
  });
};

// add-invoice controller 👇👇
exports.addInvoice = async (req, res, next) => {
  const {
    invoicenumber,
    invoicecompany,
    itemname,
    itemcategory,
    itemsubcategory,
    itembrand,
    itemvariant,
    itembarcode,
    qbought,
    singleitembp,
    totalitemsdiscount,
    singleitemsp,
    itemcover,
  } = req.body;

  console.log(itemcover);

  // Already subtracted discount in frontend
  let itemtotalbp = singleitembp * qbought;

  try {
    await Invoice.create({
      invoicenumber,
      invoicecompany,
      itemname,
      itemcategory,
      itemsubcategory,
      itembrand,
      itemvariant,
      itembarcode,
      qbought,
      singleitembp,
      totalitemsdiscount,
      itemtotalbp,
      singleitemsp,
    });

    res
      .status(201)
      .json({ success: true, data: "Product Added To Invoice Successfully" });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
// add-invoice controller 👆☝

// add-products controller 👇👇
exports.addproduct = async (req, res, next) => {
  const {
    invoicenumber,
    invoicecompany,
    itemname,
    itemcategory,
    itemsubcategory,
    itembrand,
    itemvariant,
    itembarcode,
    qbought,
    itemtotalbp,
  } = req.body;

  try {
    await Product.create({
      invoicenumber,
      invoicecompany,
      itemname,
      itemcategory,
      itemsubcategory,
      itembrand,
      itemvariant,
      itembarcode,
      qbought,
      itemtotalbp,
    });

    res
      .status(201)
      .json({ success: true, data: "Product Added To Invoice Successfully" });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
// add-products controller 👆☝

// get-unfinished-invoice controller 👇👇

exports.getunconfirmedinvoices = async (req, res, next) => {
  try {
    const allunconfirmedinvoices = await Invoice.find({ invoicestatus: false });
    res.status(200).json({
      success: true,
      data: allunconfirmedinvoices,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      data: error,
    });
    next(error);
  }
};

// get-unfinished-invoice controller 👆☝

// set-unconfirmed-invoice to true controller (also add products from invoice to product doc) 👇👇

exports.verifyinvoice = async (req, res, next) => {
  const {
    currentInvoiceNumber,
    currentInvoiceCompany,
    invoiceTotal,
    noIncompleteInvoices,
    invoiceTotalDiscount,
  } = req.body;
  try {
    await Invoice.updateMany(
      { invoicenumber: currentInvoiceNumber },
      { $set: { invoicestatus: true } }
    );

    res.status(200).json({
      success: true,
      data: "Invoice Confirmation Success",
    });

    const currentInvoiceItems = await Invoice.find({
      invoicenumber: currentInvoiceNumber,
    });

    // Creating Invoice Snapshot From Invoice Items
    try {
      await Invoicereport.create({
        invoicenumber: currentInvoiceNumber,
        invoicecompany: currentInvoiceCompany,
        noitems: noIncompleteInvoices,
        totaldiscount: invoiceTotalDiscount,
        total: invoiceTotal,
      });

      currentInvoiceItems.forEach(async (element) => {
        await Invoicereport.findOneAndUpdate(
          { invoicenumber: currentInvoiceNumber },
          {
            $push: {
              items: {
                invoicenumber: element.invoicenumber,
                invoicecompany: element.invoicecompany,
                itemname: element.itemname,
                itemcategory: element.itemcategory,
                itemsubcategory: element.itemsubcategory,
                itembrand: element.itembrand,
                itemvariant: element.itemvariant,
                itembarcode: element.itembarcode,
                qbought: element.qbought,
                singleitembp: element.singleitembp,
                singleitemsp: element.singleitemsp,
                itemalloweddiscount: element.qbought,
              },
            },
          }
        );
      });
    } catch (errInvoiceSnap) {
      console.log(errInvoiceSnap.message);
    }
    // Creating Products From Invoice Items

    try {
      currentInvoiceItems.forEach(async (element) => {
        await Product.create({
          invoicenumber: element.invoicenumber,
          invoicecompany: element.invoicecompany,
          itemname: element.itemname,
          itemcategory: element.itemcategory,
          itemsubcategory: element.itemsubcategory,
          itembrand: element.itembrand,
          itemvariant: element.itemvariant,
          itembarcode: element.itembarcode,
          qbought: element.qbought,
          singleitembp: element.singleitembp,
          singleitemsp: element.singleitemsp,
          itemalloweddiscount: element.qbought,
        });
      });

      console.log(currentInvoiceItems);
    } catch (errInvoiceSnapForeach) {
      console.log(errInvoiceSnapForeach.message);
    }
  } catch (error) {
    console.log(error);
    res.status(404).json({
      success: false,
      data: error,
    });
    next(error);
  }
};

// set-unconfirmed-invoice to true controller (also add products from invoice to product doc) 👆☝

// Complete Sale for a ticket(Also subtract quantyty sold, items from cart, and save  a sale snapshot) 👇👇

exports.completesale = async (req, res, next) => {
  const { cartTotal, noCartProducts, ticketDiscount } = req.body;
  const currTicketItems = await Orders.find({ status: true });
  const initialTicketNumber = await Tn.find({});

  let token = req.headers.authorization.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  //////////////////////////////////

  // Get Ticket and send it
  const sendTicket = async () => {
    console.log("Sending Ticket");
    const currTn = await Tn.findOne({});
    try {
      const createdTicket = await Ticket.findOne({ ticketnumber: currTn.tn });
      console.log(`created ticket = ${createdTicket}`);

      res.status(200).json({
        success: true,
        data: "Ticket Charge Success",
        ticket: createdTicket,
      });
      console.log("Done sending Ticket");
    } catch (errorSendingTicketBack) {
      console.log(errorSendingTicketBack);
    }
  };

  // set ticket to false
  const signOutTicket = async () => {
    console.log("Signing Ticket");
    await Ticket.findOneAndUpdate(
      { status: true },
      { status: false, billedby: decoded.id }
    );
    console.log("Done signing Ticket");
    console.log("Calling funct to send ticket");
    sendTicket();
  };

  // Clear Cart
  const clearCart = async () => {
    console.log("Start clear cart");

    let token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    try {
      currTicketItems.forEach(async (element) => {
        await Orders.findOneAndUpdate(
          { status: true },
          { status: false, removedby: decoded.id }
        );
      });
      console.log("End clear cart");
      console.log("Call sign ticket");
      signOutTicket();
    } catch (errorClearCart) {
      next(errorClearCart);
    }
  };

  //Update Stock
  const stockUpdate = async () => {
    console.log("Start stock update");
    try {
      currTicketItems.forEach(async (element) => {
        await Product.findOneAndUpdate(
          { _id: element.itemid },
          {
            $inc: {
              qbought: -1,
            },
          }
        );
      });
      console.log("Done stock updating");
      console.log("Calling funct to clear cart");
      clearCart();
    } catch (errorUpdateStockQuantty) {
      console.log(errorUpdateStockQuantty.message);
    }
  };

  // Push Current Ticket Items To The Ticket Snapshot created
  const pushToTicketSnap = async () => {
    console.log("Start pushing to Ticket");
    try {
      currTicketItems.forEach(async (element) => {
        await Ticket.findOneAndUpdate(
          { status: true },
          {
            $push: {
              items: {
                invoicenumber: element.invoicenumber,
                invoicecompany: element.invoicecompany,
                itemname: element.itemname,
                itemcategory: element.itemcategory,
                itemsubcategory: element.itemsubcategory,
                itembrand: element.itembrand,
                itemvariant: element.itemvariant,
                itembarcode: element.itembarcode,
                qbought: element.qbought,
                singleitembp: element.singleitembp,
                singleitemsp: element.sp,
                itemalloweddiscount: element.qbought,
              },
            },
          }
        );
      });

      console.log("Done pushing to ticket");
      console.log("Calling funct to update stock");
      stockUpdate();
    } catch (errorAddingTicketItems) {
      console.log(errorAddingTicketItems);
    }
  };

  // Create the ticket
  const createTicket = async () => {
    try {
      console.log("Start Ticket create");
      const currTn = await Tn.findOne({});
      console.log(currTn.tn);
      await Ticket.create({
        ticketnumber: currTn.tn,
        noitems: noCartProducts,
        totaldiscount: ticketDiscount,
        total: cartTotal - ticketDiscount,
        createdby: decoded.id,
      });
      console.log("Done Ticket create");
      console.log("Calling funct to push items to ticket");
      pushToTicketSnap();
    } catch (errorCreateTicket) {
      res.status(404).json({
        success: false,
        data: errorCreateTicket,
      });
      console.log(errorCreateTicket.message);
    }
  };

  //////////////////////////////////

  // Creating or update TN
  try {
    const digityear = new Date().getFullYear();
    const digitmonth = new Date().getMonth() + 1;
    const digitday = new Date().getDate();
    const tnDefault =
      digityear * 100000000 + digitmonth * 1000000 + digitday * 10000;

    if (initialTicketNumber.length <= 0) {
      //Create the ticket number
      try {
        await Tn.create({
          tn: tnDefault,
        });
      } catch (errorCreateTn) {
        console.log(errorCreateTn);
      }
    } else {
      //Update TN By Inc it by 1
      try {
        await Tn.findOneAndUpdate(
          {},
          {
            $inc: {
              tn: 1,
            },
          }
        );
      } catch (errorUpdateTn) {
        console.log(errorUpdateTn);
      }
    }
    console.log(initialTicketNumber.length);
    console.log("TN complete");
    createTicket();
  } catch (errorCorUTicket) {
    console.log(errorCorUTicket);
  }
};

// Complete Sale for a ticket(Also subtract quantyty sold, items from cart, and save  a sale snapshot) 👆☝

// Get Send Req Tickets 👇👇

exports.sendRequestedTicket = async (req, res, next) => {
  const { ticketnumber } = req.body;
  console.log("Sending Ticket");

  try {
    const requestedTicket = await Ticket.findOne({
      ticketnumber: ticketnumber,
    });
    console.log(`Sent ticket = ${requestedTicket}`);

    res.status(200).json({
      success: true,
      data: "Ticket Request Success",
      ticket: requestedTicket,
    });

    console.log("Done sending Ticket");
  } catch (errorSendingTicketBack) {
    console.log(errorSendingTicketBack);
  }
};

// Get Send Req Tickets 👆☝

// Get Send Req Invoices Report 👇👇

exports.sendRequestedInvoicereport = async (req, res, next) => {
  const { invoicenumber } = req.body;
  console.log("Sending Invoice");

  try {
    const requestedInvoice = await Invoicereport.findOne({
      invoicenumber: invoicenumber,
    });
    console.log(`Sent Invoice = ${requestedInvoice}`);

    res.status(200).json({
      success: true,
      data: "Invoice Request Success",
      ticket: requestedInvoice,
    });

    console.log("Done sending Ticket");
  } catch (errorSendingTicketBack) {
    console.log(errorSendingTicketBack);
  }
};

// Get Send Req Invoices Report 👆☝

// Get All Tickets 👇👇

exports.getalltickets = async (req, res, next) => {
  try {
    const allTickets = await Ticket.find({});
    res.status(200).json({
      success: true,
      data: allTickets,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      data: error,
    });
    next(error);
  }
};

// Get All Tickets 👆☝

// delete-invoice-items controller 👇👇

exports.deleteinvoiceitem = async (req, res, next) => {
  const { itemid } = req.body;
  try {
    await Invoice.deleteOne({ _id: itemid });

    res.status(200).json({
      success: true,
      data: "Invoice Item Deleted",
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({
      success: false,
      data: error,
    });
    next(error);
  }
};

// delete-invoice-items controller 👆☝

// Get Invoice Reports and send 👇👇

exports.getInvoiceReports = async (req, res, next) => {
  console.log("Sending Invoice");

  try {
    const invoiceReports = await Invoicereport.find({});

    res.status(200).json({ success: true, data: invoiceReports });
    console.log("Done sending Invoice");
  } catch (errorSendingInvoiceReports) {
    console.log(errorSendingInvoiceReports);
    next(errorSendingInvoiceReports);
  }
};

// Get Invoice Reports and send 👆☝

// Get Tickets and send 👇👇

exports.getTickets = async (req, res, next) => {
  console.log("Sending Ticket");

  try {
    const tickets = await Ticket.find({});

    res.status(200).json({ success: true, data: tickets });
    console.log("Done sending Ticket");
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// Get Tickets and send 👆☝

// Get 5 Latest Tickets and send 👇👇

exports.getFiveLatestTickets = async (req, res, next) => {
  console.log("Sending Tickets");

  try {
    const tickets = await Ticket.find({}).sort({ _id: -1 }).limit(5);

    res.status(200).json({ success: true, data: tickets });
    console.log("Done sending Ticket");
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// Get 5 Latest Invoice and send 👆☝

// Get 5 Latest Tickets and send 👇👇

exports.getFiveLatestInvoices = async (req, res, next) => {
  console.log("Sending Invoices");

  try {
    const invoices = await Invoicereport.find({}).sort({ _id: -1 }).limit(5);

    res.status(200).json({ success: true, data: invoices });
    console.log("Done sending Invoices");
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// Get 5 Latest Invoice and send 👆☝

// add-product controller 👇👇

exports.addbusiness = async (req, res, next) => {
  const { token, category, subcategory, name, password } = req.body;

  var business = {
    category,
    subcategory,
    name,
    password,
  };

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  try {
    await User.findOneAndUpdate(
      { _id: decoded.id },
      { $push: { businesses: business } }
    );

    res
      .status(201)
      .json({ success: true, data: "Business Created Successfully" });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

exports.addProduct = async (req, res, next) => {
  const {
    brandname,
    brandtype,
    brandtypepricertl,
    brandtypepricews,
    brandcolor,
  } = req.body;

  try {
    await Product.create({
      brandname,
      brandtype,
      brandtypepricertl,
      brandtypepricews,
      brandcolor,
    });

    res.status(201).json({ success: true, data: "Product Added Successfully" });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

exports.addStock = async (req, res, next) => {
  const {
    brandnametypeid,
    brandname,
    brandtype,
    openingstock,
    addedstock,
    closingstock,
    soldstock,
    ws,
    rtl,
    wssales,
    rtlsales,
    profit,
  } = req.body;
  console.log(
    `${brandnametypeid},${openingstock},${addedstock},${closingstock},${soldstock},${ws},${rtl},${wssales},${rtlsales}`
  );

  try {
    await Stock.create({
      brandnametypeid,
      brandname,
      brandtype,
      openingstock,
      addedstock,
      closingstock,
      soldstock,
      ws,
      rtl,
      wssales,
      rtlsales,
      profit,
    });

    res.status(201).json({ success: true, data: "Stock Added Successfully" });
  } catch (error) {
    next(error);
    console.log(error);
  }
};

// add-product controller 👆☝

// get all products controller 👇👇

exports.getStocks = async (req, res, next) => {
  try {
    const allstocks = await Stock.find({});
    res.status(200).json({
      success: true,
      data: allstocks,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      data: error,
    });
    next(error);
  }
};

exports.getuserbusinesses = async (req, res, next) => {
  let token = req.headers.authorization.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  try {
    const alluserbusinesses = await User.findById(decoded.id);
    res.status(200).json({
      success: true,
      data: alluserbusinesses.businesses,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      data: error,
    });
    next(error);
  }
};

// get all products controller 👇👇

exports.getProducts = async (req, res, next) => {
  try {
    const allproducts = await Product.find({});
    res.status(200).json({
      success: true,
      data: allproducts,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      data: error,
    });
    next(error);
  }
};

// get all products controller 👆☝

// add item to cart controller 👇👇

exports.addToCart = async (req, res, next) => {
  const { itemid } = req.body;

  let token = req.headers.authorization.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  try {
    const item = await Product.find({ _id: itemid });
    try {
      item.forEach(async (e) => {
        await Orders.create({
          itemid: e._id,
          invoicenumber: e.invoicenumber,
          itemname: e.itemname,
          itemcategory: e.itemcategory,
          itemsubcategory: e.itemsubcategory,
          itembrand: e.itembrand,
          itemvariant: e.itemvariant,
          itembarcode: e.itembarcode,
          sp: e.singleitemsp,
          itemalloweddiscount: e.itemalloweddiscount,
          addedby: decoded.id,
        });
      });
    } catch (err) {
      console.log(err);
    }
    res.status(200).json({
      success: true,
      data: item,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      data: error,
    });
    next(error);
  }
};

// add item to cart controller 👆☝

// get all cart_products controller 👇👇

exports.getCartProducts = async (req, res, next) => {
  // Status = True = Current Item
  try {
    const allproducts = await Orders.find({ status: true });
    res.status(200).json({
      success: true,
      data: allproducts,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      data: error,
    });
    next(error);
  }
};

// get all cart_products controller 👆☝

// remove one item from cart controller 👇👇

exports.removeFromCart = async (req, res, next) => {
  const { itemid } = req.body;

  let token = req.headers.authorization.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  try {
    try {
      await Orders.updateOne(
        { itemid: itemid, status: true },
        { status: false, deleted: true, removedby: decoded.id }
      );
    } catch (err) {
      console.log(err);
    }
    res.status(200).json({
      success: true,
      data: "Item Removed",
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      data: error,
    });
    next(error);
  }
};

// remove one item from cart controller 👆☝

// remove item group from cart controller 👇👇

exports.removeGroupFromCart = async (req, res, next) => {
  const { itemid } = req.body;

  let token = req.headers.authorization.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  try {
    try {
      await Orders.updateMany(
        { itemid: itemid, status: true },
        { status: false, deleted: true, removedby: decoded.id }
      );
    } catch (err) {
      console.log(err);
    }
    res.status(200).json({
      success: true,
      data: "Item Removed",
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      data: error,
    });
    next(error);
  }
};

// remove item group from cart controller 👆☝

// Clear Cart (Remove All Active Items) 👇👇

exports.removeAllActiveGroupFromCart = async (req, res, next) => {
  let token = req.headers.authorization.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  try {
    try {
      await Orders.updateMany(
        { status: true },
        { status: false, deleted: true, removedby: decoded.id }
      );
    } catch (err) {
      console.log(err);
    }
    res.status(200).json({
      success: true,
      data: "Item Removed",
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      data: error,
    });
    next(error);
  }
};

// Clear Cart (Remove All Active Items) 👆☝

// get onee product with id
exports.getProduct = async (req, res, next) => {
  const id = req.params.id;
  const specificproduct = await Product.findById(id);
  res.status(200).json({
    success: true,
    data: specificproduct,
  });
};
// get onee product with id

// get all products controller 👇👇
exports.getSumProfitPerProduct = async (req, res, next) => {
  try {
    allmatch = await Stock.aggregate([
      { $match: { brandname: "Safari" } },
    ]).allowDiskUse(true);
    res.status(200).json({
      success: true,
      data: allmatch,
    });
    console.log(allmatch);
  } catch (error) {
    res.status(404).json({
      success: false,
      data: error,
    });
    console.log(error);
    next(error);
  }
};

// get all products controller 👆☝

// get all products controller 👇👇
exports.stocksProfitwid = async (req, res, next) => {
  try {
    const now = new Date();

    const year = now.getFullYear();
    const month = now.getMonth();
    const date = now.getDate();

    const start = new Date(year, month, 1);
    const end = new Date(year, month, 30);

    const sum = await Stock.aggregate([
      {
        $match: {
          $and: [{ brandtype: "Safari" }],
        },
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: "$profit",
          },
        },
      },
    ]);
    console.log(sum);
    res.status(200).json({
      success: true,
      data: sum,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      data: error,
    });
    console.log(error);
    next(error);
  }
};

// get all products controller 👆☝

// Get Accumulated Invoice Totals 👇👇

exports.invoiceReportsTotals = async (req, res, next) => {
  try {
    const sum = await Invoicereport.aggregate([
      {
        $match: {
          $and: [{}],
        },
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: "$total",
          },
        },
      },
    ]);

    console.log(sum);

    res.status(200).json({
      success: true,
      data: sum,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      data: error,
    });
    console.log(error);
    next(error);
  }
};

// Get Accumulated Invoice Totals👆☝

// Get Accumulated Sales/Tickets Totals 👇👇

exports.ticketTotals = async (req, res, next) => {
  try {
    const sum = await Ticket.aggregate([
      {
        $match: {
          $and: [{}],
        },
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: "$total",
          },
        },
      },
    ]);

    console.log(sum);

    res.status(200).json({
      success: true,
      data: sum,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      data: error,
    });
    console.log(error);
    next(error);
  }
};

// Get Accumulated Sales/Tickets Totals👆☝

// Get Accumulated Sales/Tickets Totals  This Year👇👇

exports.ticketTotalsThisYear = async (req, res, next) => {
  const startingdate = new Date(thisYear, 00, 01, 00, 00, 00, 1);
  const endingdate = new Date(thisYear, 11, 31, 00, 00, 00, 1);

  try {
    const sum = await Ticket.aggregate([
      {
        $match: {
          $and: [
            {
              createdAt: {
                $gte: startingdate,
              },
            },
            {
              createdAt: {
                $lte: endingdate,
              },
            },
          ],
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              date: "$createdAt",
              format: "%Y-%m",
            },
          },
          Count: {
            $sum: "$total",
          },
        },
      },
    ]);
    console.log(sum);

    res.status(200).json({
      success: true,
      data: sum,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      data: error,
    });
    console.log(error);
    next(error);
  }
};

// Get Accumulated Sales/Tickets Totals This Year👆☝

// Get Accumulated Purchases/InvoiceReport Totals  This Year👇👇

exports.invoiceTotalsThisYear = async (req, res, next) => {
  const startingdate = new Date(thisYear, 00, 01, 00, 00, 00, 1);
  const endingdate = new Date(thisYear, 11, 31, 00, 00, 00, 1);

  try {
    const sum = await Invoicereport.aggregate([
      {
        $match: {
          $and: [
            {
              createdAt: {
                $gte: startingdate,
              },
            },
            {
              createdAt: {
                $lte: endingdate,
              },
            },
          ],
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              date: "$createdAt",
              format: "%Y-%m",
            },
          },
          Count: {
            $sum: "$total",
          },
        },
      },
    ]);
    console.log(sum);

    res.status(200).json({
      success: true,
      data: sum,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      data: error,
    });
    console.log(error);
    next(error);
  }
};

// Get Accumulated Purchases/InvoiceReport Totals This Year👆☝

// Get Accumulated {Itemname = like book} Totals  This Year👇👇

exports.likebookbTotalsThisYear = async (req, res, next) => {
  const startingdate = new Date(thisYear, 00, 01, 00, 00, 00, 1);
  const endingdate = new Date(thisYear, 11, 31, 00, 00, 00, 1);
  const { category } = req.body;

  try {
    const sum = await Orders.aggregate([
      {
        $match: {
          $and: [
            {
              createdAt: {
                $gte: startingdate,
              },
            },
            {
              createdAt: {
                $lte: endingdate,
              },
            },
            {
              itemcategory: {
                $regex: category,
                $options: "i",
              },
            },
            {
              status: false,
            },
          ],
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              date: "$createdAt",
              format: "%Y-%m",
            },
          },
          Count: {
            $sum: "$sp",
          },
        },
      },
    ]);
    console.log(sum);

    res.status(200).json({
      success: true,
      data: sum,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      data: error,
    });
    console.log(error);
    next(error);
  }
};

/* likebookbTotalsThisYear = async (req, res, next) => {
  const startingdate = new Date(thisYear, 00, 01, 00, 00, 00, 1);
  const endingdate = new Date(thisYear, 11, 31, 00, 00, 00, 1);
  const nameQuery = "book";

  try {
    const sum = await Orders.aggregate([
      {
        $match: {
          $and: [
            {
              createdAt: {
                $gte: startingdate,
              },
            },
            {
              createdAt: {
                $lte: endingdate,
              },
            },
            {
              itemcategory: {
                $regex: nameQuery,
                $options: "i",
              },
            },
            {
              status: false,
            },
          ],
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              date: "$createdAt",
              format: "%Y-%m",
            },
          },
          Count: {
            $sum: "$sp",
          },
        },
      },
    ]);
    console.log(sum);
  } catch (error) {
    console.log(error);
  }
};

likebookbTotalsThisYear(); */

// Get Accumulated {Itemname = like book} Totals This Year👆☝

exports.coverImageUpload = async (req, res, next) => {
  const uri = process.env.MONGO_URI_NODB_NAME;
  const dbName = "shop_dev";
  const DIR = "./uploads";

  console.log("Image Upload Started");
  try {
    await Errors.create({
      errortype: "need data",
      errormsg: `${req.body}`,
    });
  } catch (error) {
    console.log(error);
  }
  try {
    mongodb.MongoClient.connect(uri, (error, client) => {
      assert.ifError(error);

      const db = client.db(dbName);

      let bucket = new mongodb.GridFSBucket(db);

      //////// FILE FROM FRONTEND SAVE
      try {
        // define storage
        const storage = multer.diskStorage({
          destination: "./public/uploads/",
          filename: function (req, file, cb) {
            cb(null, "IMAGE-" + Date.now() + path.extname(file.originalname));
          },
        });

        // define upload methodF
        const upload = multer({
          storage: storage,
          limits: { fileSize: 1000000 },
        }).single("file");

        // save image
        const router = express.Router();

        console.log(Date.now());

        upload(req, res, (err) => {
          console.log("Request ---", req.body);
          console.log("Request file ---", req.file); //Here you get file.
          /*Now do where ever you want to do*/
        });
        console.log(Date.now());
      } catch (error) {
        console.log(error);
      }
      //////// FILE FROM FRONTEND SAVE

      fs.createReadStream("./meistersinger.mp3")
        .pipe(bucket.openUploadStream("meistersinger.mp3"))
        .on("error", function (error) {
          assert.ifError(error);
        })
        .on("finish", function () {
          console.log("done!");
        });

      bucket
        .openDownloadStreamByName("meistersinger.mp3")
        .pipe(fs.createWriteStream("./output.mp3"))
        .on("error", function (error) {
          assert.ifError(error);
        })
        .on("finish", function () {
          console.log("done!");
        });
    });

    console.log("Image Upload Ended");
    res.status(200).json({
      success: true,
      data: "Image Received",
    });
  } catch (error) {
    console.log(error);
    next(error);
    res.status(404).json({
      success: false,
      data: error,
    });
  }
};
