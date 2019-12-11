/* eslint-disable react/jsx-one-expression-per-line */
import React from 'react';
import PropTypes from 'prop-types';
import useToggle from 'react-use/lib/useToggle';
import useAsync from 'react-use/lib/useAsync';
import { fromUnitToToken } from '@arcblock/forge-util';

import Auth from '@arcblock/did-react/lib/Auth';
import Button from '@arcblock/ux/lib/Button';

import api from '../../libs/api';
import forge from '../../libs/sdk';
import env from '../../libs/env';

export default function Fund({ user, assetToken }) {
  const [isOpen, setOpen] = useToggle(false);
  const account = useAsync(async () => {
    const res = await forge.getAccountState({ address: user.did }, { conn: env.assetChainId });
    return res.state;
  });

  return (
    <React.Fragment>
      <Button color="secondary" variant="contained" size="large" className="action" onClick={() => setOpen(true)}>
        Get {assetToken.symbol}!{' '}
        {account.value && (
          <strong>
            Balance: {fromUnitToToken(account.value.balance, assetToken.decimal)} {assetToken.symbol}
          </strong>
        )}
      </Button>
      {isOpen && (
        <Auth
          responsive
          action="fund_tba"
          checkFn={api.get}
          socketUrl={api.socketUrl}
          onClose={() => setOpen()}
          onSuccess={() => window.location.reload()}
          messages={{
            title: 'Get random lucky tokens for FREE',
            scan: 'Scan QR code to get tokens for FREE',
            confirm: 'Confirm on your ABT Wallet',
            success: 'Lucky tokens sent to your account',
          }}
        />
      )}
    </React.Fragment>
  );
}

Fund.propTypes = {
  user: PropTypes.object.isRequired,
  assetToken: PropTypes.object.isRequired,
};
