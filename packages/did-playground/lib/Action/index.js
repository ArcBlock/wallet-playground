"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = PlaygroundAction;

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _CircularProgress = _interopRequireDefault(require("@material-ui/core/CircularProgress"));

var _Auth = _interopRequireDefault(require("@arcblock/did-react/lib/Auth"));

var _Button = _interopRequireDefault(require("@arcblock/ux/lib/Button"));

var _session = require("./session");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

async function createSwapOrder(api) {
  const res = await api.post('/api/swap', {});
  return {
    traceId: res.data.traceId
  };
}

const actions = {
  // Currency
  receive_local_token: {
    action: 'receive_token',
    extraParams: props => ({
      chain: 'local',
      amount: props.amount || 1
    })
  },
  receive_foreign_token: {
    action: 'receive_token',
    extraParams: props => ({
      chain: 'foreign',
      amount: props.amount || 1
    })
  },
  send_local_token: {
    action: 'send_token',
    extraParams: props => ({
      chain: 'local',
      amount: props.amount || 1
    })
  },
  send_foreign_token: {
    action: 'send_token',
    extraParams: props => ({
      chain: 'foreign',
      amount: props.amount || 1
    })
  },
  exchange_to_foreign_token: {
    action: 'swap_token',
    onStart: createSwapOrder,
    extraParams: props => ({
      action: 'buy',
      rate: props.exchangeRate
    })
  },
  exchange_to_local_token: {
    action: 'swap_token',
    onStart: createSwapOrder,
    extraParams: props => ({
      action: 'sell',
      rate: props.exchangeRate
    })
  }
};

const getActionName = (config, props) => {
  if (typeof config === 'string') {
    return config;
  }

  if (typeof config.action === 'string') {
    return config.action;
  }

  if (typeof config.action === 'function') {
    return config.action(props);
  }

  throw new Error('Cannot determine playground button action');
};

const getActionParams = (config, props) => {
  if (typeof config === 'string') {
    return {};
  }

  if (!config.extraParams) {
    return {};
  }

  if (typeof config.extraParams === 'function') {
    return config.extraParams(props);
  }

  if (typeof config.extraParams === 'object') {
    return config.extraParams;
  }

  return {};
};

function PlaygroundAction(_ref) {
  let {
    action,
    buttonText,
    buttonColor,
    buttonVariant,
    buttonSize,
    buttonRounded,
    title,
    scanMessage,
    successMessage,
    confirmMessage,
    extraParams,
    timeout
  } = _ref,
      rest = _objectWithoutProperties(_ref, ["action", "buttonText", "buttonColor", "buttonVariant", "buttonSize", "buttonRounded", "title", "scanMessage", "successMessage", "confirmMessage", "extraParams", "timeout"]);

  const {
    api,
    session
  } = (0, _react.useContext)(_session.SessionContext);
  const [open, setOpen] = (0, _react.useState)(false);
  const [loading, setLoading] = (0, _react.useState)(false);
  const [dynamicParams, setDynamicParams] = (0, _react.useState)({});
  const config = actions[action];

  if (!actions[action]) {
    throw new Error("Supported playground action type ".concat(action));
  }

  const onStart = async () => {
    if (typeof config.onStart === 'function') {
      try {
        setLoading(true);
        const params = await config.onStart(api, session);
        setDynamicParams(params);
        setLoading(false);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Cannot generate dynamicParams for playground action ".concat(getActionName(config, rest)));
      }

      setOpen(true);
    } else {
      setOpen(true);
    }
  };

  return _react.default.createElement(_react.default.Fragment, null, _react.default.createElement(_Button.default, Object.assign({}, rest, {
    rounded: buttonRounded,
    color: buttonColor,
    variant: buttonVariant,
    size: buttonSize,
    onClick: onStart
  }), buttonText || title, " ", loading && _react.default.createElement(_CircularProgress.default, {
    size: 12,
    color: "#fff"
  })), open && _react.default.createElement(_Auth.default, {
    responsive: true,
    action: getActionName(config, rest),
    checkFn: api.get,
    onClose: () => setOpen(false),
    onSuccess: () => setOpen(false),
    checkTimeout: timeout // 3 layers of extraParams: user props, dynamically generated, from other props
    ,
    extraParams: Object.assign(getActionParams(config, rest), dynamicParams, extraParams),
    messages: {
      title,
      scan: scanMessage,
      confirm: confirmMessage,
      success: successMessage
    }
  }));
}

PlaygroundAction.propTypes = {
  action: _propTypes.default.string.isRequired,
  buttonText: _propTypes.default.string,
  buttonColor: _propTypes.default.string,
  buttonVariant: _propTypes.default.string,
  buttonSize: _propTypes.default.string,
  buttonRounded: _propTypes.default.bool,
  title: _propTypes.default.string.isRequired,
  scanMessage: _propTypes.default.string,
  successMessage: _propTypes.default.string,
  confirmMessage: _propTypes.default.string,
  extraParams: _propTypes.default.object,
  timeout: _propTypes.default.number
};
PlaygroundAction.defaultProps = {
  buttonText: '',
  buttonColor: 'primary',
  // primary | secondary | reverse | error
  buttonVariant: 'contained',
  // contained | outlined | default
  buttonSize: 'large',
  // small | large | medium
  buttonRounded: false,
  scanMessage: 'Scan the QRCode with your ABT Wallet',
  confirmMessage: 'Confirm in your ABT Wallet',
  successMessage: 'Operation success!',
  extraParams: {},
  timeout: 5 * 60 * 1000
};