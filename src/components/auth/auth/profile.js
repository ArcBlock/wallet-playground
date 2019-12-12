/* eslint-disable react/jsx-one-expression-per-line */
import React from 'react';
import useToggle from 'react-use/lib/useToggle';

import Auth from '@arcblock/did-react/lib/Auth';
import Button from '@arcblock/ux/lib/Button';

import api from '../../../libs/api';

export default function AuthPrincipal() {
  const [isOpen, setOpen] = useToggle(false);
  return (
    <React.Fragment>
      <Button color="secondary" variant="contained" size="large" className="action" onClick={() => setOpen(true)}>
        Request Full Profile
      </Button>
      {isOpen && (
        <Auth
          responsive
          action="profile"
          checkFn={api.get}
          socketUrl={api.socketUrl}
          onClose={() => setOpen()}
          checkTimeout={5 * 60 * 1000}
          onSuccess={() => window.location.reload()}
          messages={{
            title: 'Profile Required',
            scan: 'Scan QR code to provide profile',
            confirm: 'Confirm on your ABT Wallet',
            success: 'Profile provided',
          }}
        />
      )}
    </React.Fragment>
  );
}

AuthPrincipal.propTypes = {};
