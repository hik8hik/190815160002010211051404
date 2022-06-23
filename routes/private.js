const express = require("express");
const router = express.Router();

const {
  getPrivateData,
  addInvoice,
  addbusiness,
  getunconfirmedinvoices,
  getuserbusinesses,
  addProduct,
  getStocks,
  getProducts,
  getProduct,
  addStock,
  getSumProfitPerProduct,
  stocksProfit,
} = require("../controllers/private");
const { protect } = require("../middleware/auth");

router.route("/").get(protect, getPrivateData);
router.route("/createinvoice").post(protect, addInvoice);
router.route("/createbusiness").post(protect, addbusiness);
router.route("/getincompleteinvoices").get(protect, getunconfirmedinvoices);
router.route("/getuserbusinesses").get(protect, getuserbusinesses);
router.route("/addproduct").post(protect, addProduct);
router.route("/addstock").post(protect, addStock);
router.route("/getallstocks").get(protect, getStocks);
router.route("/getallproducts").get(protect, getProducts);
router.route("/getproductwid/:id").get(protect, getProduct);
router.route("/gbbtprofit").get(protect, getSumProfitPerProduct);
router.route("/stocksprofit").get(protect, stocksProfit);

module.exports = router;
