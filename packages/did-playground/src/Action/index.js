/* eslint-disable object-curly-newline */
/* eslint-disable react/jsx-one-expression-per-line */
import React, { useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import mustache from 'mustache';
import useWindowSize from 'react-use/lib/useWindowSize';
import styled from 'styled-components';

import CircularProgress from '@material-ui/core/CircularProgress';
import BasicAuth from '@arcblock/did-react/lib/Auth/basic';
import Button from '@arcblock/ux/lib/Button';
import { mergeProps } from '@arcblock/ux/lib/Util';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import { withTheme } from '@material-ui/core/styles';

import { SessionContext } from './session';
import { actions, getActionName, getActionParams } from './actions';

function getMessage(message, session) {
  try {
    return mustache.render(
      message,
      {
        user: session.user || {},
        token: session.token || {},
        balance: session.balance || {},
      },
      {},
      ['(%', '%)']
    );
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Cannot render message', { message, session });
    return message;
  }
}

function Close({ onClose }) {
  return <CloseContainer onClick={onClose}>&times;</CloseContainer>;
}

Close.propTypes = { onClose: PropTypes.func.isRequired };
const CloseContainer = styled.div`
  display: ${props => (props.disableClose ? 'none' : 'block')};
  position: absolute;
  top: 1rem;
  right: 1rem;
  color: #999999;
  font-size: 2rem;
  line-height: 1rem;
  cursor: pointer;
  user-select: none;
`;

function PlaygroundAction(props) {
  const newProps = mergeProps(props, PlaygroundAction, ['buttonRounded', 'extraParams', 'timeout']);
  const {
    autoClose,
    action,
    buttonText,
    buttonColor,
    buttonVariant,
    buttonSize,
    buttonRounded,
    children,
    disableClose,
    title,
    scanMessage,
    successMessage,
    successUrl,
    successTarget,
    frameProps,
    confirmMessage,
    extraParams,
    timeout,
    theme,
    ...rest
  } = newProps;

  const { api, session } = useContext(SessionContext);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dynamicParams, setDynamicParams] = useState({});
  const { width } = useWindowSize();
  const [success, setSuccess] = useState(false);
  const [showFrame, setShowFrame] = useState(success && successUrl && successTarget === 'frame');

  // 当打开或关闭组件时，重置部分状态
  useEffect(
    () => () => {
      setSuccess(false);
      setShowFrame(false);
    },
    [open]
  );

  // If this is just a login button, we do not do anything actually
  if (action === 'login') {
    if (session.user) {
      return (
        <Button {...rest} rounded={buttonRounded} color={buttonColor} variant={buttonVariant} size={buttonSize}>
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

  const onSuccess = () => {
    setSuccess(true);
    if (successUrl) {
      if (successTarget === 'frame') {
        setShowFrame(!!successUrl);
      } else if (successTarget === '_blank') {
        window.open(successUrl, '_blank');
      } else {
        window.open(successUrl, '_self');
      }
    } else if (autoClose) {
      setTimeout(onClose, 2000);
    }
  };

  const renderRedirectUrlAfterSuccess = () => (
    <React.Fragment>
      <Close onClose={onClose} />
      <div>
        Redirecting to{' '}
        <a href={successUrl} target={successTarget}>
          {successUrl}
        </a>
      </div>
    </React.Fragment>
  );

  const renderFrameAfterSuccess = () => (
    <React.Fragment>
      <Close onClose={onClose} />
      <iframe
        style={{ width: '100%', height: '100%' }}
        allow="fullscreen"
        id="successFrame"
        title="successFrame"
        src={successUrl}
        {...frameProps}
      />
    </React.Fragment>
  );

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
        <Dialog
          open
          disableBackdropClick
          disableEscapeKeyDown
          fullScreen={width < theme.breakpoints.values.sm}
          fullWidth={showFrame}
          maxWidth={showFrame ? 'lg' : ''}>
          <DialogContent
            style={{
              padding: success && !showFrame && successUrl ? 55 : 0,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: showFrame ? theme.breakpoints.values.md : '',
            }}>
            {successUrl && success && !showFrame && renderRedirectUrlAfterSuccess()}
            {showFrame && renderFrameAfterSuccess()}
            {(!successUrl || (successUrl && !success)) && (
              <BasicAuth
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
                  success: children || getMessage(successMessage, session),
                }}
              />
            )}
          </DialogContent>
        </Dialog>
      )}
    </React.Fragment>
  );
}

PlaygroundAction.propTypes = {
  action: PropTypes.string.isRequired,
  autoClose: PropTypes.bool,
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
  successUrl: PropTypes.string,
  successTarget: PropTypes.oneOf(['_blank', '_self', 'frame']),
  frameProps: PropTypes.object,
};

PlaygroundAction.defaultProps = {
  autoClose: true, // 只在没有 successUrl 属性下有效
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
  successUrl: '',
  successTarget: 'self',
  frameProps: {},
};

export default withTheme(PlaygroundAction);
