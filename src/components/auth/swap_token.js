/* eslint-disable no-return-assign */
/* eslint-disable react/jsx-one-expression-per-line */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import useToggle from 'react-use/lib/useToggle';
import capitalize from 'lodash/capitalize';

import Auth from '@arcblock/did-react/lib/Auth';
import Button from '@arcblock/ux/lib/Button';

import api from '../../libs/api';

export default function SwapButton({ token, assetToken, action }) {
  const [isOpen, setOpen] = useToggle(false);
  const [traceId, setTraceId] = useState();

  const onStartSwap = async () => {
    const res = await api.post('/api/swap', {});
    if (res.data.traceId) {
      setTraceId(res.data.traceId);
      setOpen(true);
    } else {
      window.alert('Cannot create swap');
    }
  };

  // eslint-disable-next-line operator-linebreak
  const title =
    action === 'buy'
      ? `Buy 1 ${assetToken.symbol} with 5 ${token.symbol}`
      : `Sell 1 ${assetToken.symbol} for 5 ${token.symbol}`;

  return (
    <React.Fragment>
      <Button color="secondary" variant="contained" size="large" className="action" onClick={onStartSwap}>
        {title}
      </Button>
      {isOpen && !!traceId && (
        <Auth
          responsive
          action="swap-token"
          extraParams={{ traceId, action }}
          checkFn={api.get}
          socketUrl={api.socketUrl}
          checkTimeout={5 * 60 * 1000}
          onClose={() => setOpen(false)}
          onSuccess={() => (window.location.href = '/orders')}
          messages={{
            title: `${capitalize(action)} ${assetToken.symbol}`,
            scan: title,
            confirm: 'Confirm transaction on your ABT Wallet',
            success: 'Transaction success',
          }}
        />
      )}
    </React.Fragment>
  );
}

SwapButton.propTypes = {
  token: PropTypes.object.isRequired,
  assetToken: PropTypes.object.isRequired,
  action: PropTypes.string.isRequired,
};
