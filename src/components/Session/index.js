import React from 'react';
import PropTypes from 'prop-types';
import qs from 'querystring';

import Auth from '@arcblock/did-react/lib/Auth/Login';

import createService from '../Service';
import createStorage from '../Storage';

export default function createSessionContext(storageKey = 'login_token') {
  const storage = createStorage(storageKey);
  const { getToken, setToken, removeToken } = storage;

  const SessionContext = React.createContext();
  const { Provider, Consumer } = SessionContext;

  class SessionProvider extends React.Component {
    constructor(props) {
      super(props);

      this.service = createService(props.serviceHost, storage);
      this.state = { error: '', loading: false, user: null };

      this.onLogin = this.onLogin.bind(this);
      this.onClose = this.onClose.bind(this);
      this.login = this.login.bind(this);
      this.logout = this.logout.bind(this);
      this.refresh = this.refresh.bind(this);
    }

    componentDidMount() {
      const token = getToken();
      if (token) {
        this.refresh();
        return;
      }

      // If a login token exist in url, set that token in storage
      if (!window || !window.location) {
        return;
      }

      const params = qs.parse(window.location.search.slice(1));
      if (params.loginToken) {
        setToken(params.loginToken);
        this.refresh();

        delete params.loginToken;
        const redirectUrl = `${window.location.pathname}?${qs.stringify(params)}`;
        window.history.replaceState({}, window.title, redirectUrl);
      }
    }

    async refresh() {
      try {
        const { prefix } = this.props;
        const { data, status } = await this.service.get(`${prefix}/session`.replace(/\/+/, '/'));
        if (status === 400) {
          removeToken();
          this.setState({ user: null, error: '' });
          return;
        }

        if (data.error) {
          this.setState({ error: data.error, open: false });
        } else {
          this.setState({ open: false, ...data });
        }
      } catch (err) {
        this.setState({ error: err.message, open: false });
      }
    }

    login() {
      // eslint-disable-next-line react/destructuring-assignment
      if (this.state.user) {
        return;
      }
      this.setState({ open: true });
    }

    logout() {
      removeToken();
      this.setState({ user: null, error: '' });
    }

    onLogin({ loginToken, sessionToken }) {
      const token = loginToken || sessionToken;
      if (token) {
        setToken(token);
        this.refresh();
      }
    }

    onClose() {
      this.setState({ open: false });
    }

    render() {
      // eslint-disable-next-line object-curly-newline
      const { children, action, prefix, locale, timeout, extraParams } = this.props;
      const { user, open, error } = this.state;

      const state = {
        session: {
          error,
          loading: open,
          user,
          login: this.login,
          logout: this.logout,
          ...this.state,
        },
      };

      return (
        <Provider value={state}>
          {!open && typeof children === 'function' ? children(state) : children}
          {open && (
            <Auth
              responsive
              action={action || 'login'}
              locale={locale}
              prefix={prefix}
              checkFn={this.service.get}
              onClose={this.onClose}
              onSuccess={this.onLogin}
              extraParams={extraParams}
              checkTimeout={timeout}
            />
          )}
        </Provider>
      );
    }
  }

  SessionProvider.propTypes = {
    children: PropTypes.any.isRequired,
    serviceHost: PropTypes.string.isRequired,
    action: PropTypes.string,
    prefix: PropTypes.string,
    locale: PropTypes.string,
    timeout: PropTypes.number,
    extraParams: PropTypes.object,
  };

  SessionProvider.defaultProps = {
    locale: 'en',
    action: 'login',
    prefix: '/api/did',
    extraParams: {},
    timeout: 5 * 60 * 1000,
  };

  function withSession(Component) {
    return function WithSessionComponent(props) {
      return <Consumer>{sessionProps => <Component {...props} {...sessionProps} />}</Consumer>;
    };
  }

  // eslint-disable-next-line object-curly-newline
  return { SessionProvider, SessionConsumer: Consumer, SessionContext, withSession };
}
