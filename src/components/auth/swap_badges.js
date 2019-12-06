/* eslint-disable react/jsx-one-expression-per-line */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import useToggle from 'react-use/lib/useToggle';
import capitalize from 'lodash/capitalize';

import Auth from '@arcblock/did-react/lib/Auth';
import Button from '@arcblock/ux/lib/Button';

import api from '../../libs/api';

export default function SwapButton({ assetToken, action }) {
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
    action === 'buy' ? `Buy 2 badges with 1.99 ${assetToken.symbol}` : `Sell 2 badges for 1.99 ${assetToken.symbol}`;

  return (
    <React.Fragment>
      <Button color="secondary" variant="contained" size="large" className="action" onClick={onStartSwap}>
        {title}
      </Button>
      {isOpen && !!traceId && (
        <Auth
          responsive
          action="swap-badges"
          extraParams={{ traceId, action }}
          checkFn={api.get}
          checkTimeout={5 * 60 * 1000}
          onClose={() => setOpen(false)}
          onSuccess={() => window.location.reload()}
          messages={{
            title: `${capitalize(action)} Badges`,
            scan: title,
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
  action: PropTypes.string.isRequired,
};
