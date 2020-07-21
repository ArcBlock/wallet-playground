import React from 'react';
import PropTypes from 'prop-types';
import BaseLayout from '@arcblock/ux/lib/Layout';

export default function Layout({ title, children, contentOnly }) {
  const getExplorerUrl = (chainHost, type) => {
    if (window.env) {
      if (window.env.localChainExplorer && type === 'local') {
        return window.env.localChainExplorer;
      }
      if (window.env.foreignChainExplorer && type === 'foreign') {
        return window.env.foreignChainExplorer;
      }
    }

    const [host] = chainHost.split('/api');
    return `${host}/node/explorer/txs`;
  };

  const apiPrefix = (window.env.apiPrefix || '/').replace(/^\/+/, '').replace(/\/+$/, '');

  const links = [
    { url: `/${apiPrefix}/`, title: 'Home' },
    { url: `/${apiPrefix}/profile`, title: 'Profile' },
    { url: `/${apiPrefix}/full`, title: 'Everything' },
    { url: `/${apiPrefix}/orders`, title: 'Orders' },
    { url: 'https://www.arcblock.io/en/try-identity-now/', title: 'Demos' },
  ];

  if (window.env.chainHost) {
    links.push({ url: getExplorerUrl(window.env.chainHost, 'local'), title: 'Local Chain' });
  }
  if (window.env.assetChainHost) {
    links.push({ url: getExplorerUrl(window.env.assetChainHost, 'foreign'), title: 'Foreign Chain' });
  }
  links.push({ url: 'https://github.com/ArcBlock/wallet-playground', title: 'GitHub' });

  return (
    <BaseLayout title={title} brand={window.env.appName} links={links} contentOnly={contentOnly} baseUrl="/">
      {children}
    </BaseLayout>
  );
}

Layout.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.any.isRequired,
  contentOnly: PropTypes.bool,
};

Layout.defaultProps = {
  contentOnly: false,
};
