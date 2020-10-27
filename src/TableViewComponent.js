import React, { Component } from 'react'
import TableContainer from '@material-ui/core/TableContainer';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TablePagination from '@material-ui/core/TablePagination';
import { ConstellationTableLoader } from './ConstellationTableLoader';
import {BufferBuilder} from "./renderer/utilities/BufferBuilder";


class TableViewComponent extends Component {


    // setting up a state variable to handle the current graph id
    constructor(){
        super()
        this.state = {
            // currentGraphId: Number()
            currentGraphId: 1,
            page: 0,
            rowsPerPage: 25,
            rows: []
        };
        this.updateGraphId = this.updateGraphId.bind(this);
        this.addWebSocket();

        ConstellationTableLoader.load("http://localhost:8000/graphs/" + this.state.currentGraphId + "/json",
            (vertexes, transactions) => {
                this.setState({ rows: vertexes });
                this.vxIDToPosMap = new Map();
                for (var index = 0; index < vertexes.length; index++) {
                    const vx_id = vertexes[index]["vx_id_"];
                    this.vxIDToPosMap.set(vx_id, index);
                }
            });
    }

    websocket_endpoint = "ws://127.0.0.1:8000/ws/updates/"
    vxIDToPosMap = Map;

    // update the current displayed graph value by setting the state.
    updateGraphId(value) {
        const Id = value.target.value;
        this.setState(state => {
            return {
                currentGraphId: Id
            };
        },() => {
            console.log("Tableview: in callback of setting state");
        })
    }

    // Load a vertex into the buffer using a fetch request.
    loadVertex(vertex_id) {
        fetch('http://127.0.0.1:8000/vertexes/' + vertex_id )
            .then((response) => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error('Tableview: Unable to load Vertex with id=' + vertex_id);
                }
            })
            .then((response) => {
                const node = response["json"];
                const vx_id = response.vx_id;
                const pos = this.vxIDToPosMap.get(vx_id);
                var vertexes = this.state.rows;
                vertexes[pos] = node;
                this.setState({ rows: vertexes });

            })
            .catch((error) => {
                console.log('TODO Tableview: invalid Vertex:' + vertex_id);
            });
    }

    addWebSocket() {
        console.log('setup addWebSocket');
        const ws = new WebSocket(this.websocket_endpoint)
        ws.onmessage = evt =>{
            const message = JSON.parse(evt.data)
            const response = JSON.parse(message["message"])

            if (response["graph_id"] == this.state.currentGraphId) {
                if (response["operation"] === "CREATE") {
                    if (response["type"] === "Vertex" || response["type"] === "VertexAttrib")  {
                        this.loadVertex(response["vertex_id"]);
                    }
                    else if (response["type"] === "Transaction" || response["type"] === "TransactionAttrib")  {
                        console.log('TODO Tableview: Transaction/TransactionAttrib create');
                    }
                }
                else if (response["operation"] === "UPDATE") {
                    if (response["type"] === "Vertex" || response["type"] === "VertexAttrib")  {
                        this.loadVertex(response["vertex_id"]);
                    }
                    else if (response["type"] === "Transaction" || response["type"] === "TransactionAttrib")  {
                        console.log('TODO Tableview: Transaction/TransactionAttrib update');
                    }
                }
                else if (response["operation"] === "DELETE") {
                    console.log('TODO Tableview: Delete');
                }
            }
        }
    }

    handleChangePage = (event, page) => {
        this.setState({ page: page });
    };

    handleChangeRowsPerPage = event => {
        this.setState({ page: 0, rowsPerPage: event.target.value });
    };


    render() {
        return (
            <>
                <TableContainer style={{maxHeight: '100%', height: '82%'}}>
                    <Table stickyHeader className="tableRoot" aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <TableCell className="cell">vx_id</TableCell>
                                <TableCell className="cell" align="right">x</TableCell>
                                <TableCell className="cell" align="right">y</TableCell>
                                <TableCell className="cell" align="right">z</TableCell>
                                <TableCell className="cell" align="right">Label</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {this.state.rows.slice(this.state.page * this.state.rowsPerPage, this.state.page * this.state.rowsPerPage + this.state.rowsPerPage)
                                .map((row) => (
                                    <TableRow key={row.vx_id_}>
                                        <TableCell component="th" scope="row">
                                            {row.vx_id_}
                                        </TableCell>
                                        <TableCell align="right">{row.x}</TableCell>
                                        <TableCell align="right">{row.y}</TableCell>
                                        <TableCell align="right">{row.z}</TableCell>
                                        <TableCell align="right">{row.Label}</TableCell>
                                    </TableRow>
                                ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[25, 50, 100]}
                    component="div"
                    count={this.state.rows.length}
                    rowsPerPage={this.state.rowsPerPage}
                    page={this.state.page}
                    onChangePage={this.handleChangePage}
                    onChangeRowsPerPage={this.handleChangeRowsPerPage}
                    style={{backgroundColor: 'lightgrey', height: '18%'}}
                />
            </>
        )
    }


}

export default TableViewComponent;