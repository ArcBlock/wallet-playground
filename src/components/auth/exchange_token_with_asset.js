/* eslint-disable react/jsx-one-expression-per-line */
import React from 'react';
import PropTypes from 'prop-types';
import useToggle from 'react-use/lib/useToggle';

import Auth from '@arcblock/did-react/lib/Auth';
import Button from '@arcblock/ux/lib/Button';

import api from '../../libs/api';

export default function ExchangeAssetWithToken({ token }) {
  const [isOpen, setOpen] = useToggle(false);
  return (
    <React.Fragment>
      <Button
        color="secondary"
        variant="contained"
        size="large"
        className="action"
        onClick={() => setOpen(true)}>
        Exchange 1 Asset for 1 {token.symbol}
      </Button>
      {isOpen && (
        <Auth
          responsive
          action="exchange_token_with_asset"
          checkFn={api.get}
          onClose={() => setOpen()}
          onSuccess={() => window.location.reload()}
          messages={{
            title: 'Exchange Required',
            scan: 'Scan QR code to start exchange',
            confirm: 'Confirm the exchange on your ABT Wallet',
            success: 'Exchange success!',
          }}
        />
      )}
    </React.Fragment>
  );
}

ExchangeAssetWithToken.propTypes = {
  token: PropTypes.object.isRequired,
};
