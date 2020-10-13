/*Largely copied from material-ui docs for the purpose of demonstrating POC*/

import React from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

import './TableView.css';

function createData(name, calories, fat, carbs, protein) {
  return { name, calories, fat, carbs, protein };
}

const rowsData = [
  createData('Frozen yoghurt', 159, 6.0, 24, 4.0),
  createData('Ice cream sandwich', 237, 9.0, 37, 4.3),
  createData('Eclair', 262, 16.0, 24, 6.0),
  createData('Cupcake', 305, 3.7, 67, 4.3),
  createData('Gingerbread', 356, 16.0, 49, 3.9),
];

/*This copies the data of rowsData into rows {length} times */
const rows = [].concat(...Array.from({length: 200}, () => rowsData));

export default function BasicTable() {
  return (
    <TableContainer style={{maxHeight: '100%'}}>
      <Table stickyHeader className="tableRoot" aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell className="cell">Dessert (100g serving)</TableCell>
            <TableCell className="cell" align="right">Calories</TableCell>
            <TableCell className="cell" align="right">Fat&nbsp;(g)</TableCell>
            <TableCell className="cell" align="right">Carbs&nbsp;(g)</TableCell>
            <TableCell className="cell" align="right">Protein&nbsp;(g)</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.name}>
              <TableCell component="th" scope="row">
                {row.name}
              </TableCell>
              <TableCell align="right">{row.calories}</TableCell>
              <TableCell align="right">{row.fat}</TableCell>
              <TableCell align="right">{row.carbs}</TableCell>
              <TableCell align="right">{row.protein}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}