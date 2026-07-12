const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const TABLE_ID = process.env.BOTPRESS_TABLE_ID || '';
const TABLE_ROWS_URL = TABLE_ID
  ? `https://api.botpress.cloud/v1/tables/${TABLE_ID}/rows/find`
  : '';
const API_TOKEN = process.env.BOTPRESS_API_TOKEN || '';
const BOT_ID = process.env.BOTPRESS_BOT_ID || '';
const DEFAULT_IMAGE = '';
const HOUSE_IMAGE_DIR = path.resolve(__dirname, '..', '..', 'images', 'houses');
const MOVING_IMAGE_DIR = path.resolve(__dirname, '..', '..', 'images', 'moving');

const HOUSE_IMAGE_MAP = {
  wallichresidence: 'wallich_residence.jpg',
  wattenhouse: 'watten_house.jpg',
  pinnacleduxton: 'The_Pinnacle@Duxton.jpg',
  thereserveresidences: 'the_reserve_residences.jpg',
  granddunman: 'the_granddunman.jpg',
  lentoria: 'lentoria_condo.jpg',
  hillockgreen: 'Hillock_Green.jpg',
  sengkanggrandresidences: 'sengkang_grandresidences.jpg',
  pasirris8: 'Pasir_Ris_8.jpg',
  thewoodleighresidences: 'the_woodleigh_residences.jpg',
  onebernam: 'one_bernam.jpg',
  tembusugrand: 'tembusu_grand.jpg',
  thecontinuum: 'the_continuum.jpg',
  amoresidence: 'amo_residence.jpg',
  lentormodern: 'lentor_modern.jpg',
  scenecaresidence: 'sceneca_residence.jpg',
  midtownmodern: 'midtown_modern.jpg',
  thebotanyatdairyfarm: 'the_botany_at_dairy_farm.jpg',
  skywatersresidences: 'skywaters_residences.jpg',
  kovanjewel: 'kovan_jewel.jpg',
  dawsonskyterrace: 'skyterrace@dawson.jpg',
  ghimmohascent: 'ghim_moh_ascent.jpg',
  skyoasisdawson: 'skyoasis_dawson.jpg',
  thewoodleighhdb: 'woodleigh_HDB.jpg',
  mcnairtowers: 'mcnair_towers.jpg',
  tampinesgreenridges: 'Tampines_GreenRidges.jpg',
  woodlandsglen: 'woodlands_glen.jpg',
  punggolbayview: 'punggol_bayview.jpg',
  sembawanghillsestate: 'sembawang_hills.jpg',
  belgraviaace: 'belgravia_ace.jpg'
};

const MOVING_IMAGE_MAP = {
  fullmoveassistance: 'fullmove.jpg',
  packingunpacking: 'packing&unpacking.jpg'
};

function normalizeName(value) {
  return String(value ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');
}

function resolveLocalImagePath(imageMap, folder, propertyName) {
  const normalizedName = normalizeName(propertyName);
  const fileName = imageMap[normalizedName];
  if (!fileName) {
    return '';
  }

  const fullPath = path.join(folder, fileName);
  if (!fs.existsSync(fullPath)) {
    return '';
  }

  const workspaceRoot = path.resolve(__dirname, '..', '..');
  const relativePath = path.relative(workspaceRoot, fullPath).replace(/\\/g, '/');
  return relativePath ? relativePath : '';
}

if (!TABLE_ID) {
  // eslint-disable-next-line no-console
  console.error('BOTPRESS_TABLE_ID is not set. Set it to the Botpress Cloud table ID.');
}

function getRowValue(row, ...keys) {
  for (const key of keys) {
    const value = row?.[key];
    if (value !== undefined && value !== null && value !== '') {
      return value;
    }
  }
  return '';
}

function parseNumber(value) {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const cleaned = value.replace(/[^0-9.-]/g, '');
    if (!cleaned) {
      return null;
    }

    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function parsePrice(value) {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const cleaned = value
      .replace(/SGD/gi, '')
      .replace(/,/g, '')
      .replace(/\s/g, '')
      .trim();

    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function normalizePropertyType(value) {
  const text = String(value ?? '').trim();
  if (!text) {
    return '';
  }

  return text.replace(/\s*\([^)]*\)\s*$/, '').trim() || text;
}

function normalizeStringList(value) {
  if (Array.isArray(value)) {
    return value.filter((item) => typeof item === 'string' && item.trim()).map((item) => item.trim());
  }

  if (typeof value === 'string') {
    return value
      .split(/[;,]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function normalizeImages(row, propertyName = '') {
  const imageValue = getRowValue(row, 'images', 'image', 'photos', 'photo', 'Image', 'Images');
  if (Array.isArray(imageValue)) {
    return imageValue.filter((item) => typeof item === 'string' && item.trim()).map((item) => item.trim());
  }

  if (typeof imageValue === 'string' && imageValue.trim()) {
    return [imageValue.trim()];
  }

  const localImagePath = resolveLocalImagePath(HOUSE_IMAGE_MAP, HOUSE_IMAGE_DIR, propertyName);
  return localImagePath ? [localImagePath] : (DEFAULT_IMAGE ? [DEFAULT_IMAGE] : []);
}

function buildDescription(row) {
  const description = getRowValue(row, 'description', 'summary', 'Description', 'Summary');
  if (description) {
    return String(description);
  }

  const details = [
    getRowValue(row, 'Facilities', 'facilities'),
    getRowValue(row, 'Special Features', 'specialFeatures', 'special_features')
  ].filter(Boolean);

  return details.join(' • ');
}

async function fetchTableResponse(body = {}) {
  if (!TABLE_ID) {
    throw new Error('BOTPRESS_TABLE_ID is not configured');
  }

  const headers = {
    'Content-Type': 'application/json'
  };

  if (API_TOKEN) {
    headers.Authorization = `Bearer ${API_TOKEN}`;
  }
  if (BOT_ID) {
    headers['x-bot-id'] = BOT_ID;
  }

  const res = await fetch(TABLE_ROWS_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Botpress table fetch failed: ${res.status} ${res.statusText} - ${text}`);
  }

  const data = await res.json();
  return data;
}

async function fetchTableRows() {
  const data = await fetchTableResponse();

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data.rows)) {
    return data.rows;
  }

  if (Array.isArray(data.data?.rows)) {
    return data.data.rows;
  }

  throw new Error('Unexpected Botpress table response format. Expected an array or { rows: [...] }');
}

async function getRawTableRow() {
  const data = await fetchTableResponse();
  if (Array.isArray(data) && data.length) {
    return data[0];
  }
  if (Array.isArray(data.rows) && data.rows.length) {
    return data.rows[0];
  }
  if (Array.isArray(data.data?.rows) && data.data.rows.length) {
    return data.data.rows[0];
  }
  return null;
}

function mapRowToProperty(row) {
  const title = String(getRowValue(row, 'Name', 'name', 'title', 'Property Name') || '').trim();
  const propertyType = normalizePropertyType(getRowValue(row, 'Type', 'propertyType', 'type'));
  const location = String(getRowValue(row, 'Location', 'location', 'district') || '').trim();

  return {
    id: String(getRowValue(row, 'id', '_id', 'rowId', 'row_id') || ''),
    title: title || location || 'Untitled property',
    location,
    price: parsePrice(getRowValue(row, 'Price', 'price', 'priceValue')),
    propertyType,
    bedrooms: parseNumber(getRowValue(row, 'Bedrooms', 'bedrooms')),
    bathrooms: parseNumber(getRowValue(row, 'Bathrooms', 'bathrooms')),
    floorArea: parseNumber(getRowValue(row, 'FloorAreaSqft', 'floorArea', 'Floor Area')),
    images: normalizeImages(row, title),
    description: buildDescription(row),
    amenities: normalizeStringList(getRowValue(row, 'Amenities', 'amenities', 'Facilities')),
    schools: normalizeStringList(getRowValue(row, 'NearbySchools', 'schools', 'Schools')),
    mrt: normalizeStringList(getRowValue(row, 'NearestMRT', 'mrt', 'Nearby MRT', 'Nearby MRT Station')),
    nearestMrt: String(getRowValue(row, 'NearestMRT', 'mrt', 'Nearby MRT', 'Nearby MRT Station') || '').trim(),
    tenure: String(getRowValue(row, 'Tenure', 'tenure') || '').trim(),
    yearBuilt: parseNumber(getRowValue(row, 'YearBuilt', 'yearBuilt')),
    maintenanceFee: parsePrice(getRowValue(row, 'MaintenanceFee', 'maintenanceFee')),
    environment: String(getRowValue(row, 'Environment', 'environment') || '').trim(),
    featured: Boolean(getRowValue(row, 'featured', 'Featured', 'isFeatured')),
    postedDate: getRowValue(row, 'postedDate', 'createdAt', 'created_at') || null
  };
}

async function listProperties(filters = {}) {
  const rows = await fetchTableRows();
  let items = rows.map(mapRowToProperty);

  if (filters.featured === 'true' || filters.featured === true) {
    const featuredItems = items.filter((property) => property.featured);
    items = featuredItems.length ? featuredItems : items.slice(0, 6);
  }

  if (filters.propertyType) {
    items = items.filter((property) => property.propertyType === filters.propertyType);
  }

  if (filters.location) {
    const query = String(filters.location).trim().toLowerCase();
    items = items.filter((property) => String(property.location || '').toLowerCase().includes(query));
  }

  if (filters.minPrice) {
    const minPrice = Number(filters.minPrice);
    items = items.filter((property) => Number(property.price || 0) >= minPrice);
  }

  if (filters.maxPrice) {
    const maxPrice = Number(filters.maxPrice);
    items = items.filter((property) => Number(property.price || 0) <= maxPrice);
  }

  const page = Number(filters.page) || 1;
  const limit = Number(filters.limit) || 12;
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));
  const start = (page - 1) * limit;
  const paged = items.slice(start, start + limit);

  return {
    properties: paged,
    pagination: { page, limit, totalItems, totalPages }
  };
}

async function getPropertyById(id) {
  const rows = await fetchTableRows();
  const match = rows.find((row) => String(getRowValue(row, 'id', '_id', 'rowId', 'row_id')) === String(id));
  return match ? mapRowToProperty(match) : null;
}

async function getRelated(type = '', limit = 4) {
  const rows = await fetchTableRows();
  let items = rows.map(mapRowToProperty);
  if (type) {
    items = items.filter((property) => property.propertyType === type);
  }
  return items.slice(0, limit);
}

module.exports = {
  listProperties,
  getPropertyById,
  getRelated,
  getRawTableRow
};
