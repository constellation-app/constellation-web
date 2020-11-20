import React, { useState } from 'react';

// components
import GraphComponentTest from './GraphComponentTest';
import GraphComponent from './GraphComponent';
//import TableView from './TableView';
import TableViewComponent from './TableViewComponent';
import AttributeEditor from './AttributeEditor';

// layout
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import CssBaseline from '@material-ui/core/CssBaseline';
import Drawer from '@material-ui/core/Drawer';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import Badge from '@material-ui/core/Badge';
import Container from '@material-ui/core/Container';
import Paper from '@material-ui/core/Paper';
import LinearProgress from '@material-ui/core/LinearProgress';
import { withStyles, withTheme } from '@material-ui/core/styles';

// menu
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';

// icons
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import NotificationsIcon from '@material-ui/icons/Notifications';
import PersonIcon from '@material-ui/icons/Person';
import DashboardIcon from '@material-ui/icons/Dashboard';
import TableChartIcon from '@material-ui/icons/TableChart';
import EditIcon from '@material-ui/icons/Edit';
import TextField from '@material-ui/core/TextField';

import './App.css';

const drawerWidth = 240;

const styles = theme => ({
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
    graphInput: {
        color: 'white',
    },
});


class App extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            drawerOpen: false,
            tableViewToggled: true,
            AttributeEditorToggled: false,
            currentGraphId: 1,
            selectedNodeId: 0
        };
        var updateCurrentGraph = this.updateCurrentGraph.bind(this);
        var updateAttributeValue = this.updateAttributeValue.bind(this);
    }

    toggleDrawer = () => {
        this.setState({
            drawerOpen: !this.state.drawerOpen
        });
    }

    toggleTableView = () => {
        this.setState({ tableViewToggled: !this.state.tableViewToggled });
    }

    toggleAttributeEditor = () => {
        this.setState({ AttributeEditorToggled: !this.state.AttributeEditorToggled });
    }

    updateAttributeValue(newValue) {
        this.setState({ selectedNodeId: newValue });
    }

    updateCurrentGraph = (newValue) => {
        this.setState({ currentGraphId: newValue.target.value });
    }

    render() {
        var updateAttributeValue = this.updateAttributeValue;
        const { classes } = this.props;

        return (

            <div className={classes.root}>
                <LinearProgress />
                <CssBaseline />

                <AppBar position="absolute" className={clsx(classes.appBar, this.state.drawerOpen && classes.appBarShift)// this.state.drawerOpen
                }>
                    <Toolbar className={classes.toolbar}>
                        <IconButton
                            edge="start"
                            color="inherit"
                            aria-label="open drawer"
                            onClick={this.toggleDrawer}
                            className={clsx(classes.menuButton, this.state.drawerOpen && classes.menuButtonHidden) /* this.state.drawerOpen */}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Typography component="h1" variant="h6" color="inherit" noWrap className={classes.title}>
                            Web Constellation
              </Typography>
                        <TextField
                            id="outlined-number"
                            label="Graph #"
                            type="number"
                            InputLabelProps={{
                                shrink: true,
                                className: classes.graphInput,
                            }}
                            InputProps={{
                                className: classes.graphInput,
                            }}
                            defaultValue={this.state.currentGraphId}
                            onChange={this.updateCurrentGraph}
                        />
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
                        paper: clsx(classes.drawerPaper, !this.state.drawerOpen && classes.drawerPaperClose), // !this.state.drawerOpen
                    }}
                    open={this.state.drawerOpen}
                >
                    <div className={classes.toolbarIcon}>
                        <IconButton onClick={this.toggleDrawer}>
                            <ChevronLeftIcon />
                        </IconButton>
                    </div>
                    <Divider />
                    <List>
                        <ListItem button>
                            <ListItemIcon>
                                <DashboardIcon />
                            </ListItemIcon>
                            <ListItemText primary="Dashboard" />
                        </ListItem>
                        <ListItem button>
                            <ListItemIcon>
                                <EditIcon onClick={this.toggleAttributeEditor} />
                            </ListItemIcon>
                            <ListItemText primary="Attribute Editor" />
                        </ListItem>
                        <ListItem button>
                            <ListItemIcon>
                                <TableChartIcon onClick={this.toggleTableView} />
                            </ListItemIcon>
                            <ListItemText primary="Table View" />
                        </ListItem>
                    </List>
                </Drawer>

                <main className={classes.content}>
                    <div className={classes.appBarSpacer} />
                    <Container maxWidth={false} className={classes.container} style={{ padding: '12px' }}>
                        <Grid container spacing={3}>
                            {/* Attribute Editor */}
                            {this.state.AttributeEditorToggled &&
                                <Grid item xs={this.state.AttributeEditorToggled ? 4 : 12} style={{ padding: '6px 0px 6px 6px' }}>
                                    <Paper className={classes.paper} >
                                        <h3 style={{ margin: '0px' }}>Attribute Editor</h3>
                                        <AttributeEditor selectedNode={this.state.selectedNodeId} graphId={this.state.currentGraphId} />
                                    </Paper>
                                </Grid>
                            }

                            {/* Graph */}
                            <Grid item xs={this.state.AttributeEditorToggled ? 8 : 12} style={{ padding: '6px' }}>
                                <Paper className={classes.paper} style={{ padding: '6px' }}>
                                    <GraphComponent handleToUpdate={updateAttributeValue.bind(this)} graphId={this.state.currentGraphId} />
                                </Paper>
                            </Grid>

                            {/* Table View */}
                            {this.state.tableViewToggled &&
                                <Grid item xs={12} style={{ padding: '0px 6px 6px 6px' }}>
                                    <Paper className={classes.paper}>
                                        <h3 style={{ margin: '0px' }}>Table View</h3>
                                        <TableViewComponent graphId={this.state.currentGraphId} />
                                    </Paper>
                                </Grid>
                            }
                        </Grid>
                    </Container>
                </main>
            </div>
        )
    }
}

export default withStyles(styles)(App)