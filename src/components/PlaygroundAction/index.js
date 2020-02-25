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
  ChargeLocal: 'fund_local',
  ChargeForeign: 'fund_foreign',
  SwapToken: 'swap_token',

  // Atomic swap
  BuyForeignBadge: 'swap_badge',
  SellForeignBadge: 'swap_badge',
  BuyForeignCertificate: 'swap_certificate',
  SellForeignCertificate: 'swap_certificate',
  BuyForeignTicket: 'swap_ticket',
  SellForeignTicket: 'swap_ticket',

  // Exchange
  BuyLocalBadge: 'swap_badge',
  SellLocalBadge: 'swap_badge',
  BuyLocalCertificate: 'swap_certificate',
  SellLocalCertificate: 'swap_certificate',
  BuyLocalTicket: 'swap_ticket',
  SellLocalTicket: 'swap_ticket',
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
}) {
  const { api } = useContext(SessionContext);
  const [open, setOpen] = useState(false);

  return (
    <React.Fragment>
      <Button color={buttonColor} variant={buttonVariant} size={buttonSize} onClick={() => setOpen(true)}>
        {buttonText}
      </Button>
      {open && (
        <Auth
          responsive
          action={action}
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
