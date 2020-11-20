import React, { Component } from 'react'
import TableContainer from '@material-ui/core/TableContainer';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TablePagination from '@material-ui/core/TablePagination';
import { ConstellationTableLoader } from './ConstellationTableLoader';
import { BufferBuilder } from "./renderer/utilities/BufferBuilder";

const host = '127.0.0.1:8000';

class TableViewComponent extends Component {

    websocket_endpoint = 'ws://' + host + '/ws/updates/';
    vxIDToPosMap = Map;

    // setting up a state variable to handle the current graph id
    constructor(props) {
        super(props)
        this.state = {
            currentGraphId: this.props.graphId,
            page: 0,
            rowsPerPage: 10,
            rows: []
        };
        this.updateGraphId = this.updateGraphId.bind(this);
        this.addWebSocket();
        this.refreshTable();
    }

    // update the current displayed graph value by setting the state.
    updateGraphId(value) {
        //const Id = value.target.value;
        this.setState(state => {
            return {
                currentGraphId: value
            };
        }, () => {
            this.refreshTable();
        })
    }

    // Load a vertex into the buffer using a fetch request.
    loadVertex(vertex_id) {
        fetch('http://' + host + '/vertexes/' + vertex_id)
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
        ws.onmessage = evt => {
            const message = JSON.parse(evt.data)
            const response = JSON.parse(message["message"])

            if (response["graph_id"] === this.state.currentGraphId) {
                if (response["operation"] === "CREATE") {
                    if (response["type"] === "Vertex" || response["type"] === "VertexAttrib") {
                        this.loadVertex(response["vertex_id"]);
                    }
                    else if (response["type"] === "Transaction" || response["type"] === "TransactionAttrib") {
                        console.log('TODO Tableview: Transaction/TransactionAttrib create');
                    }
                }
                else if (response["operation"] === "UPDATE") {
                    if (response["type"] === "Vertex" || response["type"] === "VertexAttrib") {
                        this.loadVertex(response["vertex_id"]);
                    }
                    else if (response["type"] === "Transaction" || response["type"] === "TransactionAttrib") {
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

    componentDidUpdate = (prevProps) => {
        if (prevProps.graphId !== this.props.graphId) {
            this.updateGraphId(this.props.graphId);
        }
    }

    refreshTable() {
        ConstellationTableLoader.load('http://' + host + "/graphs/" + this.state.currentGraphId + "/json",
            (vertexes, transactions) => {
                this.setState({ rows: vertexes });
                this.vxIDToPosMap = new Map();
                for (var index = 0; index < vertexes.length; index++) {
                    const vx_id = vertexes[index]["vx_id_"];
                    this.vxIDToPosMap.set(vx_id, index);
                }
            });
    }

    render() {
        return (
            <>
                <TableContainer style={{ maxHeight: '100%', height: '90%' }}>
                    <Table stickyHeader className="tableRoot" aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <TableCell style={{ fontSize: '8pt', padding: '5px' }} className="cell">vx_id</TableCell>
                                <TableCell style={{ fontSize: '8pt', padding: '5px' }} className="cell" align="right">x</TableCell>
                                <TableCell style={{ fontSize: '8pt', padding: '5px' }} className="cell" align="right">y</TableCell>
                                <TableCell style={{ fontSize: '8pt', padding: '5px' }} className="cell" align="right">z</TableCell>
                                <TableCell style={{ fontSize: '8pt', padding: '5px' }} className="cell" align="right">Label</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {this.state.rows.slice(this.state.page * this.state.rowsPerPage, this.state.page * this.state.rowsPerPage + this.state.rowsPerPage)
                                .map((row) => (
                                    <TableRow key={row.vx_id_}>
                                        <TableCell style={{ fontSize: '8pt', padding: '5px' }} component="th" scope="row">
                                            {row.vx_id_}
                                        </TableCell>
                                        <TableCell style={{ fontSize: '8pt', padding: '5px' }} align="right">{row.x}</TableCell>
                                        <TableCell style={{ fontSize: '8pt', padding: '5px' }} align="right">{row.y}</TableCell>
                                        <TableCell style={{ fontSize: '8pt', padding: '5px' }} align="right">{row.z}</TableCell>
                                        <TableCell style={{ fontSize: '8pt', padding: '5px' }} align="right">{row.Label}</TableCell>
                                    </TableRow>
                                ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[10, 25, 50, 100]}
                    component="div"
                    count={this.state.rows.length}
                    rowsPerPage={this.state.rowsPerPage}
                    page={this.state.page}
                    onChangePage={this.handleChangePage}
                    onChangeRowsPerPage={this.handleChangeRowsPerPage}
                    style={{ backgroundColor: 'lightgrey' }}
                />
            </>
        )
    }
}

export default TableViewComponent;