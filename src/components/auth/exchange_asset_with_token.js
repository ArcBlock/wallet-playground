/* eslint-disable react/jsx-one-expression-per-line */
import React from 'react';
import PropTypes from 'prop-types';
import useToggle from 'react-use/lib/useToggle';

import Auth from '@arcblock/did-react/lib/Auth';
import Button from '@arcblock/ux/lib/Button';

import api from '../../libs/api';

export default function ExchangeAssetWithToken() {
  const [isOpen, setOpen] = useToggle(false);
  return (
    <React.Fragment>
      <Button
        color="secondary"
        variant="contained"
        size="large"
        className="action"
        onClick={() => setOpen(true)}>
        Exchange asset with token
      </Button>
      {isOpen && (
        <Auth
          responsive
          action="exchange_asset_with_token"
          checkFn={api.get}
          onClose={() => setOpen()}
          onSuccess={() => window.location.reload()}
          messages={{
            title: 'Transfer Required',
            scan: 'Scan qrcode to accept transfer',
            confirm: 'Confirm on your ABT Wallet',
            success: 'Transfer sent!',
          }}
        />
      )}
    </React.Fragment>
  );
}
