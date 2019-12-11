/* eslint-disable react/jsx-one-expression-per-line */
import React from 'react';
import PropTypes from 'prop-types';
import useToggle from 'react-use/lib/useToggle';

import Auth from '@arcblock/did-react/lib/Auth';
import Button from '@arcblock/ux/lib/Button';

import api from '../../libs/api';

export default function TransferTokenOut({ token }) {
  const [isOpen, setOpen] = useToggle(false);
  return (
    <React.Fragment>
      <Button color="secondary" variant="contained" size="large" className="action" onClick={() => setOpen(true)}>
        Send 1 {token.symbol} to Wallet
      </Button>
      {isOpen && (
        <Auth
          responsive
          action="transfer_token_in"
          checkFn={api.get}
          socketUrl={api.socketUrl}
          onClose={() => setOpen()}
          onSuccess={() => window.location.reload()}
          messages={{
            title: 'Transfer Required',
            scan: 'Scan QR code to receive token',
            confirm: 'Confirm on your ABT Wallet',
            success: 'Transfer sent!',
          }}
        />
      )}
    </React.Fragment>
  );
}

TransferTokenOut.propTypes = {
  token: PropTypes.object.isRequired,
};
