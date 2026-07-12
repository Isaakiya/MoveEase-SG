require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const routes = require('./routes/properties');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// Mount API routes under /api
app.use('/api', routes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`MoveEase backend bridge listening on port ${PORT}`);
  console.log('Ensure the provider is configured via environment variables.');
});
