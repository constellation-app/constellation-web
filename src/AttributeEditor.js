import React, { Component } from 'react'
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

class AttributeEditor extends Component {


    // setting up a state variable to handle the current graph id
    constructor() {
        super()
        this.state = {
            currentGraphId: 1
        };
        this.updateGraphId = this.updateGraphId.bind(this);
        this.addWebSocket();
    }

    websocket_endpoint = "ws://127.0.0.1:8000/ws/updates/"


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
                        console.log('TODO AttributeEditor: Transaction/TransactionAttrib update');
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
                AttributeEditor

                <TableContainer style={{ maxHeight: '100%', height: '82%' }}>
                    <Table stickyHeader className="tableRoot" aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <TableCell className="cell">Attribute 1:</TableCell>
                                <TableCell className="cell" align="right">Value1</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="cell">Attribute 2:</TableCell>
                                <TableCell className="cell" align="right">Value2</TableCell>
                            </TableRow>

                        </TableHead>
                        <TableBody>
                        </TableBody>
                    </Table>
                </TableContainer>
            </>
        )
    }


}

export default AttributeEditor;