import React, { useState } from 'react';
import Grid from '@material-ui/core/Grid';

// components
import MenuButton from './MenuButton';
import GraphComponentTest from './GraphComponentTest';
import GraphComponent from './GraphComponent';
import TableView from './TableView';
import TableViewComponent from './TableViewComponent';

// layout
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import Drawer from '@material-ui/core/Drawer';
import Box from '@material-ui/core/Box';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import Badge from '@material-ui/core/Badge';
import Container from '@material-ui/core/Container';
import Paper from '@material-ui/core/Paper';
import Link from '@material-ui/core/Link';
import LinearProgress from '@material-ui/core/LinearProgress';

// menu
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';

// icons
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import NotificationsIcon from '@material-ui/icons/Notifications';
import PersonIcon from '@material-ui/icons/Person';
import DashboardIcon from '@material-ui/icons/Dashboard';
import TableChartIcon from '@material-ui/icons/TableChart';
import EditIcon from '@material-ui/icons/Edit';

import './App.css';

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
        root: {
            display: 'flex',
        },
        toolbar: {
            paddingRight: 24, // keep right padding when drawer closed
        },
        toolbarIcon: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            padding: '0 8px',
            ...theme.mixins.toolbar,
        },
        appBar: {
            zIndex: theme.zIndex.drawer + 1,
            transition: theme.transitions.create(['width', 'margin'], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
            }),
        },
        appBarShift: {
            marginLeft: drawerWidth,
            width: `calc(100% - ${drawerWidth}px)`,
            transition: theme.transitions.create(['width', 'margin'], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
            }),
        },
        menuButton: {
            marginRight: 36,
        },
        menuButtonHidden: {
            display: 'none',
        },
        title: {
            flexGrow: 1,
        },
        drawerPaper: {
            position: 'relative',
            whiteSpace: 'nowrap',
            width: drawerWidth,
            transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
            }),
        },
        drawerPaperClose: {
            overflowX: 'hidden',
            transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
            }),
            width: theme.spacing(7),
            [theme.breakpoints.up('sm')]: {
                width: theme.spacing(9),
            },
        },
        appBarSpacer: theme.mixins.toolbar,
        content: {
            flexGrow: 1,
            height: '100vh',
            overflow: 'auto',
        },
        container: {
            paddingTop: theme.spacing(4),
            paddingBottom: theme.spacing(4),
        },
        paper: {
            padding: theme.spacing(2),
            display: 'flex',
            overflow: 'auto',
            flexDirection: 'column',
        },
        fixedHeight: {
            height: 240,
        },
    }));

function App() {
    const classes = useStyles();
    const [open, setOpen] = React.useState(false);
    const handleDrawerOpen = () => {
        setOpen(true);
    };
    const handleDrawerClose = () => {
        setOpen(false);
    };
    const fixedHeightPaper = clsx(classes.paper, classes.fixedHeight);

    const [tableViewToggled, setTableViewToggled] = useState(true);
    const [tableViewSideToggled, setTableViewSideToggled] = useState(false);

    function toggleTableView() {
        setTableViewToggled(!tableViewToggled);
    }

    function toggleTableViewSide() {
        setTableViewSideToggled(!tableViewSideToggled);
    }

  return (
      <div className={classes.root}>
      <LinearProgress />
      <CssBaseline />
      
      <AppBar position="absolute" className={clsx(classes.appBar, open && classes.appBarShift)}>
          <Toolbar className={classes.toolbar}>
              <IconButton
                  edge="start"
                  color="inherit"
                  aria-label="open drawer"
                  onClick={handleDrawerOpen}
                  className={clsx(classes.menuButton, open && classes.menuButtonHidden)}
                  >
                  <MenuIcon />
              </IconButton>
              <Typography component="h1" variant="h6" color="inherit" noWrap className={classes.title}>
                  Web Constellation
              </Typography>
              <IconButton color="inherit">
                  <Badge badgeContent={4} color="secondary">
                      <NotificationsIcon />
                  </Badge>
              </IconButton>
              <IconButton color="inherit">
                  <PersonIcon />
              </IconButton>
          </Toolbar>
      </AppBar>
      
      <Drawer
          variant="permanent"
          classes={{
            paper: clsx(classes.drawerPaper, !open && classes.drawerPaperClose),
            }}
          open={open}
          >
          <div className={classes.toolbarIcon}>
              <IconButton onClick={handleDrawerClose}>
                  <ChevronLeftIcon />
              </IconButton>
          </div>
          <Divider />
          <List>  
          <ListItem button>
              <ListItemIcon>
                  <DashboardIcon/>
              </ListItemIcon>
              <ListItemText primary="Dashboard" />
          </ListItem>
          <ListItem button>
              <ListItemIcon>
                  <EditIcon onClick={toggleTableViewSide} />
              </ListItemIcon>
              <ListItemText primary="Attribute Editor" />
          </ListItem>
          <ListItem button>
              <ListItemIcon>
                  <TableChartIcon onClick={toggleTableView} />
              </ListItemIcon>
              <ListItemText primary="Table View" />
          </ListItem>
          </List>
      </Drawer>
      
      <main className={classes.content}>
          <div className={classes.appBarSpacer} />
          <Container maxWidth="false" className={classes.container}>
            <Grid container spacing={3}>
              {/* Side View */}
              {tableViewSideToggled &&
              <Grid item xs={tableViewSideToggled ? 4 : 12}>
                <Paper className={classes.paper}>
                  <h3>Attribute Editor</h3>
                  <TableViewComponent />
                </Paper>
              </Grid>
              }

              {/* Graph */}
              <Grid item xs={tableViewSideToggled ? 8 : 12}>
                <Paper className={classes.paper}>
                  <GraphComponent />
                </Paper>
              </Grid>

              {/* Bottom View*/}
              {tableViewToggled &&
              <Grid item xs={12}>
                <Paper className={classes.paper}>
                  <h3>Table View</h3>
                  <TableViewComponent />
                </Paper>
              </Grid>
              }
            </Grid>
          </Container>
      </main>
    </div>
  );
}

export default App;