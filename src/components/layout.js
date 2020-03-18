import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Helmet from 'react-helmet';
import Footer from '@arcblock/ux/lib/Footer';
import Link from '@material-ui/core/Link';

import AppBar from '@material-ui/core/AppBar';
import Container from '@material-ui/core/Container';
import Drawer from '@material-ui/core/Drawer';
import Divider from '@material-ui/core/Divider';
import Hidden from '@material-ui/core/Hidden';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import { makeStyles } from '@material-ui/core/styles';

import env from '../libs/env';

const drawerWidth = 240;

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
  },
  drawer: {
    [theme.breakpoints.up('md')]: {
      width: drawerWidth,
      flexShrink: 0,
    },
  },
  appBar: {
    [theme.breakpoints.up('md')]: {
      width: `calc(100% - ${drawerWidth}px)`,
      marginLeft: drawerWidth,
    },
  },
  menuButton: {
    marginRight: theme.spacing(2),
    [theme.breakpoints.up('md')]: {
      display: 'none',
    },
  },
  toolbar: theme.mixins.toolbar,
  drawerPaper: {
    width: drawerWidth,
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
}));

export default function Layout({ title, children, contentOnly }) {
  const classes = useStyles();
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const getExplorerUrl = (chainHost, type) => {
    if (window.env) {
      if (window.env.localChainExplorer && type === 'local') {
        return window.env.localChainExplorer;
      }
      if (window.env.foreignChainExplorer && type === 'foreign') {
        return window.env.foreignChainExplorer;
      }
    }

    const [host] = chainHost.split('/api');
    return `${host}/node/explorer/txs`;
  };

  const onToggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  if (contentOnly) {
    return <Container>{children}</Container>;
  }

  const drawer = (
    <div>
      <div className={classes.toolbar} />
      <Divider />
      <List>
        <Link href="/">
          <ListItem button>
            <ListItemText primary="Home" />
          </ListItem>
        </Link>
        <Link href="/full">
          <ListItem button>
            <ListItemText primary="Everything" />
          </ListItem>
        </Link>
        <Link href="/profile">
          <ListItem button>
            <ListItemText primary="Profile" />
          </ListItem>
        </Link>
        <Link href="/orders" className="nav-item">
          <ListItem button>
            <ListItemText primary="Orders" />
          </ListItem>
        </Link>
      </List>
      <Divider />
      <List>
        <Link href="https://www.arcblock.io/en/try-identity-now/" target="_blank" className="nav-item">
          <ListItem button>
            <ListItemText primary="I DID It " />
          </ListItem>
        </Link>
        {!!env.chainHost && (
          <Link href={getExplorerUrl(env.chainHost, 'local')} target="_blank" className="nav-item">
            <ListItem button>
              <ListItemText primary="Local Chain" />
            </ListItem>
          </Link>
        )}
        {!!env.assetChainHost && (
          <Link href={getExplorerUrl(env.assetChainHost, 'foreign')} target="_blank" className="nav-item">
            <ListItem button>
              <ListItemText primary="Foreign Chain" />
            </ListItem>
          </Link>
        )}
        <Link href="https://github.com/ArcBlock/wallet-playground" target="_blank" className="nav-item">
          <ListItem button>
            <ListItemText primary="GitHub " />
          </ListItem>
        </Link>
      </List>
    </div>
  );

  return (
    <Div className={classes.root}>
      <Helmet title={`${title} - ${env.appName}`} />
      <AppBar position="fixed" className={classes.appBar} color="default" style={{ height: 56 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={onToggleDrawer}
            className={classes.menuButton}>
            <MenuIcon />
          </IconButton>
          <Typography href="/" component="a" variant="h6" color="inherit" noWrap className="brand">
            {env.appName}
          </Typography>
        </Toolbar>
      </AppBar>
      <nav className={classes.drawer} aria-label="mailbox folders">
        <Hidden smUp implementation="css">
          <Drawer
            variant="temporary"
            open={drawerOpen}
            onClose={onToggleDrawer}
            classes={{
              paper: classes.drawerPaper,
            }}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile.
            }}>
            {drawer}
          </Drawer>
        </Hidden>
        <Hidden xsDown implementation="css">
          <Drawer
            classes={{
              paper: classes.drawerPaper,
            }}
            variant="permanent"
            open>
            {drawer}
          </Drawer>
        </Hidden>
      </nav>
      <div className={classes.content}>
        <div className={classes.toolbar} />
        {children}
        <Footer />
      </div>
    </Div>
  );
}

Layout.propTypes = {
  title: PropTypes.string.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  children: PropTypes.any.isRequired,
  contentOnly: PropTypes.bool,
};

Layout.defaultProps = {
  contentOnly: false,
};

const Div = styled.div`
  .brand {
    margin-right: 60px;
    cursor: pointer;
    display: flex;
    justify-content: flex-start;
    align-items: center;

    .logo {
      width: 140px;
      margin-right: 16px;
    }
  }
`;
