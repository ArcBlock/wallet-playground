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
        Show dApp Error
      </Button>
      {isOpen && (
        <Auth
          responsive
          action="error"
          checkFn={api.get}
          onClose={() => setOpen()}
          onSuccess={() => setOpen(false)}
          messages={{
            title: 'dApp will throw an error',
            scan: 'Scan qrcode to get the error',
            confirm: 'Confirm on your ABT Wallet',
            success: 'You will not see this',
          }}
        />
      )}
    </React.Fragment>
  );
}

AuthPrincipal.propTypes = {};
