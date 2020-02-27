/* eslint-disable object-curly-newline */
/* eslint-disable react/jsx-one-expression-per-line */
import React, { useContext, useState } from 'react';
import PropTypes from 'prop-types';

import CircularProgress from '@material-ui/core/CircularProgress';
import Auth from '@arcblock/did-react/lib/Auth';
import Button from '@arcblock/ux/lib/Button';
import { mergeProps } from '@arcblock/ux/lib/Util';

import { SessionContext } from './session';

async function createSwapOrder(api) {
  const res = await api.post('/api/swap', {});
  return { traceId: res.data.traceId };
}

const actions = {
  // Currency
  receive_local_token: {
    action: 'receive_token',
    extraParams: props => ({ chain: 'local', amount: props.amount || 1 }),
  },
  receive_foreign_token: {
    action: 'receive_token',
    extraParams: props => ({ chain: 'foreign', amount: props.amount || 1 }),
  },
  send_local_token: {
    action: 'send_token',
    extraParams: props => ({ chain: 'local', amount: props.amount || 1 }),
  },
  send_foreign_token: {
    action: 'send_token',
    extraParams: props => ({ chain: 'foreign', amount: props.amount || 1 }),
  },
  exchange_to_foreign_token: {
    action: 'swap_token',
    onStart: createSwapOrder,
    extraParams: props => ({ action: 'buy', rate: props.exchangeRate, amount: props.amount || 1 }),
  },
  exchange_to_local_token: {
    action: 'swap_token',
    onStart: createSwapOrder,
    extraParams: props => ({ action: 'sell', rate: props.exchangeRate, amount: props.amount || 1 }),
  },
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

  if (!config.extraParams) {
    return {};
  }

  if (typeof config.extraParams === 'function') {
    return config.extraParams(props);
  }

  if (typeof config.extraParams === 'object') {
    return config.extraParams;
  }

  return {};
};

export default function PlaygroundAction(props) {
  const newProps = mergeProps(props, PlaygroundAction, []);
  const {
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
  } = newProps;

  const { api, session } = useContext(SessionContext);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dynamicParams, setDynamicParams] = useState({});

  const config = actions[action];
  if (!actions[action]) {
    throw new Error(`Supported playground action type ${action}`);
  }

  const doStart = async () => {
    if (typeof config.onStart === 'function') {
      try {
        setLoading(true);
        const params = await config.onStart(api, session);
        setDynamicParams(params);
        setLoading(false);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(`Cannot generate dynamicParams for playground action ${getActionName(config, rest)}`);
      }
      setOpen(true);
    } else {
      setOpen(true);
    }
  };

  const onStart = async () => {
    if (!session.user) {
      session.login(doStart);
      return;
    }

    await doStart();
  };

  const onClose = () => setOpen(false);
  const onSuccess = () => setTimeout(onClose, 2000);

  return (
    <React.Fragment>
      <Button
        {...rest}
        rounded={buttonRounded}
        color={buttonColor}
        variant={buttonVariant}
        size={buttonSize}
        onClick={onStart}>
        {buttonText || title} {loading && <CircularProgress size={12} color="#fff" />}
      </Button>
      {open && (
        <Auth
          responsive
          action={getActionName(config, rest)}
          checkFn={api.get}
          onClose={onClose}
          onSuccess={onSuccess}
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
  buttonText: PropTypes.string,
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
  buttonText: '',
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
