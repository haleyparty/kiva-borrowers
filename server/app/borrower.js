var mongoose = require('mongoose');
var bluebird = require('bluebird');

var borrowerSchema = mongoose.Schema({
  name: String,
  status: String,
  activity: String,
  sector: String,
  country: String,
  loan_amount: Number
});
