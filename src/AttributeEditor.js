import React, { Component } from 'react'
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import { ConstellationAttributeLoader } from './ConstellationAttributeLoader';
import FormDialog from './FormDialog';
import Typography from '@material-ui/core/Typography';

// menu
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import List from '@material-ui/core/List';
import EditIcon from '@material-ui/icons/Edit';


const host = '127.0.0.1:8000';


// TODO: This does not take into account the moving vx id positions which get returned from the API. eg. only 4 elements. 0 1 4 5. 
// Element at position 1 is correct
// element at position 2 is 4 instead of the assumed 2. incorrect.'
// POC is acceptable, but in memory graph representation will fix this eventually.

// This also does not take into account the fact that the graph will use an in-memory solution.
// Querying the API on all instances of change will cause issues. (currently works this way.)

class AttributeEditor extends Component {

    websocket_endpoint = "ws://127.0.0.1:8000/ws/updates/"

    // setting up a state variable to handle the current graph id, current element id, and data loaded from API
    constructor(props) {
        super(props)
        this.state = {
            currentGraphId: this.props.graphId,
            currentVxId: 0,
            currentTxId: 0,
            Vxrows: [],
            Txrows: [],
            Graphrows: [],
            VxDatarows: [],
            TxDatarows: [],
            GraphDatarows: [],
            element: String,
            attribute: String,
            currentElementId: this.props.currentElementId,
            graphAttributeOpened: false,
            vertexAttributeOpened: false,
            transactionAttributeOpened: false,
            previousSelected: 0

        };
        this.updateGraphId = this.updateGraphId.bind(this);
        this.updateSelection = this.updateSelection.bind(this);
        this.toggleGraphAttributes = this.toggleGraphAttributes.bind(this);
        this.toggleVertexAttributes = this.toggleVertexAttributes.bind(this);
        this.toggleTransactionAttributes = this.toggleTransactionAttributes.bind(this);
        this.addWebSocket();
        this.refreshAttributes();
        var updateAttributeValue = this.updateAttributeValue.bind(this);
    }



    // grabs up to date attribute values to load.
    refreshAttributes() {
        ConstellationAttributeLoader.load('http://' + host + "/graphs/" + this.state.currentGraphId + "/json",
            (success, vertexAttributes, transactionAttributes, graphAttributes) => {
                if (success) {
                    this.setState({
                        Vxrows: vertexAttributes[0]['attrs'],
                        Txrows: transactionAttributes[0]['attrs'],
                        Graphrows: graphAttributes[0]['attrs'],
                        VxDatarows: vertexAttributes[1]['data'][this.props.selectedNode],
                        TxDatarows: transactionAttributes[1]['data'][this.props.selectedNode],
                        GraphDatarows: graphAttributes[1]['data'][0],
                        currentVxId: vertexAttributes[1]['data'][this.props.selectedNode]['vx_id_']
                    });
                }
            });
    }

    // setting the current edited attribute for use when the edit dialog saves.
    setAttribute(attributeName, elementType) {
        this.setState({
            attribute: attributeName,
            element: elementType
        });
    }

    // Updates the attribute value based on an edit event 
    updateAttributeValue(newValue) {
        this.editAttribute(this.state.attribute, newValue);
    }

    updateSelection() {
        this.setState({ previousSelected: this.props.selectedNode });
        this.refreshAttributes();
    }

    // sends a request to change the data of the specified attribute.
    // Currently uses strings only to change values.
    editAttribute(attributeLabel, attributeValue) {
        var data = {};
        var requestUrl = "";

        if (this.state.element === "VERTEX") {
            requestUrl = 'http://' + host + '/edit_vertex_attribs/';
            data = { 'graph_id': this.state.currentGraphId, 'vx_id': this.state.currentVxId, [attributeLabel]: attributeValue }; // current element id
        } else if (this.state.element === "TRANSACTION") {
            // TODO: This is wrong at the moment, nbeed to set transaction ID
            requestUrl = 'http://' + host + '/edit_transaction_attribs/';
            data = { 'graph_id': this.state.currentGraphId, 'tx_id': this.state.currentVxId, [attributeLabel]: attributeValue }; // current element id
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

    // update the current displayed graph value by setting the state.
    updateGraphId(value) {
        //const Id = value.target.value;
        this.setState(state => {
            return {
                currentGraphId: value
            };
        }, () => {
            this.refreshAttributes();
        })
    }


    // Websocket currently listens for updates or creation/deletion of elements and refreshes on any instance of it.
    addWebSocket() {
        const ws = new WebSocket(this.websocket_endpoint)
        ws.onmessage = evt => {
            const message = JSON.parse(evt.data)
            const response = JSON.parse(message["message"])
            console.log("type of: " + typeof response["graph_id"] + " number: " + typeof this.state.currentGraphId)

            if (response["graph_id"] === this.state.currentGraphId) {
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

    toggleGraphAttributes() {
        this.setState({ graphAttributeOpened: !this.state.graphAttributeOpened });
    }

    toggleVertexAttributes() {
        this.setState({ vertexAttributeOpened: !this.state.vertexAttributeOpened });
    }

    toggleTransactionAttributes() {
        this.setState({ transactionAttributeOpened: !this.state.transactionAttributeOpened });
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.graphId !== this.props.graphId) {
            this.updateGraphId(this.props.graphId);
        }
    }

    render() {
        var updateAttributeValue = this.updateAttributeValue;

        return (
            <>
                {(this.state.previousSelected !== this.props.selectedNode) && this.updateSelection()}
                <List style={{ padding: '0px' }}>
                    <ListItem style={{ padding: '0px' }} button onClick={this.toggleGraphAttributes} selected={this.state.graphAttributeOpened}>
                        <ListItemIcon>
                            <EditIcon />
                        </ListItemIcon>
                        <ListItemText
                            primary={<Typography variant="body2" >Graph ({this.state.Graphrows.length} attributes)</Typography>}
                            secondary={`ID: ${this.props.graphId}`}
                        />
                    </ListItem>
                </List>
                {
                    this.state.graphAttributeOpened &&

                    <TableContainer style={{ maxHeight: '100%', height: '82%' }}>
                        <Table stickyHeader className="tableRoot" aria-label="simple table">
                            <TableHead>
                                <TableRow>
                                    <TableCell style={{ fontSize: '8pt', padding: '5px', width: "30%" }} className="cell" align="left"><b>Attribute</b></TableCell>
                                    <TableCell style={{ fontSize: '8pt', padding: '5px', width: "30%" }} className="cell" align="left"><b>Value</b></TableCell>
                                    <TableCell style={{ fontSize: '8pt', padding: '5px', width: "30%" }} className="cell" align="right"></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {this.state.Graphrows.slice().map((row, index) => (

                                    <TableRow key={row.label} title={`Attribute: ${row.label} [${row.type}]
Description: ${row.descr}`}>
                                        <TableCell style={{ fontSize: '8pt', padding: '5px', width: "30%" }} component="th" scope="row" align="left">{row.label}</TableCell>
                                        <TableCell style={{ fontSize: '8pt', padding: '5px', width: "30%" }} align="left">
                                            {
                                                // this block of code will not print out objects yet.
                                                this.state.GraphDatarows && typeof this.state.GraphDatarows[row.label] !== 'object'
                                                && this.state.GraphDatarows[row.label] !== null && JSON.stringify(this.state.GraphDatarows[row.label])
                                            }
                                        </TableCell>
                                        <TableCell style={{ fontSize: '8pt', padding: '5px', width: "30%" }} align="right">
                                            {
                                                <FormDialog
                                                    handleToUpdate={updateAttributeValue.bind(this)}
                                                    onClick={() => this.setAttribute(row.label, "GRAPH")}
                                                    label={row.label}
                                                    current={
                                                        this.state.GraphDatarows && typeof this.state.GraphDatarows[row.label] !== 'object'
                                                        && this.state.GraphDatarows[row.label] !== null && JSON.stringify(this.state.GraphDatarows[row.label])
                                                    }
                                                />
                                            }

                                        </TableCell>

                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                }

                <List style={{ padding: '0px' }}>
                    <ListItem button style={{ padding: '0px' }} onClick={this.toggleVertexAttributes} selected={this.state.vertexAttributeOpened}>
                        <ListItemIcon>
                            <EditIcon />
                        </ListItemIcon>
                        <ListItemText
                            primary={<Typography variant="body2" >Vertex ({this.state.Vxrows.length} attributes)</Typography>}
                            secondary={`ID: ${this.state.currentVxId}`}
                        />
                    </ListItem>
                </List>

                {
                    this.state.vertexAttributeOpened &&
                    <TableContainer style={{ maxHeight: '100%', height: '82%' }}>
                        <Table stickyHeader className="tableRoot" aria-label="simple table">
                            <TableHead>
                                <TableRow>
                                    <TableCell style={{ fontSize: '8pt', padding: '5px', width: "30%" }} className="cell" align="left"><b>Attribute</b></TableCell>
                                    <TableCell style={{ fontSize: '8pt', padding: '5px', width: "30%" }} className="cell" align="left"><b>Value</b></TableCell>
                                    <TableCell style={{ fontSize: '8pt', padding: '5px', width: "30%" }} className="cell" align="right"></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {this.state.Vxrows.slice(5, 12).map((row, index) => (
                                    <TableRow key={row.label} title={`Attribute: ${row.label} [${row.type}]
Description: ${row.descr}`}>
                                        <TableCell style={{ fontSize: '8pt', padding: '5px', width: "30%" }} component="th" scope="row" align="left">{row.label}</TableCell>
                                        <TableCell style={{ fontSize: '8pt', padding: '5px', width: "30%" }} align="left">
                                            {this.state.VxDatarows && typeof this.state.VxDatarows[row.label] !== 'object'
                                             && this.state.VxDatarows[row.label] !== null && this.state.VxDatarows[row.label]
                                            }
                                        </TableCell>
                                        <TableCell style={{ fontSize: '8pt', padding: '5px', width: "30%" }} align="right">
                                            {
                                                <FormDialog
                                                    handleToUpdate={updateAttributeValue.bind(this)}
                                                    onClick={() => this.setAttribute(row.label, "VERTEX")}
                                                    label={row.label}
                                                    current={
                                                        this.state.VxDatarows && typeof this.state.VxDatarows[row.label] !== 'object'
                                                    && this.state.VxDatarows[row.label] !== null&& this.state.VxDatarows[row.label]
                                                    }
                                                />
                                            }

                                        </TableCell>

                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                }


                <List style={{ padding: '0px' }}>
                    <ListItem style={{ padding: '0px' }} button onClick={this.toggleTransactionAttributes} selected={this.state.transactionAttributeOpened}>
                        <ListItemIcon>
                            <EditIcon />
                        </ListItemIcon>
                        <ListItemText
                            primary={<Typography variant="body2" >Transaction ({this.state.Txrows.length} attributes)</Typography>}
                            secondary={`ID: ${this.state.currentTxId} [NOT IMPLEMENTED]`}
                        />
                    </ListItem>
                </List>
                {
                    this.state.transactionAttributeOpened &&

                    <TableContainer style={{ maxHeight: '100%', height: '82%' }}>
                        <Table stickyHeader className="tableRoot" aria-label="simple table">
                            <TableHead>
                                <TableRow>
                                    <TableCell style={{ fontSize: '8pt', padding: '5px', width: "30%" }} className="cell" align="left"><b>Attribute</b></TableCell>
                                    <TableCell style={{ fontSize: '8pt', padding: '5px', width: "30%" }} className="cell" align="left"><b>Value</b></TableCell>
                                    <TableCell style={{ fontSize: '8pt', padding: '5px', width: "30%" }} className="cell" align="right"></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {this.state.Txrows.slice().map((row, index) => (

                                    <TableRow key={row.label} title={`Attribute: ${row.label} [${row.type}]
Description: ${row.descr}`}>
                                        <TableCell style={{ fontSize: '8pt', padding: '5px', width: "30%" }} component="th" scope="row" align="left">{row.label}</TableCell>
                                        <TableCell style={{ fontSize: '8pt', padding: '5px', width: "30%" }} align="left">
                                            {this.state.TxDatarows && typeof this.state.TxDatarows[row.label] !== 'object'
                                                && this.state.TxDatarows[row.label] !== null && this.state.TxDatarows[row.label]
                                            }
                                        </TableCell>
                                        <TableCell style={{ fontSize: '8pt', padding: '5px', width: "30%" }} align="right">
                                            {
                                                <FormDialog
                                                    handleToUpdate={updateAttributeValue.bind(this)}
                                                    onClick={() => this.setAttribute(row.label, "TRANSACTION")}
                                                    label={row.label}
                                                    current={
                                                        this.state.TxDatarows && typeof this.state.TxDatarows[row.label] !== 'object'
                                                        && this.state.TxDatarows[row.label] !== null && this.state.TxDatarows[row.label]
                                                    }
                                                />
                                            }

                                        </TableCell>

                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                }
            </>
        )
    }
}

export default AttributeEditor;