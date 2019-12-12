/* eslint-disable react/jsx-one-expression-per-line */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import useToggle from 'react-use/lib/useToggle';
import capitalize from 'lodash/capitalize';

import Auth from '@arcblock/did-react/lib/Auth';
import Button from '@arcblock/ux/lib/Button';

import api from '../../libs/api';

export default function CertificateButton({ assetToken, action }) {
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

  const messages = {
    buy: {
      title: 'Buy Certificate',
      scan: `Pay 6.99 ${assetToken.symbol} for the certificate`,
      confirm: 'Confirm purchase on your ABT Wallet',
      success: 'Purchase succeed!',
    },
    sell: {
      title: 'Sell Certificate',
      scan: `Sell the certificate for  6.99 ${assetToken.symbol}`,
      confirm: 'Confirm swap on your ABT Wallet',
      success: 'Swap succeed!',
    },
  };

  return (
    <React.Fragment>
      <Button color="secondary" variant="contained" size="large" className="action" onClick={onStartSwap}>
        {capitalize(action)} Certificate {action === 'buy' ? 'with' : 'for'} 6.99 {assetToken.symbol}
      </Button>
      {isOpen && !!traceId && (
        <Auth
          responsive
          action="swap-certificate"
          extraParams={{ traceId, action }}
          checkFn={api.get}
          socketUrl={api.socketUrl}
          checkTimeout={5 * 60 * 1000}
          onClose={() => setOpen(false)}
          onSuccess={() => setOpen(false)}
          messages={messages[action]}
        />
      )}
    </React.Fragment>
  );
}

CertificateButton.propTypes = {
  assetToken: PropTypes.object.isRequired,
  action: PropTypes.string.isRequired,
};
