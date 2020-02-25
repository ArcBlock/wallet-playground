/* eslint-disable object-curly-newline */
/* eslint-disable react/jsx-one-expression-per-line */
import React, { useContext, useState } from 'react';
import PropTypes from 'prop-types';

import Auth from '@arcblock/did-react/lib/Auth';
import Button from '@arcblock/ux/lib/Button';

import { SessionContext } from './session';

// A white list of supported buttons
const actions = {
  // Currency
  recharge_local: 'fund_local',
  recharge_foreign: 'fund_foreign',
  swap_to_foreign: 'swap_token',
  swap_to_local: 'swap_token',

  // Atomic swap
  buy_foreign_badge: 'swap_badge',
  sell_foreign_badge: 'swap_badge',
  buy_foreign_certificate: 'swap_certificate',
  sell_foreign_certificate: 'swap_certificate',
  buy_foreign_ticket: 'swap_ticket',
  sell_foreign_ticket: 'swap_ticket',

  // Exchange
  buy_local_badge: 'swap_badge',
  sell_local_badge: 'swap_badge',
  buy_local_certificate: 'swap_certificate',
  sell_local_certificate: 'swap_certificate',
  buy_local_ticket: 'swap_ticket',
  sell_local_ticket: 'swap_ticket',
};

export default function PlaygroundAction({
  action,
  buttonText,
  buttonColor,
  buttonVariant,
  buttonSize,
  title,
  scanMessage,
  successMessage,
  confirmMessage,
  extraParams,
  ...rest
}) {
  const { api } = useContext(SessionContext);
  const [open, setOpen] = useState(false);

  if (!actions[action]) {
    throw new Error(`Supported playground action type ${action}`);
  }

  return (
    <React.Fragment>
      <Button {...rest} color={buttonColor} variant={buttonVariant} size={buttonSize} onClick={() => setOpen(true)}>
        {buttonText}
      </Button>
      {open && (
        <Auth
          responsive
          action={actions[action]}
          checkFn={api.get}
          onClose={() => setOpen(false)}
          onSuccess={() => setOpen(false)}
          extraParams={extraParams}
          messages={{
            title,
            scan: scanMessage,
            confirm: confirmMessage,
            success: successMessage,
          }}
        />
      )}
    </React.Fragment>
  );
}

PlaygroundAction.propTypes = {
  action: PropTypes.string.isRequired,
  buttonText: PropTypes.string.isRequired,
  buttonColor: PropTypes.string,
  buttonVariant: PropTypes.string,
  buttonSize: PropTypes.string,
  title: PropTypes.string.isRequired,
  scanMessage: PropTypes.string,
  successMessage: PropTypes.string,
  confirmMessage: PropTypes.string,
  extraParams: PropTypes.object,
};

PlaygroundAction.defaultProps = {
  buttonColor: 'primary', // primary | secondary | reverse | error
  buttonVariant: 'contained', // contained | outlined | default
  buttonSize: 'large', // small | large | medium
  scanMessage: 'Scan the QRCode with your ABT Wallet',
  confirmMessage: 'Confirm in your ABT Wallet',
  successMessage: 'Operation success!',
  extraParams: {},
};
