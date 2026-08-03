// Yong Xian
const mongoose = require('mongoose');

// Represents a low-income family location that volunteers deliver to.
// Only the street address is shown publicly, for privacy.
const familyLocationSchema = new mongoose.Schema({
  address: { type: String, required: true },
  area: { type: String, required: true } // e.g. "Ang Mo Kio", "Toa Payoh"
});

module.exports = mongoose.model('FamilyLocation', familyLocationSchema, 'familyLocations');
