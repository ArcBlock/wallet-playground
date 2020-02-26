"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.withSession = exports.SessionConsumer = exports.SessionContext = exports.SessionProvider = void 0;

var _Session = _interopRequireDefault(require("../Session"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable object-curly-newline */
const {
  SessionProvider,
  SessionContext,
  SessionConsumer,
  withSession
} = (0, _Session.default)('did.playground.token');
exports.withSession = withSession;
exports.SessionConsumer = SessionConsumer;
exports.SessionContext = SessionContext;
exports.SessionProvider = SessionProvider;