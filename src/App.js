import React, { useState } from 'react';
import Grid from '@material-ui/core/Grid';

import MenuButton from './MenuButton';
import GraphComponentTest from './GraphComponentTest';
import GraphComponent from './GraphComponent';
import TableView from './TableView';
import TableViewComponent from './TableViewComponent';
import AttributeEditor from './AttributeEditor';

import './App.css';

function App() {

  const [tableViewToggled, setTableViewToggled] = useState(true);
  const [AttributeEditorToggled, setAttributeEditorToggled] = useState(false);

  function toggleTableView() {
    setTableViewToggled(!tableViewToggled);
  }

  function toggleAttributeEditor() {
    setAttributeEditorToggled(!AttributeEditorToggled);
  }

  return (
    <div className="App">
      <Grid container>
        <Grid container direction="column" style={{ height: window.innerHeight, width: '5%' }}>
          <Grid item className="buttonHolder">
            <MenuButton buttonName="Table View" onClick={toggleTableView} />
          </Grid>
          <Grid item className="buttonHolder">
            <MenuButton buttonName="Attribute Editor" onClick={toggleAttributeEditor} />
          </Grid>
        </Grid>
        {AttributeEditorToggled &&
          <Grid container direction="column" style={{ height: window.innerHeight, width: '25%' }}>
            <Grid item style={{ height: '100%', width: '100%' }}>
              <AttributeEditor />
            </Grid>
          </Grid>
        }
        <Grid container
          direction="column"
          style={{ height: window.innerHeight, width: AttributeEditorToggled ? '70%' : '95%' }}
        >
          <Grid item style={{ height: tableViewToggled ? '65%' : '100%' }}>
            <GraphComponent />
          </Grid>
          {tableViewToggled &&
            <Grid item style={{ height: '35%' }}>
              <TableViewComponent />
            </Grid>
          }
        </Grid>
      </Grid>
    </div>
  );
}

export default App;