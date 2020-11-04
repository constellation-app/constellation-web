import React, { Component } from 'react'
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import { ConstellationAttributeLoader } from './ConstellationAttributeLoader';
import FormDialog from './FormDialog';
import TextField from '@material-ui/core/TextField';

const host = '127.0.0.1:8000';

class AttributeEditor extends Component {

    // setting up a state variable to handle the current graph id, current element id, and data loaded from API
    constructor(props) {
        super(props)
        this.state = {
            currentGraphId: 1,
            Vxrows: [],
            Txrows: [],
            Graphrows: [],
            VxDatarows: [],
            TxDatarows: [],
            GraphDatarows: [],
            element: String,
            attribute: String,
            currentElementId: 0
        };
        this.updateGraphId = this.updateGraphId.bind(this);
        this.updateElementId = this.updateElementId.bind(this);
        this.addWebSocket();
        this.refreshAttributes();
        var updateAttributeValue = this.updateAttributeValue.bind(this);
    }

    websocket_endpoint = "ws://127.0.0.1:8000/ws/updates/"

    // grabs up to date attribute values to load.
    refreshAttributes() {
        ConstellationAttributeLoader.load('http://' + host + "/graphs/" + this.state.currentGraphId + "/json",
            (vertexAttributes, transactionAttributes, graphAttributes) => {
                this.setState({ Vxrows: vertexAttributes[0]['attrs'] });
                this.setState({ Txrows: transactionAttributes[0]['attrs'] });
                this.setState({ Graphrows: graphAttributes[0]['attrs'] });
                this.setState({ VxDatarows: vertexAttributes[1]['data'][this.state.currentElementId] });
                this.setState({ TxDatarows: transactionAttributes[1]['data'][this.state.currentElementId] });
                this.setState({ GraphDatarows: graphAttributes[1]['data'][0] });
            });
    }

    // setting the current edited attribute for use when the edit dialog saves.
    setAttribute(attributeName, elementType) {
        this.setState({ attribute: attributeName });
        this.setState({ element: elementType });
    }

    // Updates the attribute value based on an edit event 
    updateAttributeValue(newValue) {
        this.editAttribute(this.state.attribute, newValue);
    }

    // sends a request to change the data of the specified attribute.
    // Currently uses strings only to change values.
    editAttribute(attributeLabel, attributeValue) {
        var data = {};
        var requestUrl = "";

        if (this.state.element === "VERTEX") {
            requestUrl = 'http://' + host + '/edit_vertex_attribs/';
            data = { 'graph_id': this.state.currentGraphId, 'vx_id': this.state.currentElementId, [attributeLabel]: attributeValue };
        } else if (this.state.element === "TRANSACTION") {
            requestUrl = 'http://' + host + '/edit_transaction_attribs/';
            data = { 'graph_id': this.state.currentGraphId, 'tx_id': this.state.currentElementId, [attributeLabel]: attributeValue };
        } else if (this.state.element === "GRAPH") {
            requestUrl = 'http://' + host + '/edit_graph_attribs/';
            data = { 'graph_id': this.state.currentGraphId, [attributeLabel]: attributeValue };
        } else {
            console.error('There was an error with the element type in attribute editor');
        }

        fetch(requestUrl,
            {
                method: 'POST',
                headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            .then(response => response.json())
            .then(data => {
                console.log('Success:', data);
            })
            .catch((error) => {
                console.error('TODO: Error:', error);
            });
    }

    // update the current element id determined by the number input.
    updateElementId(newValue) {
        const Id = newValue.target.value
        this.setState(state => {
            return {
                currentElementId: Id
            };
        }, () => {
            console.log("AttributeEditor: in callback of updating state element id");
            this.refreshAttributes();
        })

    }

    // update the current displayed graph value by setting the state.
    updateGraphId(value) {
        const Id = value.target.value;
        this.setState(state => {
            return {
                currentGraphId: Id
            };
        })
    }


    // Websocket currently listens for updates or creation/deletion of elements and refreshes on any instance of it.
    addWebSocket() {
        const ws = new WebSocket(this.websocket_endpoint)
        ws.onmessage = evt => {
            const message = JSON.parse(evt.data)
            const response = JSON.parse(message["message"])

            if (response["graph_id"] == this.state.currentGraphId) {
                if (response["operation"] === "CREATE") {
                    if (response["type"] === "Vertex" || response["type"] === "VertexAttrib") {
                        this.refreshAttributes();
                    }
                    else if (response["type"] === "Transaction" || response["type"] === "TransactionAttrib") {
                        this.refreshAttributes();
                    }
                }
                else if (response["operation"] === "UPDATE") {
                    if (response["type"] === "Vertex" || response["type"] === "VertexAttrib") {
                        this.refreshAttributes();
                    }
                    else if (response["type"] === "Transaction" || response["type"] === "TransactionAttrib") {
                        this.refreshAttributes();
                    }
                    else if (response["type"] === "Graph" || response["type"] === "GraphAttrib") {
                        this.refreshAttributes();
                    }

                }
                else if (response["operation"] === "DELETE") {
                    console.log('TODO AttributeEditor: Delete... refreshing view.');
                    this.refreshAttributes();
                }
            }
        }
    }

    render() {
        var updateAttributeValue = this.updateAttributeValue;

        return (
            <>
                <TextField
                    id="outlined-number"
                    label="Element #"
                    type="number"
                    InputLabelProps={{
                        shrink: true,
                    }}
                    variant="outlined"
                    defaultValue={this.state.currentElementId}
                    onChange={this.updateElementId}
                />
                <TableContainer style={{ maxHeight: '100%', height: '82%' }}>
                    <Table stickyHeader className="tableRoot" aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <TableCell className="cell"><b>Graph Attributes</b></TableCell>
                                <TableCell className="cell" align="right"><b>Type</b></TableCell>
                                <TableCell className="cell" align="right"><b>Description</b></TableCell>
                                <TableCell className="cell" align="left"><b>Value</b></TableCell>
                                <TableCell className="cell" align="centre"><b>Edit</b></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {this.state.Graphrows.slice().map((row, index) => (

                                <TableRow key={row.label}>
                                    <TableCell component="th" scope="row">{row.label}</TableCell>
                                    <TableCell align="right">{row.type}</TableCell>
                                    <TableCell style={{ fontSize: '8pt' }} align="right">{row.descr}</TableCell>

                                    <TableCell align="left">
                                        {
                                            // this block of code will not print out objects yet.
                                            this.state.GraphDatarows && this.state.GraphDatarows
                                            && typeof this.state.GraphDatarows[row.label] !== 'object'
                                            && this.state.GraphDatarows[row.label] !== null
                                            && JSON.stringify(this.state.GraphDatarows[row.label])
                                        }
                                    </TableCell>
                                    <TableCell align="centre">
                                        {
                                            <FormDialog handleToUpdate={updateAttributeValue.bind(this)} onClick={() => this.setAttribute(row.label, "GRAPH")} />
                                        }

                                    </TableCell>

                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                <TableContainer style={{ maxHeight: '100%', height: '82%' }}>
                    <Table stickyHeader className="tableRoot" aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <TableCell className="cell"><b>Vertex Attributes</b></TableCell>
                                <TableCell className="cell" align="right"><b>Type</b></TableCell>
                                <TableCell className="cell" align="right"><b>Description</b></TableCell>
                                <TableCell className="cell" align="left"><b>Value</b></TableCell>
                                <TableCell className="cell" align="centre"><b>Edit</b></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {this.state.Vxrows.slice(5, 12).map((row, index) => (

                                <TableRow key={row.label}>
                                    <TableCell component="th" scope="row">{row.label}</TableCell>
                                    <TableCell align="right">{row.type}</TableCell>
                                    <TableCell style={{ fontSize: '8pt' }} align="right">{row.descr}</TableCell>

                                    <TableCell align="left">
                                        {this.state.VxDatarows && this.state.VxDatarows
                                            && typeof this.state.VxDatarows[row.label] !== 'object'
                                            && this.state.VxDatarows[row.label] !== null
                                            && this.state.VxDatarows[row.label]
                                        }
                                    </TableCell>
                                    <TableCell align="centre">
                                        {
                                            <FormDialog handleToUpdate={updateAttributeValue.bind(this)} onClick={() => this.setAttribute(row.label, "VERTEX")} />
                                        }

                                    </TableCell>

                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                <TableContainer style={{ maxHeight: '100%', height: '82%' }}>
                    <Table stickyHeader className="tableRoot" aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <TableCell className="cell"><b>Transaction Attributes</b></TableCell>
                                <TableCell className="cell" align="right"><b>Type</b></TableCell>
                                <TableCell className="cell" align="right"><b>Description</b></TableCell>
                                <TableCell className="cell" align="left"><b>Value</b></TableCell>
                                <TableCell className="cell" align="centre"><b>Edit</b></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {this.state.Txrows.slice().map((row, index) => (

                                <TableRow key={row.label}>
                                    <TableCell component="th" scope="row">{row.label}</TableCell>
                                    <TableCell align="right">{row.type}</TableCell>
                                    <TableCell style={{ fontSize: '8pt' }} align="right">{row.descr}</TableCell>

                                    <TableCell align="left">
                                        {this.state.TxDatarows && this.state.TxDatarows
                                            && typeof this.state.TxDatarows[row.label] !== 'object'
                                            && this.state.TxDatarows[row.label] !== null
                                            && this.state.TxDatarows[row.label]
                                        }
                                    </TableCell>
                                    <TableCell align="centre">
                                        {
                                            <FormDialog handleToUpdate={updateAttributeValue.bind(this)} onClick={() => this.setAttribute(row.label, "TRANSACTION")} />
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