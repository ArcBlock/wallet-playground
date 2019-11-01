import React, { useState } from 'react';
import PropTypes from 'prop-types';
import useToggle from 'react-use/lib/useToggle';

import Auth from '@arcblock/did-react/lib/Auth';
import Button from '@arcblock/ux/lib/Button';

import api from '../../libs/api';

export default function SwapButton({ assetToken }) {
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
        Swap 1 Token for 1 Badge
      </Button>
      {isOpen && !!traceId && (
        <Auth
          responsive
          action="swap-badge"
          extraParams={{ traceId }}
          checkFn={api.get}
          checkTimeout={5 * 60 * 1000}
          onClose={() => setOpen(false)}
          onSuccess={() => window.location.reload()}
          messages={{
            title: 'Swap Required',
            scan: `Pay 1 ${assetToken.symbol} for an badge`,
            confirm: 'Confirm swap on your ABT Wallet',
            success: 'You have successfully paid!',
          }}
        />
      )}
    </React.Fragment>
  );
}

SwapButton.propTypes = {
  assetToken: PropTypes.object.isRequired,
};
