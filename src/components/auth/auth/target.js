/* eslint-disable react/jsx-one-expression-per-line */
import React from 'react';
import useToggle from 'react-use/lib/useToggle';

import Auth from '@arcblock/did-react/lib/Auth';
import Button from '@arcblock/ux/lib/Button';

import api from '../../../libs/api';

export default function TargetDid() {
  const [isOpen, setOpen] = useToggle(false);
  return (
    <React.Fragment>
      <Button color="secondary" variant="contained" size="large" className="action" onClick={() => setOpen(true)}>
        Proof of DID Holding
      </Button>
      {isOpen && (
        <Auth
          responsive
          action="claim_target"
          checkFn={api.get}
          socketUrl={api.socketUrl}
          onClose={() => setOpen()}
          onSuccess={() => setOpen(false)}
          messages={{
            title: 'Create DID',
            scan: 'Scan QR code to get the did spec',
            confirm: 'Confirm on your ABT Wallet',
            success: 'Application Created',
          }}
        />
      )}
    </React.Fragment>
  );
}

TargetDid.propTypes = {};
