'use strict';
// Opaque id generation for canonical objects. Ids are strings and carry no
// meaning beyond identity — nothing branches on their shape.

let counter = 0;

function newId(prefix) {
  counter += 1;
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${Date.now().toString(36)}${counter.toString(36)}${rand}`;
}

module.exports = { newId };
