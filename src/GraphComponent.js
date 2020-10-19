import React, { Component } from 'react'

import { CanvasController } from './renderer/CanvasController';
import { GraphRenderer } from './renderer/GraphRenderer';

import { RotateAction, FrameRateAction } from './CanvasActions';
import { GlyphRenderer } from './renderer/GlyphRenderer';
import { TestGraphs } from './TestGraphs';

import './GraphComponent.css';
import { BufferBuilder } from './renderer/utilities/BufferBuilder';
import { Selector } from './renderer/utilities/Selector';
import { Trackball } from './renderer/listeners/Trackball';
import { Camera } from './renderer/Camera';
import { NodeHoverSelector } from './renderer/listeners/NodeHoverSelector';
import { ZoomGesture } from './renderer/listeners/ZoomGesture';
import { PanGesture } from './renderer/listeners/PanGesture';
import { NodeClickSelector } from './renderer/listeners/NodeClickSelector';
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
  loadVertex(vx_id) {
    console.log("MMDEBUG:loadVertex: ");
    fetch('http://127.0.0.1:8000/vertexes/' + vx_id )
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else {
            throw new Error('Unable to load Vertex with id=' + vx_id);
          }
        })
        .then((response) => {
          console.log('MMDEBUG valid Vertex:' + vx_id);
          this.nodePositions[(vx_id * 4)] = response["json"]["x"];
          this.nodePositions[(vx_id * 4) + 1] = response["json"]["y"];
          this.nodePositions[(vx_id * 4) + 2] = response["json"]["z"];
        })
        .catch((error) => {
              console.log('MMDEBUG invalid Vertex:' + vx_id);
        });
  }


  // TODO: WEBSOCKET CODE
  addWebSocket() {
    console.log('MMDEBUG: addWebSocket');
    // Initialise WebSocket
    // This will fail if the endpoint cannot send a handshake in time (When server is not booted yet)
    const ws = new WebSocket(this.websocket_endpoint)
    ws.onmessage = evt =>{

      const message = JSON.parse(evt.data)
      const response = JSON.parse(message["message"])
      console.log("in event: " + response["graph_id"] + " = " + this.state.currentGraphId + (response["graph_id"] ==  this.state.currentGraphId));
      console.log("response: " + evt.data);


      if (response["graph_id"] == this.state.currentGraphId) {
        console.log('MMDEBUG: received update for ' + this.state.currentGraphId + ', operation=' + response["operation"] + ', type=' + response["type"]);
        this.nodePositions[0] = this.nodePositions[0] - 1.8;
        this.nodePositions[5] = this.nodePositions[5] - 1.8;
        this.nodePositions[10] = this.nodePositions[10] - 1.8;
        this.nodeVisuals[0] = this.nodeVisuals[0] + 1
        this.graphRenderer.setNodes(this.nodePositions, this.nodeVisuals);
        console.log(this.nodeVisuals);

        // Create
        if (response["operation"] == "CREATE") {

          // Vertex
          if (response["type"] == "Vertex" || response["type"] == "VertexAttrib")  {
            console.log('MMDEBUG: TODO Vertex/VertexAttrib create' + response["vertex_id"]);
            this.loadVertex(response["vertex_id"]);
          } 
          // Transaction
          else if (response["type"] == "Transaction" || response["type"] == "TransactionAttrib")  {
            console.log('MMDEBUG: TODO Transaction/TransactionAttrib create');
          }
        } 

         // Update
        else if (response["operation"] == "UPDATE") {

          // Vertex
          if (response["type"] == "Vertex" || response["type"] == "VertexAttrib")  {
            console.log('MMDEBUG: TODO Vertex/VertexAttrib update' + response["vertex_id"]);
            this.loadVertex(response["vertex_id"]);
          } 
          // Transaction
          else if (response["type"] == "Transaction" || response["type"] == "TransactionAttrib")  {
            console.log('MMDEBUG: TODO Transaction/TransactionAttrib update');
          }
        } 
        // Delete
        else if (response["operation"] == "DELETE") {
          console.log('MMDEBUG: TODO ......... delete');
        }
      }

    }
  }

  // runs once when the component mounts.
  componentDidMount = () => {
    console.log(this.state.currentGraphId);
      const e = new ElementList(2);
      const id = e.add();
      console.log(id);
      console.log(e.getCount());
      
      this.displayGraph();

    }


    // used to display the graph based on a request to the API
displayGraph() {
  this.addWebSocket();
  var controller = new CanvasController(this.canvasRef.current);
      var gl = controller.gl;


      ConstellationGraphLoader.load("http://localhost:8000/graphs/" + this.state.currentGraphId + "/json", (np, nv, labels, lp) => {
        this.graphRenderer = new GraphRenderer(gl);

        //TODO: Need wider access to nodes to allow them to be 'updated, I think we also need copy of the JSON so we can 'insert' new bits into it.
        this.nodePositions = np;
        this.nodeVisuals = nv;

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
