/* eslint-disable react/jsx-one-expression-per-line */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import useToggle from 'react-use/lib/useToggle';

import Auth from '@arcblock/did-react/lib/Auth';
import Button from '@arcblock/ux/lib/Button';

import api from '../../libs/api';

export default function SwapButton({ token, assetToken }) {
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

  return (
    <React.Fragment>
      <Button color="secondary" variant="contained" size="large" className="action" onClick={onStartSwap}>
        Swap 1 {assetToken.symbol} for 5 {token.symbol}
      </Button>
      {isOpen && !!traceId && (
        <Auth
          responsive
          action="swap-token"
          extraParams={{ traceId }}
          checkFn={api.get}
          checkTimeout={5 * 60 * 1000}
          onClose={() => setOpen(false)}
          onSuccess={() => window.location.reload()}
          messages={{
            title: 'Swap Required',
            scan: `Swap 1 ${assetToken.symbol} for 5 ${token.symbol}`,
            confirm: 'Confirm swap on your ABT Wallet',
            success: 'You have successfully paid!',
          }}
        />
      )}
    </React.Fragment>
  );
}

SwapButton.propTypes = {
  token: PropTypes.object.isRequired,
  assetToken: PropTypes.object.isRequired,
};
