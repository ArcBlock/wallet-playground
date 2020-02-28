/* eslint-disable object-curly-newline */
/* eslint-disable react/jsx-one-expression-per-line */
import React, { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import mustache from 'mustache';

import CircularProgress from '@material-ui/core/CircularProgress';
import Auth from '@arcblock/did-react/lib/Auth';
import Button from '@arcblock/ux/lib/Button';
import { mergeProps } from '@arcblock/ux/lib/Util';

import { SessionContext } from './session';
import { actions, getActionName, getActionParams } from './actions';

function getMessage(message, session) {
  try {
    return mustache.render(message, { user: session.user || {}, token: session.token || {} });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Cannot render message', { message, session });
    return message;
  }
}

export default function PlaygroundAction(props) {
  const newProps = mergeProps(props, PlaygroundAction, ['buttonRounded', 'extraParams', 'timeout']);
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

  // If this is just a login button, we do not do anything actually
  if (action === 'login') {
    if (session.user) {
      return (
        <Button
          {...rest}
          rounded={buttonRounded}
          color={buttonColor}
          variant={buttonVariant}
          size={buttonSize}
          disabled>
          {getMessage(successMessage || `Hello ${session.user.name}`, session)}
        </Button>
      );
    }

    return (
      <Button
        {...rest}
        rounded={buttonRounded}
        color={buttonColor}
        variant={buttonVariant}
        size={buttonSize}
        onClick={() => session.login()}>
        {getMessage(buttonText || title, session)}
      </Button>
    );
  }

  const config = actions[action];
  if (!actions[action]) {
    throw new Error(`Unsupported playground action ${action}`);
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
        {getMessage(buttonText || title, session)} {loading && <CircularProgress size={12} color="#fff" />}
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
            title: getMessage(title, session),
            scan: getMessage(scanMessage, session),
            confirm: getMessage(confirmMessage, session),
            success: getMessage(successMessage, session),
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
