"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = createSessionContext;

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _querystring = _interopRequireDefault(require("querystring"));

var _Login = _interopRequireDefault(require("@arcblock/did-react/lib/Auth/Login"));

var _Service = _interopRequireDefault(require("../Service"));

var _Storage = _interopRequireDefault(require("../Storage"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function createSessionContext() {
  let storageKey = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'login_token';
  let requireLogin = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
  const storage = (0, _Storage.default)(storageKey);
  const {
    getToken,
    setToken,
    removeToken
  } = storage;

  const SessionContext = _react.default.createContext();

  const {
    Provider,
    Consumer
  } = SessionContext;

  class SessionProvider extends _react.default.Component {
    constructor(props) {
      super(props);
      this.service = (0, _Service.default)(props.serviceHost, storage);
      this.state = {
        error: '',
        loading: false,
        open: false,
        user: null
      };
      this.onLogin = this.onLogin.bind(this);
      this.onClose = this.onClose.bind(this);
      this.login = this.login.bind(this);
      this.logout = this.logout.bind(this);
      this.refresh = this.refresh.bind(this);
    }

    componentDidMount() {
      const token = getToken();

      if (token) {
        this.refresh(true);
        return;
      }

      if (typeof window !== 'undefined') {
        // If a login token exist in url, set that token in storage
        const params = _querystring.default.parse(window.location.search.slice(1));

        if (params.loginToken) {
          setToken(params.loginToken);
          this.refresh(true);
          delete params.loginToken;
          const redirectUrl = "".concat(window.location.pathname, "?").concat(_querystring.default.stringify(params));
          window.history.replaceState({}, window.title, redirectUrl);
          return;
        }
      }

      this.setState({
        open: true
      });
    }

    async refresh() {
      let showProgress = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

      try {
        if (this.state.loading) {
          // eslint-disable-next-line no-console
          console.warn('SessionProvider.refresh is currently in progress, call it will be noop');
          return;
        }

        const {
          prefix
        } = this.props;
        const {
          data,
          status
        } = await this.service.get("".concat(prefix, "/session").replace(/\/+/, '/'));

        if (status === 400) {
          removeToken();

          if (showProgress) {
            this.setState({
              user: null,
              error: '',
              loading: false
            });
          } else {
            this.setState({
              user: null,
              error: ''
            });
          }
        }

        if (data.error) {
          if (showProgress) {
            this.setState({
              error: data.error,
              open: false,
              loading: false
            });
          } else {
            this.setState({
              error: data.error,
              open: false
            });
          }
        } else if (requireLogin && data.user) {
          if (showProgress) {
            this.setState(_objectSpread({
              open: false,
              loading: false
            }, data));
          } else {
            this.setState(_objectSpread({
              open: false
            }, data));
          }
        } else {
          // eslint-disable-next-line no-lonely-if
          if (showProgress) {
            this.setState(_objectSpread({
              open: true,
              loading: true
            }, data));
          } else {
            this.setState(_objectSpread({
              open: true
            }, data));
          }
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('SessionProvider.refresh error', err);

        if (showProgress) {
          this.setState({
            error: err.message,
            loading: false,
            open: false
          });
        } else {
          this.setState({
            error: err.message,
            open: false
          });
        }
      }
    }

    login() {
      if (this.state.user) {
        return;
      }

      this.setState({
        open: true
      });
    }

    logout() {
      removeToken();
      this.setState({
        user: null,
        error: ''
      });
    }

    onLogin(_ref) {
      let {
        loginToken,
        sessionToken
      } = _ref;
      const token = loginToken || sessionToken;

      if (token) {
        setToken(token);
        this.setState({
          loading: false
        }, () => this.refresh(true));
      }
    }

    onClose() {
      this.setState({
        open: false
      });
    }

    render() {
      const {
        children,
        action,
        prefix,
        locale,
        timeout,
        extraParams
      } = this.props;
      const {
        user,
        open,
        loading
      } = this.state;
      const state = {
        api: this.service,
        session: _objectSpread({}, this.state, {
          loading: requireLogin ? !user || loading : loading,
          login: this.login,
          logout: this.logout,
          refresh: this.refresh
        })
      };
      return _react.default.createElement(Provider, {
        value: state
      }, !open && typeof children === 'function' ? children(state) : children, open && _react.default.createElement(_Login.default, {
        responsive: true,
        action: action || 'login',
        locale: locale,
        prefix: prefix,
        checkFn: this.service.get,
        onClose: this.onClose,
        onSuccess: this.onLogin,
        extraParams: extraParams,
        checkTimeout: timeout
      }));
    }

  }

  SessionProvider.propTypes = {
    children: _propTypes.default.any.isRequired,
    serviceHost: _propTypes.default.string.isRequired,
    action: _propTypes.default.string,
    prefix: _propTypes.default.string,
    locale: _propTypes.default.string,
    timeout: _propTypes.default.number,
    extraParams: _propTypes.default.object
  };
  SessionProvider.defaultProps = {
    locale: 'en',
    action: 'login',
    prefix: '/api/did',
    extraParams: {},
    timeout: 5 * 60 * 1000
  };

  function withSession(Component) {
    return function WithSessionComponent(props) {
      return _react.default.createElement(Consumer, null, sessionProps => _react.default.createElement(Component, Object.assign({}, props, sessionProps)));
    };
  } // eslint-disable-next-line object-curly-newline


  return {
    SessionProvider,
    SessionConsumer: Consumer,
    SessionContext,
    withSession
  };
}