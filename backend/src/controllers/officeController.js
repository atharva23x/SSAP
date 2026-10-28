const Office = require('../models/Office');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/offices/nearby?lat=&lng=&radius=10&service=
const nearby = asyncHandler(async (req, res) => {
  const lat = parseFloat(req.query.lat);
  const lng = parseFloat(req.query.lng);
  const radiusKm = Math.min(100, parseFloat(req.query.radius || '10'));
  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return res.json({ success: false, error: { message: 'LAT_LNG_REQUIRED' } });
  }
  const filter = {
    isActive: true,
    location: {
      $near: {
        $geometry: { type: 'Point', coordinates: [lng, lat] },
        $maxDistance: radiusKm * 1000,
      },
    },
  };
  if (req.query.service) filter.servicesOffered = req.query.service;
  const items = await Office.find(filter).limit(50).lean();
  res.json({ success: true, data: items, meta: { radiusKm } });
});

// GET /api/offices?state=&district=&service=&type=
const listOffices = asyncHandler(async (req, res) => {
  const { state, district, service, type } = req.query;
  const filter = { isActive: true };
  if (state) filter.state = state;
  if (district) filter.district = district;
  if (service) filter.servicesOffered = service;
  if (type) filter.type = type;
  const items = await Office.find(filter).limit(300).lean();
  res.json({ success: true, data: items, meta: { total: items.length } });
});

module.exports = { nearby, listOffices };
