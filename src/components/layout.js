import React, { useEffect } from 'react';
import qs from 'querystring';
import PropTypes from 'prop-types';
import AppBar from '@material-ui/core/AppBar';
import Container from '@material-ui/core/Container';
import styled from 'styled-components';
import Helmet from 'react-helmet';
import Footer from '@arcblock/ux/lib/Footer';
import { useLocation } from 'react-router-dom';

import Header from './header';

import env from '../libs/env';
import { setToken } from '../libs/auth';

export default function Layout({ title, children, contentOnly }) {
  const location = useLocation();

  // If a login token exist in url, set that token in storage
  useEffect(() => {
    const params = qs.parse(location.search.slice(1));
    if (params.loginToken) {
      setToken(params.loginToken);

      delete params.loginToken;
      const redirectUrl = `${location.pathname}?${qs.stringify(params)}`;
      window.history.replaceState({}, window.title, redirectUrl);
    }
  }, []);

  if (contentOnly) {
    return <Container>{children}</Container>;
  }

  return (
    <Div>
      <Helmet title={`${title} - ${env.appName}`} />
      <AppBar position="static" color="default" style={{ height: 64 }}>
        <Container>
          <Header />
        </Container>
      </AppBar>
      <Container style={{ minHeight: '60vh' }}>
        {children}
        <Footer />
      </Container>
    </Div>
  );
}

Layout.propTypes = {
  title: PropTypes.string.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  children: PropTypes.any.isRequired,
  contentOnly: PropTypes.bool,
};

Layout.defaultProps = {
  contentOnly: false,
};

const Div = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #fbfbfb;
`;
