import React, { Component } from 'react'

import { CanvasController } from './renderer/CanvasController';
import { GraphRenderer } from './renderer/GraphRenderer';

import { GlyphRenderer } from './renderer/GlyphRenderer';

import './GraphComponent.css';
import { BufferBuilder } from './renderer/utilities/BufferBuilder';
import { Camera } from './renderer/Camera';
import { NodeHoverSelector } from './renderer/listeners/NodeHoverSelector';
import { NodeClickSelector } from './renderer/listeners/NodeClickSelector';
import { ZoomGesture } from './renderer/listeners/ZoomGesture';
import { PanGesture } from './renderer/listeners/PanGesture';
import { Rotator } from './renderer/listeners/Rotator';
import { ConstellationGraphLoader } from './ConstellationGraphLoader';
import { ElementList } from './graph/ElementList';
import { DragGesture } from "./renderer/listeners/DragGesture";

import { IconManager } from "./renderer/IconManager";


const host = '127.0.0.1:8000';

class GraphComponent extends Component {

    websocket_endpoint = 'ws://' + host + '/ws/updates/'
    nodePositions = [];
    nodeVisuals = [];
    labels = [];
    vxIDToPosMap = Map;
    txIDToPosMap = Map;
    posToVxIDMap = Map;
    posToTxIDMap = Map;
    icon_manager = new IconManager();

    canvasRef = React.createRef();

    // setting up a state variable to handle the current graph id
    constructor(props) {
        super(props)
        this.state = {
            currentGraphId: this.props.graphId,
        };
        this.updateGraphId = this.updateGraphId.bind(this);
        this.selectedNode = this.selectedNode.bind(this);

    }

    // update the current displayed graph value by setting the state.
    updateGraphId(value) {
        //const Id = value.target.value;
        this.setState(state => {
            return {
                currentGraphId: value
            };
        }, () => {
            this.displayGraph();
        });
    }

    // Load a vertex into the buffer using a fetch request.
    loadVertex(vertex_id) {
        fetch('http://' + host + '/vertexes/' + vertex_id)
            .then((response) => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error('GraphView: Unable to load Vertex with id=' + vertex_id);
                }
            })
            .then((response) => {
                const node = response["json"];
                const nodePos = this.vxIDToPosMap.get(response.vx_id);
                const icon = this.icon_manager.getIconIndex(node['icon']);
                const backgroundIcon = this.icon_manager.getIconIndex(node['background_icon']);
                const color = ConstellationGraphLoader.loadColor(node['color']);

                console.log('MMDEBUG: X='+ node["x"] + ', Y=' + node["y"] + ', Z=' + node["z"]);

                BufferBuilder.updateNodePosition(nodePos, node["x"], node["y"], node["z"], 1, this.nodePositions);
                BufferBuilder.updateNodeVisuals(nodePos, icon, backgroundIcon, color, (this.selectedNode == nodePos), this.nodeVisuals);
                this.graphRenderer.setNodes(this.nodePositions, this.nodeVisuals);

                // TODO: is there a more efficient way to do this - probably need glyph renderer to have a method
                // TODO: to update  existing rather than just appending new
                if (node["Label"] != this.labels[nodePos]) {
                    this.labels[nodePos] = node["Label"];
                    var glyphRenderer = new GlyphRenderer(36, 'NotoSansSC-Black.otf', 2, (error) => {
                        this.graphRenderer.setGlyphRenderer(glyphRenderer);

                        const glyphs = [];
                        for (var i = 0; i < this.nodePositions.length / 4; i++) {
                            if (this.labels[i]) {
                                glyphRenderer.renderText(i,0, this.labels[i], glyphs);
                            }
                        }
                        this.graphRenderer.setGlyphSize(3);
                        this.graphRenderer.setGlyphs(new Float32Array(glyphs));
                        this.graphRenderer.setGlyphColor(new Float32Array([1, 1, 0]));
                    });
                }

            })
            .catch((error) => {
                console.log('TODO GraphView: invalid Vertex:' + vertex_id);
            });
    }

    selectedNode(newId) {
        this.props.handleToUpdate(newId);
    }

    addWebSocket() {
        // Initialise WebSocket
        // This will fail if the endpoint cannot send a handshake in time (When server is not booted yet)
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
                        console.log('TODO GraphView: Transaction/TransactionAttrib create');
                    }
                }
                else if (response["operation"] === "UPDATE") {
                    if (response["type"] === "Vertex" || response["type"] === "VertexAttrib") {
                        this.loadVertex(response["vertex_id"]);
                    }
                    else if (response["type"] === "Transaction" || response["type"] === "TransactionAttrib") {
                        console.log('TODO GraphView: Transaction/TransactionAttrib update');
                    }
                }
                else if (response["operation"] === "DELETE") {
                    console.log('TODO GraphView: Delete');
                }
            }
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.graphId !== this.props.graphId) {
            this.updateGraphId(this.props.graphId);
        }
    }

    // runs once when the component mounts.
    componentDidMount = () => {
        this.displayGraph();
    }

    // used to display the graph based on a request to the API
    displayGraph() {
        this.addWebSocket();
        var controller = new CanvasController(this.canvasRef.current);
        var gl = controller.gl;

        ConstellationGraphLoader.load('http://' + host + "/graphs/" + this.state.currentGraphId + "/json", this.icon_manager,
            (np, nv, labels, lp, vxIdPosMap, txIdPosMap) => {
                this.graphRenderer = new GraphRenderer(gl, this.icon_manager.getIconMap());

                //TODO: Need wider access to nodes to allow them to be 'updated, I think we also need copy of the JSON so we can 'insert' new bits into it.
                this.nodePositions = np;
                this.nodeVisuals = nv;
                this.labels = labels;
                this.vxIDToPosMap = vxIdPosMap;
                this.txIDToPosMap = txIdPosMap;

                // Create maps position back to vertex, ie the reverse of supplied maps.
                this.posToVxIDMap = new Map();
                this.vxIDToPosMap.forEach((vxPos, vx) => {
                    this.posToVxIDMap.set(vxPos, vx);
                })

                // Create maps position back to transaction, ie the reverse of supplied maps.
                this.posToTxIDMap = new Map();
                this.txIDToPosMap.forEach((txPos, tx) => {
                    this.posToTxIDMap.set(txPos, tx);
                })

                const camera = new Camera(this.graphRenderer);
                camera.setProjection(1024, 1024, Math.PI * 0.5, 1, 10000);
                camera.lookAt(new Float32Array([400, 0, 300]), new Float32Array([0, 0, 0]), new Float32Array([0, 1, 0]));

                this.graphRenderer.setNodes(this.nodePositions, this.nodeVisuals);
                this.graphRenderer.setLinks(lp);

                var glyphRenderer = new GlyphRenderer(36, 'NotoSansSC-Black.otf', 2, (error) => {
                    this.graphRenderer.setGlyphRenderer(glyphRenderer);

                    const glyphs = [];
                    for (var i = 0; i < this.nodePositions.length / 4; i++) {
                        if (this.labels[i]) {
                            glyphRenderer.renderText(i, 0, this.labels[i], glyphs);
                        }
                    }
                    this.graphRenderer.setGlyphSize(3);
                    this.graphRenderer.setGlyphs(new Float32Array(glyphs));
                    this.graphRenderer.setGlyphColor(new Float32Array([1, 1, 0]));
                });

                controller.render = (gl, time) => {
                    this.graphRenderer.render();
                };

                controller.updateSize = (width, height) => {
                    camera.setSize(width, height);
                };

                controller.start();

                const nodeClickSelector = new NodeClickSelector(this, this.canvasRef.current, camera, this.graphRenderer, this.nodePositions, this.nodeVisuals, true);
                const nodeHoverSelector = new NodeHoverSelector(this.canvasRef.current, camera, this.graphRenderer, this.nodePositions, this.nodeVisuals, true);
                new ZoomGesture(nodeHoverSelector);
                new PanGesture(nodeHoverSelector);
                new DragGesture(nodeHoverSelector, (pos, x, y, z) => {
                    if (pos !== undefined && this.posToVxIDMap.get(pos) !== undefined) {
                        // Callback from DragGesture is triggered on mouse up after dragging a vertex, construct a message
                        // and post update to backend database.
                        const data = { 'graph_id': this.state.currentGraphId, 'vx_id': this.posToVxIDMap.get(pos), 'x': x, 'y': y, 'z': z };
                        fetch('http://' + host + '/edit_vertex_attribs/',
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
                });

                new Rotator(this.canvasRef.current, camera);
            });
    }

    render() {
        return (
            <div>
                <canvas ref={this.canvasRef} />
            </div>
        )
    }
}

export default GraphComponent;
