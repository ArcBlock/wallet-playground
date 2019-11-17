/* eslint-disable react/jsx-one-expression-per-line */
import React from 'react';
import useToggle from 'react-use/lib/useToggle';
import PrompTypes from 'prop-types';

import Auth from '@arcblock/did-react/lib/Auth';
import Button from '@arcblock/ux/lib/Button';

import api from '../../libs/api';

const getExchangeAsset = type => (type === 'asset' ? 'asset' : 'play');

export default function ExchangeAssetWithAsset({
  payType,
  payCount = 1,
  receiveType,
  receiveCount = 1,
}) {
  const [isOpen, setOpen] = useToggle(false);
  return (
    <React.Fragment>
      <Button
        color="secondary"
        variant="contained"
        size="large"
        className="action"
        onClick={() => setOpen(true)}>
        Exchange {payCount} {getExchangeAsset(payType)} for {receiveCount}{' '}
        {getExchangeAsset(receiveType)}
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
            receiveType,
            receiveCount,
            payType,
            payCount,
          }}
        />
      )}
    </React.Fragment>
  );
}

ExchangeAssetWithAsset.propTypes = {
  receiveType: PrompTypes.string.isRequired,
  receiveCount: PrompTypes.number.isRequired,
  payType: PrompTypes.string.isRequired,
  payCount: PrompTypes.number.isRequired,
};
