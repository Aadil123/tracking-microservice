const mongoose = require('mongoose');

const trackingSchema = new mongoose.Schema({
  orderId: { type: String, required: true },
  status: { type: String, required: true },
  location: { type: String, required: true },
  lastUpdated: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Tracking', trackingSchema);