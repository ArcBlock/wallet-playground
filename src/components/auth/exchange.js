/* eslint-disable react/jsx-one-expression-per-line */
import React from 'react';
import useToggle from 'react-use/lib/useToggle';
import PrompTypes from 'prop-types';

import Auth from '@arcblock/did-react/lib/Auth';
import Button from '@arcblock/ux/lib/Button';

import api from '../../libs/api';

const getExchangeAssetDesc = (type, count, token) => {
  let result = '';
  if (type === 'token') {
    result = token.symbol;
  } else {
    result = count <= 1 ? 'Asset' : 'Assets';
  }

  return result;
};

export default function Exchange({ payType, payCount = 1, receiveType, receiveCount = 1, token }) {
  const [isOpen, setOpen] = useToggle(false);
  const payDesc = getExchangeAssetDesc(payType, payCount, token);
  const receiveDesc = getExchangeAssetDesc(receiveType, receiveCount, token);

  return (
    <React.Fragment>
      <Button
        color="secondary"
        variant="contained"
        size="large"
        className="action"
        onClick={() => setOpen(true)}>
        Exchange {payCount} {payDesc} for {receiveCount} {receiveDesc}
      </Button>
      {isOpen && (
        <Auth
          responsive
          action="exchange"
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

Exchange.propTypes = {
  token: PrompTypes.object,
  receiveType: PrompTypes.string.isRequired,
  receiveCount: PrompTypes.number,
  payType: PrompTypes.string.isRequired,
  payCount: PrompTypes.number,
};

Exchange.defaultProps = {
  token: {},
  receiveCount: 1,
  payCount: 1,
};
