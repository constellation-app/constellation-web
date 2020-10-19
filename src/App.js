import React from 'react';

import GraphComponent from './GraphComponent';

import './App.css';

function App() {
  return (
    <div className="App">
      <Grid container>
        <Grid container direction="column" style={{height: window.innerHeight, width: '5%'}}>
          <Grid item className="buttonHolder">
            <MenuButton buttonName="Table View on bottom" onClick={toggleTableView} />
          </Grid>
          <Grid item className="buttonHolder">
            <MenuButton buttonName="Table View on side" onClick={toggleTableViewSide} />
          </Grid>
        </Grid>
        {tableViewSideToggled &&
          <Grid container direction="column" style={{height: window.innerHeight, width: '25%'}}>
            <Grid item style={{height: '100%', width: '100%'}}>
              <TableView />
            </Grid>
          </Grid>
        }
        <Grid container 
              direction="column" 
              style={{height: window.innerHeight, width: tableViewSideToggled ? '70%' : '95%'}}
        >
          <Grid item style={{height: tableViewToggled ? '65%' : '100%'}}>
            <GraphComponent />
          </Grid>
          {tableViewToggled &&
            <Grid item style={{height: '35%'}}>
              <TableView />
            </Grid>
          }
        </Grid>
      </Grid>
    </div>
  );
}

export default App;
