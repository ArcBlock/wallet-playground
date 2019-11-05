/* eslint-disable react/jsx-one-expression-per-line */
import React from 'react';
import useToggle from 'react-use/lib/useToggle';

import Auth from '@arcblock/did-react/lib/Auth';
import Button from '@arcblock/ux/lib/Button';

import api from '../../libs/api';

export default function AuthPrincipal() {
  const [isOpen, setOpen] = useToggle(false);
  return (
    <React.Fragment>
      <Button color="secondary" variant="contained" size="large" className="action" onClick={() => setOpen(true)}>
        Do Auth Principal
      </Button>
      {isOpen && (
        <Auth
          responsive
          action="auth"
          checkFn={api.get}
          onClose={() => setOpen()}
          onSuccess={() => window.location.reload()}
          messages={{
            title: 'Auth principal',
            scan: 'Scan qrcode to choose did',
            confirm: 'Confirm on your ABT Wallet',
            success: 'Lucky tokens sent to your account',
          }}
        />
      )}
    </React.Fragment>
  );
}

AuthPrincipal.propTypes = {};
