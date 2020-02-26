/* eslint-disable object-curly-newline */
/* eslint-disable react/jsx-one-expression-per-line */
import React, { useContext, useState } from 'react';
import PropTypes from 'prop-types';

import CircularProgress from '@material-ui/core/CircularProgress';
import Auth from '@arcblock/did-react/lib/Auth';
import Button from '@arcblock/ux/lib/Button';

import { SessionContext } from './session';

async function createSwapOrder(api) {
  const res = await api.post('/api/swap', {});
  return { traceId: res.data.traceId };
}

// A white list of supported buttons
const actions = {
  // Currency
  recharge_local: 'fund_local',
  recharge_foreign: 'fund_foreign',
  exchange_to_foreign: {
    action: 'swap_token',
    onStart: createSwapOrder,
    extraParams: props => ({ action: 'buy', rate: props.exchangeRate }),
  },
  exchange_to_local: {
    action: 'swap_token',
    onStart: createSwapOrder,
    extraParams: props => ({ action: 'sell', rate: props.exchangeRate }),
  },

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

const getActionName = (config, props) => {
  if (typeof config === 'string') {
    return config;
  }

  if (typeof config.action === 'string') {
    return config.action;
  }

  if (typeof config.action === 'function') {
    return config.action(props);
  }

  throw new Error('Cannot determine playground button action');
};

const getActionParams = (config, props) => {
  if (typeof config === 'string') {
    return {};
  }

  if (typeof config.extraParams === 'object') {
    return config.extraParams;
  }

  if (typeof config.extraParams === 'function') {
    return config.extraParams(props);
  }

  return {};
};

export default function PlaygroundAction({
  action,
  buttonText,
  buttonColor,
  buttonVariant,
  buttonSize,
  buttonRounded,
  title,
  scanMessage,
  successMessage,
  confirmMessage,
  extraParams,
  timeout,
  ...rest
}) {
  const { api, session } = useContext(SessionContext);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dynamicParams, setDynamicParams] = useState({});

  const config = actions[action];
  if (!actions[action]) {
    throw new Error(`Supported playground action type ${action}`);
  }

  const onStart = async () => {
    if (typeof config.onStart === 'function') {
      try {
        setLoading(true);
        const params = await config.onStart(api, session);
        setDynamicParams(params);
        setLoading(false);
      } catch (err) {
        console.error(`Cannot generate dynamicParams for playground action ${getActionName(config, rest)}`);
      }
      setOpen(true);
    } else {
      setOpen(true);
    }
  };

  return (
    <React.Fragment>
      <Button
        {...rest}
        rounded={buttonRounded}
        color={buttonColor}
        variant={buttonVariant}
        size={buttonSize}
        onClick={onStart}>
        {buttonText} {loading && <CircularProgress size={12} color="#fff" />}
      </Button>
      {open && (
        <Auth
          responsive
          action={getActionName(config, rest)}
          checkFn={api.get}
          onClose={() => setOpen(false)}
          onSuccess={() => setOpen(false)}
          checkTimeout={timeout}
          // 3 layers of extraParams: user props, dynamically generated, from other props
          extraParams={Object.assign(getActionParams(config, rest), dynamicParams, extraParams)}
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
  buttonRounded: PropTypes.bool,
  title: PropTypes.string.isRequired,
  scanMessage: PropTypes.string,
  successMessage: PropTypes.string,
  confirmMessage: PropTypes.string,
  extraParams: PropTypes.object,
  timeout: PropTypes.number,
};

PlaygroundAction.defaultProps = {
  buttonColor: 'primary', // primary | secondary | reverse | error
  buttonVariant: 'contained', // contained | outlined | default
  buttonSize: 'large', // small | large | medium
  buttonRounded: false,
  scanMessage: 'Scan the QRCode with your ABT Wallet',
  confirmMessage: 'Confirm in your ABT Wallet',
  successMessage: 'Operation success!',
  extraParams: {},
  timeout: 5 * 60 * 1000,
};
