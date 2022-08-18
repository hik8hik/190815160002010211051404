const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Product = require("../models/Product");
const Orders = require("../models/Orders");
const Invoice = require("../models/Invoice");
const Invoicereport = require("../models/Invoicereport");
const Ticket = require("../models/Ticket");
const Tn = require("../models/Tn");
const Stock = require("../models/Stock");

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
  } = req.body;

  // Already subtracted discount in frontend
  let itemtotalbp = singleitembp * qbought;

  try {
    await Invoice.create({
      invoicenumber,
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
  } catch (errorCorUTicket) {
    console.log(errorCorUTicket);
  }

  // Create the ticket
  try {
    const currTn = await Tn.findOne({});
    console.log(currTn.tn);
    await Ticket.create({
      ticketnumber: currTn.tn,
      noitems: noCartProducts,
      totaldiscount: ticketDiscount,
      total: cartTotal,
    });

    //Update Stock
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
    } catch (errorUpdateStockQuantty) {
      console.log(errorUpdateStockQuantty.message);
    }

    // Push Current Ticket Items To The Ticket Snapshot created
    try {
      currTicketItems.forEach(async (element) => {
        await Ticket.findOneAndUpdate(
          { status: true },
          {
            $push: {
              items: {
                invoicenumber: element.invoicenumber,
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

      // set ticket to false
      await Ticket.findOneAndUpdate({ status: true }, { status: false });
    } catch (errorAddingTicketItems) {
      console.log(errorAddingTicketItems);
    }

    // Clear Cart
    try {
      currTicketItems.forEach(async (element) => {
        await Orders.findOneAndUpdate({ status: true }, { status: false });
      });
    } catch (errorClearCart) {
      next(errorClearCart);
    }

    // Get Ticket and send it
    const createdTicket = await Ticket.findOne({ ticketnumber: currTn.tn });
    console.log(`created ticket = ${createdTicket}`);

    res.status(200).json({
      success: true,
      data: "Ticket Charge Success",
      ticket: createdTicket,
    });
  } catch (errorCreateTicket) {
    res.status(404).json({
      success: false,
      data: errorCreateTicket,
    });
    console.log(errorCreateTicket.message);
  }
};

// Complete Sale for a ticket(Also subtract quantyty sold, items from cart, and save  a sale snapshot) 👆☝

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
  try {
    try {
      await Orders.deleteOne({ itemid: itemid });
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
  try {
    try {
      await Orders.deleteMany({ itemid: itemid });
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

// get all products controller 👇👇
exports.stocksProfit = async (req, res, next) => {
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
          $and: [{}],
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
