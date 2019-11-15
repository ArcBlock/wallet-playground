/* eslint-disable react/jsx-one-expression-per-line */
import React from 'react';
import useToggle from 'react-use/lib/useToggle';
import PrompTypes from 'prop-types';

import Auth from '@arcblock/did-react/lib/Auth';
import Button from '@arcblock/ux/lib/Button';

import api from '../../libs/api';

export default function ExchangeAssetWithAsset({ payCount = 1, receiveCount = 1 }) {
  const [isOpen, setOpen] = useToggle(false);
  return (
    <React.Fragment>
      <Button
        color="secondary"
        variant="contained"
        size="large"
        className="action"
        onClick={() => setOpen(true)}>
        Exchange {payCount} {payCount >= 1 ? 'Assets' : 'Asset'} for {receiveCount}{' '}
        {receiveCount >= 1 ? 'Assets' : 'Asset'}
      </Button>
      {isOpen && (
        <Auth
          responsive
          action="exchange_asset_with_asset"
          checkFn={api.get}
          onClose={() => setOpen()}
          onSuccess={() => window.location.reload()}
          messages={{
            title: 'Exchange Required',
            scan: 'Scan QR code to start exchange',
            confirm: 'Confirm the exchange on your ABT Wallet',
            success: 'Exchange success!',
          }}
          extraParams={{
            receiveCount,
            payCount,
          }}
        />
      )}
    </React.Fragment>
  );
}

ExchangeAssetWithAsset.propTypes = {
  receiveCount: PrompTypes.number.isRequired,
  payCount: PrompTypes.number.isRequired,
};
