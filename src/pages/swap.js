import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import useAsync from 'react-use/lib/useAsync';
import useToggle from 'react-use/lib/useToggle';

import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Grid from '@material-ui/core/Grid';
import Auth from '@arcblock/did-react/lib/Auth';
import Avatar from '@arcblock/did-react/lib/Avatar';

import Layout from '../components/layout';
import api from '../libs/api';
import { onAuthError } from '../libs/auth';

async function fetchStatus() {
  const [{ data: session }] = await Promise.all([api.get('/api/session')]);
  return { session };
}

export default function PaymentPage() {
  const state = useAsync(fetchStatus);
  const [open, toggle] = useToggle(false);
  const [traceId, setTraceId] = useState();

  const onStartSwap = async () => {
    const res = await api.post('/api/swap', {});
    console.log(res.data);
    if (res.data.traceId) {
      setTraceId(res.data.traceId);
      toggle(true);
    } else {
      window.alert('Cannot create swap');
    }
  };

  if (state.loading || !state.value) {
    return (
      <Layout title="Swap">
        <Main>
          <CircularProgress />
        </Main>
      </Layout>
    );
  }

  if (state.error) {
    return (
      <Layout title="Swap">
        <Main>{state.error.message}</Main>
      </Layout>
    );
  }

  if (!state.value.session.user) {
    window.location.href = '/?openLogin=true';
    return null;
  }

  const {
    session: { user, token },
  } = state.value;
  return (
    <Layout title="Swap">
      <Main symbol={token.symbol}>
        <Grid container spacing={6}>
          <Grid item xs={12} md={3} className="avatar">
            <Avatar size={240} did={user.did} />
            <Button color="secondary" variant="contained" onClick={onStartSwap}>
              Make Swap
            </Button>
            <Button color="primary" variant="outlined" href="/profile" style={{ marginTop: '30px' }}>
              My Profile
            </Button>
          </Grid>
          <Grid item xs={12} md={9} className="meta">
            <Typography component="h3" variant="h4">
              Secret Document
            </Typography>
          </Grid>
        </Grid>
      </Main>
      {open && !!traceId && (
        <Auth
          responsive
          action="swap"
          extraParams={{ traceId }}
          checkFn={api.get}
          onError={onAuthError}
          onClose={() => toggle()}
          onSuccess={() => window.location.reload()}
          messages={{
            title: 'Swap Required',
            scan: `Pay 2 ${token.symbol} to view secret document`,
            confirm: 'Confirm payment on your ABT Wallet',
            success: 'You have successfully paid!',
          }}
        />
      )}
    </Layout>
  );
}

const Main = styled.main`
  margin: 80px 0;
  display: flex;

  .avatar {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-center;

    svg {
      margin-bottom: 40px;
    }
  }

  .meta {
    display: flex;
    flex-grow: 1;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
  }

  .meta-item {
    padding-left: 0;
  }

  .document {
    margin-top: 30px;
    position: relative;
    width: 800px;

    .document__body {
      filter: blur(4px);
      text-align: justify;
      user-select: none;
    }

    &:after {
      color: #dd2233;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans',
        'Helvetica Neue', sans-serif;
      content: 'Pay 2 ${props => props.symbol} to view this document';
      font-size: 30px;
      line-height: 45px;
      border-radius: 15px;
      padding: 15px;
      font-weight: bold;
      position: absolute;
      text-transform: uppercase;
      animation: blink 800ms ease;
      border: 0.5rem double #dd2233;
      top: 35%;
      left: 15%;
    }

    @keyframes blink {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
  }

  .document--unlocked {
    .document__body {
      filter: none;
    }

    &:after {
      display: none;
    }
  }
`;
