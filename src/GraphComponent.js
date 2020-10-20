import React, { Component } from 'react'

import { CanvasController } from './renderer/CanvasController';
import { GraphRenderer } from './renderer/GraphRenderer';

import { GlyphRenderer } from './renderer/GlyphRenderer';

import './GraphComponent.css';
import { BufferBuilder } from './renderer/utilities/BufferBuilder';
import { Camera } from './renderer/Camera';
import { NodeHoverSelector } from './renderer/listeners/NodeHoverSelector';
import { ZoomGesture } from './renderer/listeners/ZoomGesture';
import { PanGesture } from './renderer/listeners/PanGesture';
import { Rotator } from './renderer/listeners/Rotator';
import { ConstellationGraphLoader } from './ConstellationGraphLoader';
import { ElementList } from './ElementList';

class GraphComponent extends Component {

    canvasRef = React.createRef();

    // setting up a state variable to handle the current graph id
    constructor(){
      super()
      this.state = {
        currentGraphId: Number()
      };
      this.updateGraphId = this.updateGraphId.bind(this);
    }

    websocket_endpoint = "ws://127.0.0.1:8000/ws/updates/"
    nodePositions = [];
    nodeVisuals = [];
    vxIDPosMap = Map;
    txIDPosMap = Map;

    // update the current displayed graph value by setting the state.
    updateGraphId(value) {
      const Id = value.target.value;
    this.setState(state => {
      return {
        currentGraphId: Id
      };
    },() => {
      console.log("in callback of setting state");
      this.displayGraph();
    })
    }

    // Load a vertex into the buffer using a fetch request.
  loadVertex(vertex_id) {
    fetch('http://127.0.0.1:8000/vertexes/' + vertex_id )
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else {
            throw new Error('Unable to load Vertex with id=' + vertex_id);
          }
        })
        .then((response) => {
          const node = response["json"];
          BufferBuilder.updateNodePosition(this.vxIDPosMap.get(vertex_id), node["x"], node["y"], node["z"], 1, this.nodePositions);
          this.graphRenderer.setNodes(this.nodePositions, this.nodeVisuals);

        })
        .catch((error) => {
              console.log('TODO invalid Vertex:' + vertex_id);
        });
  }


  addWebSocket() {
    // Initialise WebSocket
    // This will fail if the endpoint cannot send a handshake in time (When server is not booted yet)
    const ws = new WebSocket(this.websocket_endpoint)
    ws.onmessage = evt =>{

      const message = JSON.parse(evt.data)
      const response = JSON.parse(message["message"])
      console.log("response: " + evt.data);

      if (response["graph_id"] == this.state.currentGraphId) {
        if (response["operation"] === "CREATE") {
          if (response["type"] === "Vertex" || response["type"] === "VertexAttrib")  {
            this.loadVertex(response["vertex_id"]);
          }
          else if (response["type"] === "Transaction" || response["type"] === "TransactionAttrib")  {
            console.log('TODO Transaction/TransactionAttrib create');
          }
        }
        else if (response["operation"] === "UPDATE") {
          if (response["type"] === "Vertex" || response["type"] === "VertexAttrib")  {
            this.loadVertex(response["vertex_id"]);
          }
          else if (response["type"] === "Transaction" || response["type"] === "TransactionAttrib")  {
            console.log('TODO Transaction/TransactionAttrib update');
          }
        }
        else if (response["operation"] === "DELETE") {
          console.log('TODO Delete');
        }
      }
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

      ConstellationGraphLoader.load("http://localhost:8000/graphs/" + this.state.currentGraphId + "/json",
          (np, nv, labels, lp, nodeIdMap, transIdMap) => {
        this.graphRenderer = new GraphRenderer(gl);

        //TODO: Need wider access to nodes to allow them to be 'updated, I think we also need copy of the JSON so we can 'insert' new bits into it.
        this.nodePositions = np;
        this.nodeVisuals = nv;
        this.vxIDPosMap = nodeIdMap;
        this.txIDPosMap = transIdMap;

        const camera = new Camera(this.graphRenderer);
        camera.setProjection(1024, 1024, Math.PI * 0.5, 1, 10000);
        camera.lookAt(new Float32Array([400, 0, 300]), new Float32Array([0, 0, 0]), new Float32Array([0, 1, 0]));

        this.graphRenderer.setNodes(this.nodePositions, this.nodeVisuals);
        this.graphRenderer.setLinks(lp);

        var glyphRenderer = new GlyphRenderer(36, 'NotoSansSC-Black.otf', 2, (error) => {
          this.graphRenderer.setGlyphRenderer(glyphRenderer);

          const glyphs = [];
          for (var i = 0; i < this.nodePositions.length / 4; i++) {
            if (labels[i]) {
              glyphRenderer.renderText(i, 0, labels[i], glyphs);
            }
          }
          this.graphRenderer.setGlyphScale(3);
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

        const nodeHoverSelector = new NodeHoverSelector(this.canvasRef.current, camera, this.graphRenderer, this.nodePositions, this.nodeVisuals, true);
        new ZoomGesture(nodeHoverSelector);
        new PanGesture(nodeHoverSelector);
        new Rotator(this.canvasRef.current, camera);
      });
}

    render() {
        return (
          <div>
            current graphId to display: 
            <input style={{width: '100px'}} type="number" value={this.state.currentGraphId} onChange={this.updateGraphId}/>
            <canvas ref={this.canvasRef} />
          </div>
        )
    }
}

export default GraphComponent;
