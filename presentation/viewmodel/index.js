'use strict';
// Home ViewModel layer — barrel. Channel-specific, on top of the Canonical Presentation Tree.
//
// Read-only AND write-forbidden: this barrel exports ONLY read/build functions. There is deliberately
// no save/update/create/put/link export anywhere in the layer.
const { makeStubAttentionProvider, seedDemoCandidates } = require('./attentionProvider');
const { DEFAULT_TONE, SEVERE_TONE, resolveTone } = require('./tone');
const { buildHomeViewModel, DEFAULT_SUMMARY } = require('./homeViewModel');

module.exports = {
  makeStubAttentionProvider,
  seedDemoCandidates,
  resolveTone,
  DEFAULT_TONE,
  SEVERE_TONE,
  buildHomeViewModel,
  DEFAULT_SUMMARY,
};
