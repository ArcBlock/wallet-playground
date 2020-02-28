/* eslint-disable react/jsx-one-expression-per-line */
import React from 'react';
import useToggle from 'react-use/lib/useToggle';
import PrompTypes from 'prop-types';

import Auth from '@arcblock/did-react/lib/Auth';
import Button from '@arcblock/ux/lib/Button';

import api from '../../libs/api';

export default function ConsumeAsset({ count }) {
  const [isOpen, setOpen] = useToggle(false);

  return (
    <React.Fragment>
      <Button color="secondary" variant="contained" size="large" className="action" onClick={() => setOpen(true)}>
        Consume Asset
      </Button>
      {isOpen && (
        <Auth
          responsive
          action="consume_asset"
          checkFn={api.get}
          socketUrl={api.socketUrl}
          onClose={() => setOpen()}
          onSuccess={() => window.location.reload()}
          messages={{
            title: 'Scan QR Required',
            scan: 'Scan QR code to get ticket',
            confirm: 'Confirm the consumption on your ABT Wallet',
            success: 'Consume success!',
          }}
          extraParams={{
            count,
          }}
        />
      )}
    </React.Fragment>
  );
}

ConsumeAsset.propTypes = {
  count: PrompTypes.number,
};

ConsumeAsset.defaultProps = {
  count: 1,
};
