/* eslint-disable react/jsx-one-expression-per-line */
import React from 'react';
import PropTypes from 'prop-types';
import useToggle from 'react-use/lib/useToggle';
import capitalize from 'lodash/capitalize';

import Auth from '@arcblock/did-react/lib/Auth';
import Button from '@arcblock/ux/lib/Button';

import api from '../../libs/api';

export default function SignatureClaim({ type }) {
  const [isOpen, setOpen] = useToggle(false);

  return (
    <React.Fragment>
      <Button color="secondary" variant="contained" size="large" className="action" onClick={() => setOpen(true)}>
        Sign {capitalize(type)}
      </Button>
      {isOpen && (
        <Auth
          responsive
          action="claim_signature"
          extraParams={{ type }}
          checkFn={api.get}
          socketUrl={api.socketUrl}
          onClose={() => setOpen()}
          onSuccess={() => window.location.reload()}
          messages={{
            title: `Sign ${capitalize(type)}`,
            scan: `Scan QR code to get the ${type} claim`,
            confirm: 'Confirm on your ABT Wallet',
            success: 'Claim processed',
          }}
        />
      )}
    </React.Fragment>
  );
}

SignatureClaim.propTypes = {
  type: PropTypes.string,
};

SignatureClaim.defaultProps = {
  type: 'transaction',
  // type: 'text',
  // type: 'html',
};
