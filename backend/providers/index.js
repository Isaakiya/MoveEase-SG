const providerName = process.env.PROVIDER || 'botpress';

let impl;
try {
  impl = require(`./${providerName}Provider`);
} catch (err) {
  // eslint-disable-next-line no-console
  console.error(`Provider implementation not found for '${providerName}':`, err.message);
  impl = null;
}

if (!impl) {
  throw new Error(`No provider implementation available for '${providerName}'. Set PROVIDER env or add provider implementation.`);
}

module.exports = impl;
