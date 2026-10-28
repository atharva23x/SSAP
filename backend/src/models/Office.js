const mongoose = require('mongoose');

const officeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['Tehsildar', 'CSC', 'Setu', 'e-Seva', 'Collectorate', 'Municipal'],
      index: true,
    },
    address: String,
    state: { type: String, index: true },
    district: String,
    pincode: String,
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] },
    },
    phone: String,
    timings: String,
    servicesOffered: [{ type: String }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

officeSchema.index({ location: '2dsphere' });
officeSchema.index({ state: 1, district: 1 });

officeSchema.pre('save', function preSave(next) {
  if (this.lat != null && this.lng != null) {
    this.location = { type: 'Point', coordinates: [this.lng, this.lat] };
  }
  next();
});

module.exports = mongoose.model('Office', officeSchema);
