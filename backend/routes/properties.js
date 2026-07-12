const express = require('express');
const provider = require('../providers');

const router = express.Router();
const DEFAULT_LIMIT = 12;

function createPagination(page, limit, totalItems) {
  return {
    page: Number(page) || 1,
    limit: Number(limit) || DEFAULT_LIMIT,
    totalItems,
    totalPages: Math.max(1, Math.ceil(totalItems / (Number(limit) || DEFAULT_LIMIT)))
  };
}

// GET /api/properties?featured=true&...filters
router.get('/properties', async (req, res) => {
  try {
    const { featured, page, limit, propertyType, location, minPrice, maxPrice, bedrooms, bathrooms, sort } = req.query;
    const filters = { featured, page, limit, propertyType, location, minPrice, maxPrice, bedrooms, bathrooms, sort };
    const result = await provider.listProperties(filters);
    const properties = Array.isArray(result?.properties) ? result.properties : [];
    const pagination = result?.pagination || createPagination(page, limit, properties.length);

    return res.json({ success: true, message: 'Properties loaded', data: { properties, pagination } });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Unable to load properties',
      data: { properties: [], pagination: createPagination(1, DEFAULT_LIMIT, 0) }
    });
  }
});

// GET /api/properties/related?type=...&limit=4
router.get('/properties/related', async (req, res) => {
  try {
    const type = req.query.type || '';
    const limit = Number(req.query.limit) || 4;
    const properties = await provider.getRelated(type, limit);
    return res.json({ success: true, message: 'Related properties loaded', data: { properties } });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Unable to load related properties', data: { properties: [] } });
  }
});

// GET /api/properties/:id
router.get('/properties/:id', async (req, res) => {
  try {
    const property = await provider.getPropertyById(req.params.id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found', data: { property: null } });
    }
    return res.json({ success: true, message: 'Property details loaded', data: { property } });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Unable to load property details', data: { property: null } });
  }
});

router.get('/moving/services', async (req, res) => {
  return res.json({ success: true, message: 'Moving services loaded', data: { services: [] } });
});

router.get('/test', async (req, res) => {
  try {
    const row = await provider.getRawTableRow();
    if (!row) {
      return res.status(404).json({ success: false, message: 'No rows returned from Property_ListingsTable' });
    }
    return res.json({ success: true, message: 'Raw table row loaded', data: row });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Unable to load test row' });
  }
});

module.exports = router;
