'use strict';
// Presentation Projection layer — barrel.
//
// Stack: Reality → Presentation Read Model → Projection → ViewModel → UI Components.
// This layer delivers the first two arrows (Read Model + Projection = the Canonical Presentation Tree).
//
// Projection is read-only AND write-forbidden: this barrel exports ONLY read/projection/seed-build
// functions. There is deliberately NO save/update/create/put/link export anywhere in the layer.
const { makeReader } = require('./reader');
const { DEFAULT_LABELS, resolveLabel } = require('./customerLanguage');
const { projectWallet } = require('./projection');
const { loadSeedCustomer, defaultSeedLoader } = require('./seedCustomer');

module.exports = {
  makeReader,
  resolveLabel,
  DEFAULT_LABELS,
  projectWallet,
  loadSeedCustomer,
  defaultSeedLoader,
};
