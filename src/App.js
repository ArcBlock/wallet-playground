import React from 'react';
import { MuiThemeProvider } from '@material-ui/core/styles';
import { createGlobalStyle, ThemeProvider } from 'styled-components';
import { BrowserRouter as Router, Route, Switch, Redirect, withRouter } from 'react-router-dom';

import CssBaseline from '@material-ui/core/CssBaseline';
import CircularProgress from '@material-ui/core/CircularProgress';

import HomePage from './pages/full';
import ProfilePage from './pages/profile';
import OrdersPage from './pages/orders';
import MiniPage from './pages/index';

import theme from './libs/theme';
import env from './libs/env';
import { SessionProvider } from './components/PlaygroundAction/session';

const GlobalStyle = createGlobalStyle`
  a {
    color: ${props => props.theme.colors.green};
    text-decoration: none;
  }
`;

export const App = () => (
  <MuiThemeProvider theme={theme}>
    <ThemeProvider theme={theme}>
      <SessionProvider serviceHost={env.baseUrl}>
        {({ session }) => {
          if (session.loading) {
            return <CircularProgress />;
          }

          return (
            <React.Fragment>
              <CssBaseline />
              <GlobalStyle />
              <div className="wrapper">
                <Switch>
                  <Route exact path="/" component={MiniPage} />
                  <Route exact path="/full" component={HomePage} />
                  <Route exact path="/profile" component={ProfilePage} />
                  <Route exact path="/orders" component={OrdersPage} />
                  <Redirect to="/" />
                </Switch>
              </div>
            </React.Fragment>
          );
        }}
      </SessionProvider>
    </ThemeProvider>
  </MuiThemeProvider>
);

const WrappedApp = withRouter(App);

export default () => (
  <Router>
    <WrappedApp />
  </Router>
);
