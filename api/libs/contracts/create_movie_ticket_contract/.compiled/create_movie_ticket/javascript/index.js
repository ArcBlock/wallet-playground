// Generated by forge-cli
const provider = require('@arcblock/forge-proto/provider');
const { addProvider } = require('@arcblock/forge-message');
// const { addProvider } = require('@arcblock/forge-message/lite');
const types = require('./movie_ticket_pb.js');
const specs = require('./protocol_spec.json');
const urls = require('./protocol_url.json');

addProvider(provider({ types }, specs, urls));

module.exports = { types, specs, urls };