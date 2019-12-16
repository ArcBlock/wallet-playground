/* eslint-disable react/jsx-one-expression-per-line */
import React, { useState } from 'react';
import PropTypes from 'prop-types';

import Auth from '@arcblock/did-react/lib/Auth';
import Button from '@arcblock/ux/lib/Button';

import Alert from '../alert';
import api from '../../libs/api';

export default function GeneralAuthButton({ button, action, messages, extraParams }) {
  const [isOpen, setOpen] = useState(false);
  const [isComplete, setComplete] = useState(false);
  return (
    <React.Fragment>
      <Button color="secondary" variant="contained" size="large" className="action" onClick={() => setOpen(true)}>
        {button}
      </Button>
      {isOpen && !isComplete && (
        <Auth
          responsive
          action={action}
          checkFn={api.get}
          socketUrl={api.socketUrl}
          onClose={() => setOpen(false)}
          checkTimeout={5 * 60 * 1000}
          extraParams={extraParams}
          onSuccess={() => setComplete(true)}
          messages={messages}
        />
      )}
      {isComplete && <Alert onClose={() => setComplete(false)} message={messages.success} />}
    </React.Fragment>
  );
}

GeneralAuthButton.propTypes = {
  button: PropTypes.string.isRequired,
  action: PropTypes.string.isRequired,
  messages: PropTypes.object.isRequired,
  extraParams: PropTypes.object,
};

GeneralAuthButton.defaultProps = {
  extraParams: {},
};
