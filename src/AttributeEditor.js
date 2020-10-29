import React, { Component } from 'react'
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import { ConstellationAttributeLoader } from './ConstellationAttributeLoader';

const host = '127.0.0.1:8000';

class AttributeEditor extends Component {


    // setting up a state variable to handle the current graph id
    constructor() {
        super()
        this.state = {
            currentGraphId: 1,
            Vxrows: [],
            Txrows: [],
            VxDatarows: [],
            TxDatarows: []
        };
        this.updateGraphId = this.updateGraphId.bind(this);
        this.addWebSocket();
        this.refreshAttributes();

    }

    websocket_endpoint = "ws://127.0.0.1:8000/ws/updates/"

    // grabs fresh attribute values to load.
    refreshAttributes() {
        ConstellationAttributeLoader.load('http://' + host + "/graphs/" + this.state.currentGraphId + "/json",
            (vertexAttributes, transactionAttributes) => {
                this.setState({ Vxrows: vertexAttributes[0]['attrs'] });
                this.setState({ Txrows: transactionAttributes[0]['attrs'] });
                this.setState({ VxDatarows: vertexAttributes[1]['data'] });
                this.setState({ TxDatarows: transactionAttributes[1]['data'] });
            });
    }

    // update the current displayed graph value by setting the state.
    updateGraphId(value) {
        const Id = value.target.value;
        this.setState(state => {
            return {
                currentGraphId: Id
            };
        }, () => {
            console.log("AttributeEditor: in callback of setting state");
        })
    }


    addWebSocket() {
        console.log('setup addWebSocket');
        const ws = new WebSocket(this.websocket_endpoint)
        ws.onmessage = evt => {
            const message = JSON.parse(evt.data)
            const response = JSON.parse(message["message"])

            if (response["graph_id"] == this.state.currentGraphId) {
                if (response["operation"] === "CREATE") {
                    if (response["type"] === "Vertex" || response["type"] === "VertexAttrib") {
                        console.log('TODO AttributeEditor: Transaction/TransactionAttrib update');
                    }
                    else if (response["type"] === "Transaction" || response["type"] === "TransactionAttrib") {
                        console.log('TODO AttributeEditor: Transaction/TransactionAttrib create');
                    }
                }
                else if (response["operation"] === "UPDATE") {
                    if (response["type"] === "Vertex" || response["type"] === "VertexAttrib") {
                        this.refreshAttributes();
                    }
                    else if (response["type"] === "Transaction" || response["type"] === "TransactionAttrib") {
                        console.log('TODO AttributeEditor: Transaction/TransactionAttrib update');
                    }
                }
                else if (response["operation"] === "DELETE") {
                    console.log('TODO AttributeEditor: Delete');
                }
            }
        }
    }


    render() {
        return (
            <>
                <TableContainer style={{ maxHeight: '100%', height: '82%' }}>
                    <Table stickyHeader className="tableRoot" aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <TableCell className="cell">Vertex Attributes</TableCell>
                                <TableCell className="cell" align="right">Type</TableCell>
                                <TableCell className="cell" align="right">Description</TableCell>
                                <TableCell className="cell" align="left">Value</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {this.state.Vxrows.slice(5, 12).map((row, index) => (

                                <TableRow key={row.label}>
                                    <TableCell component="th" scope="row">{row.label}</TableCell>
                                    <TableCell align="right">{row.type}</TableCell>
                                    <TableCell align="right">{row.descr}</TableCell>

                                    <TableCell align="left">
                                        {this.state.VxDatarows[0]
                                            && typeof this.state.VxDatarows[0][row.label] !== 'object'
                                            && this.state.VxDatarows[0][row.label] !== null
                                            && this.state.VxDatarows[0][row.label]
                                        }
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </>
        )
    }


}

export default AttributeEditor;