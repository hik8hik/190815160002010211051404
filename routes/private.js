const express = require("express");
const router = express.Router();

const {
  getPrivateData,
  addInvoice,
  verifyinvoice,
  deleteinvoiceitem,
  getunconfirmedinvoices,
  addbusiness,
  getuserbusinesses,
  addproduct,
  getStocks,
  getProducts,
  addToCart,
  completesale,
  getalltickets,
  sendRequestedTicket,
  sendRequestedInvoicereport,
  getInvoiceReports,
  getTickets,
  getFiveLatestTickets,
  getFiveLatestInvoices,
  removeFromCart,
  removeGroupFromCart,
  removeAllActiveGroupFromCart,
  getCartProducts,
  getProduct,
  addStock,
  getSumProfitPerProduct,
  invoiceReportsTotals,
  ticketTotals,
  ticketTotalsThisYear,
  invoiceTotalsThisYear,
  likebookbTotalsThisYear,
  coverImageUpload,
} = require("../controllers/private");
const { protect } = require("../middleware/auth");

router.route("/").get(protect, getPrivateData);
router.route("/createinvoice").post(protect, addInvoice);
router.route("/createbusiness").post(protect, addbusiness);
router.route("/confirminvoice").post(protect, verifyinvoice);
router.route("/deleteinvoiceitem").post(protect, deleteinvoiceitem);
router.route("/getincompleteinvoices").get(protect, getunconfirmedinvoices);
router.route("/getuserbusinesses").get(protect, getuserbusinesses);
router.route("/addproduct").post(protect, addproduct);
router.route("/addstock").post(protect, addStock);
router.route("/getallstocks").get(protect, getStocks);
router.route("/getallproducts").get(protect, getProducts);
router.route("/additemtocart").post(protect, addToCart);
router.route("/chargecart").post(protect, completesale);
router.route("/allsales").post(protect, getalltickets);
router.route("/getticketticketnumber").post(protect, sendRequestedTicket);
router
  .route("/getinvoiceinvoicenumber")
  .post(protect, sendRequestedInvoicereport);
router.route("/getinvoicereports").get(protect, getInvoiceReports);
router.route("/gettickets").get(protect, getTickets);
router.route("/getfivelatesttickets").get(protect, getFiveLatestTickets);
router.route("/getfivelatestinvoices").get(protect, getFiveLatestInvoices);
router.route("/removeonefromcart").post(protect, removeFromCart);
router.route("/removegroupfromcart").post(protect, removeGroupFromCart);
router
  .route("/removeallactivegroupfromcart")
  .post(protect, removeAllActiveGroupFromCart);
router.route("/getorders").get(protect, getCartProducts);
router.route("/getproductwid/:id").get(protect, getProduct);
router.route("/gbbtprofit").get(protect, getSumProfitPerProduct);
router.route("/getaccumulatedinvoicetotals").get(protect, invoiceReportsTotals);
router.route("/getaccumulatedtickettotals").get(protect, ticketTotals);
router
  .route("/getaccumulatedtickettotalsthisyear")
  .get(protect, ticketTotalsThisYear);
router
  .route("/getaccumulatedinvoicetotalsthisyear")
  .get(protect, invoiceTotalsThisYear);
router
  .route("/getaccumulatedlikebooktotalsthisyear")
  .post(protect, likebookbTotalsThisYear);
router.route("/uploaditemcoverimage").post(protect, coverImageUpload);

module.exports = router;
