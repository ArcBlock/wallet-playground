/* eslint-disable react/jsx-one-expression-per-line */
import React, { useContext } from 'react';
import styled from 'styled-components';
import useAsyncFn from 'react-use/lib/useAsyncFn';
import useToggle from 'react-use/lib/useToggle';
import { fromUnitToToken } from '@arcblock/forge-util';
import { SessionContext } from '@arcblock/did-playground';

import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';
import Avatar from '@arcblock/did-react/lib/Avatar';
import Button from '@arcblock/ux/lib/Button';

import Layout from '../components/layout';

export default function ProfilePage() {
  const { session } = useContext(SessionContext);

  const onLogout = () => {
    session.logout();
    window.location.href = '/';
  };

  const { user, token } = session;

  return (
    <Layout title="Profile">
      <Main>
        <Grid container spacing={6}>
          <Grid item xs={12} md={3} className="avatar">
            <Avatar size={240} did={user.did} />
            <Button color="secondary" variant="contained" href="/orders" style={{ marginBottom: 30 }}>
              My Orders
            </Button>
            <Button color="danger" variant="contained" onClick={onLogout}>
              Logout
            </Button>
          </Grid>
          <Grid item xs={12} md={9} className="meta">
            <Typography component="h3" variant="h4">
              My Profile
            </Typography>
            <List>
              <ListItem className="meta-item">
                <ListItemText primary={user.did} secondary="DID" />
              </ListItem>
              <ListItem className="meta-item">
                <ListItemText primary={user.name || '-'} secondary="Name" />
              </ListItem>
              <ListItem className="meta-item">
                <ListItemText primary={user.email || '-'} secondary="Email" />
              </ListItem>
              <ListItem className="meta-item">
                <ListItemText primary={user.mobile || '-'} secondary="Phone" />
              </ListItem>
              <ListItem className="meta-item">
                <ListItemText
                  primary={`${fromUnitToToken(session.balance.local, token.local.decimal)} ${token.local.symbol}`}
                  secondary="Local Balance"
                />
              </ListItem>
              <ListItem className="meta-item">
                <ListItemText
                  primary={`${fromUnitToToken(session.balance.foreign, token.foreign.decimal)} ${token.foreign.symbol}`}
                  secondary="Foreign Balance"
                />
              </ListItem>
            </List>
          </Grid>
        </Grid>
      </Main>
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
`;
