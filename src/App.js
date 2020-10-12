import React, { useState } from 'react';
import Grid from '@material-ui/core/Grid';

import MenuButton from './MenuButton';
import GraphComponent from './GraphComponent';
import TableView from './TableView';

import './App.css';

function App() {

  const [tableViewToggled, setTableViewToggled] = useState(false);

  function toggleTableView() {
    setTableViewToggled(!tableViewToggled);
  }

  return (
    <div className="App">
      <Grid container>
        <Grid container direction="column" style={{height: window.innerHeight, width: '3%'}}>
          <Grid item>
            <MenuButton buttonName="Table View" onClick={toggleTableView} />
          </Grid>
        </Grid>
        <Grid container direction="column" style={{height: window.innerHeight, width: '97%'}}>
          <Grid item style={{height: tableViewToggled ? '65%' : '100%'}}>
            <GraphComponent />
          </Grid>
          {tableViewToggled &&
            <Grid item style={{height: '35%'}}>
              {/*Pushes at around 5000 elements from testing */}
              <TableView style={{height: '100%'}} />
            </Grid>
          }
        </Grid>
      </Grid>
    </div>
  );
}

export default App;
