/* eslint-disable react/destructuring-assignment */
/* eslint-disable object-curly-newline */
import React from 'react';
import PropTypes from 'prop-types';
import qs from 'querystring';

import Auth from '@arcblock/did-react/lib/Auth/Login';

import createService from '../Service';
import createStorage from '../Storage';

export default function createSessionContext(storageKey = 'login_token', requireLogin = true) {
  const storage = createStorage(storageKey);
  const { getToken, setToken, removeToken } = storage;

  const SessionContext = React.createContext();
  const { Provider, Consumer } = SessionContext;

  class SessionProvider extends React.Component {
    constructor(props) {
      super(props);

      this.service = createService(props.serviceHost, storage);
      this.state = { error: '', loading: false, open: false, user: null };

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
        const params = qs.parse(window.location.search.slice(1));
        if (params.loginToken) {
          setToken(params.loginToken);
          this.refresh(true);

          delete params.loginToken;
          const redirectUrl = `${window.location.pathname}?${qs.stringify(params)}`;
          window.history.replaceState({}, window.title, redirectUrl);
          return;
        }
      }

      this.setState({ open: true });
    }

    async refresh(showProgress = false) {
      try {
        if (this.state.loading) {
          // eslint-disable-next-line no-console
          console.warn('SessionProvider.refresh is currently in progress, call it will be noop');
          return;
        }

        const { prefix } = this.props;
        const { data, status } = await this.service.get(`${prefix}/session`.replace(/\/+/, '/'));

        if (status === 400) {
          removeToken();
          if (showProgress) {
            this.setState({ user: null, error: '', loading: false });
          } else {
            this.setState({ user: null, error: '' });
          }
        }

        if (data.error) {
          if (showProgress) {
            this.setState({ error: data.error, open: false, loading: false });
          } else {
            this.setState({ error: data.error, open: false });
          }
        } else if (requireLogin && data.user) {
          if (showProgress) {
            this.setState({ open: false, loading: false, ...data });
          } else {
            this.setState({ open: false, ...data });
          }
        } else {
          // eslint-disable-next-line no-lonely-if
          if (showProgress) {
            this.setState({ open: true, loading: true, ...data });
          } else {
            this.setState({ open: true, ...data });
          }
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('SessionProvider.refresh error', err);
        if (showProgress) {
          this.setState({ error: err.message, loading: false, open: false });
        } else {
          this.setState({ error: err.message, open: false });
        }
      }
    }

    login() {
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
        this.setState({ loading: false }, () => this.refresh(true));
      }
    }

    onClose() {
      this.setState({ open: false });
    }

    render() {
      const { children, action, prefix, locale, timeout, extraParams } = this.props;
      const { user, open, loading } = this.state;

      const state = {
        api: this.service,
        session: {
          ...this.state,
          loading: requireLogin ? !user || loading : loading,
          login: this.login,
          logout: this.logout,
          refresh: this.refresh,
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
