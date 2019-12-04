/* eslint-disable react/jsx-one-expression-per-line */
import React from 'react';
import useToggle from 'react-use/lib/useToggle';
import PrompTypes from 'prop-types';

import Auth from '@arcblock/did-react/lib/Auth';
import Button from '@arcblock/ux/lib/Button';

import api from '../../libs/api';

export default function AcquireMovieTicket({ count }) {
  const [isOpen, setOpen] = useToggle(false);

  return (
    <React.Fragment>
      <Button
        color="secondary"
        variant="contained"
        size="large"
        className="action"
        onClick={() => setOpen(true)}>
        Acquire {count} movie {count <= 1 ? 'ticket' : 'tickets'}
      </Button>
      {isOpen && (
        <Auth
          responsive
          action="did_auth_acquire"
          checkFn={api.get}
          onClose={() => setOpen()}
          onSuccess={() => window.location.reload()}
          messages={{
            title: 'Scan QR Required',
            scan: 'Scan QR code to get ticket',
            confirm: 'Confirm the authentication on your ABT Wallet',
            success: 'Acquire success!',
          }}
          extraParams={{
            count,
          }}
        />
      )}
    </React.Fragment>
  );
}

AcquireMovieTicket.propTypes = {
  count: PrompTypes.number,
};

AcquireMovieTicket.defaultProps = {
  count: 1,
};
