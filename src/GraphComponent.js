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

    websocket_endpoint = "ws://127.0.0.1:8000/ws/updates/"
    graph_id = 1;
    nodePositions = [];
    nodeVisuals = [];





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
          console.log(response);
        })
        .catch((error) => {
              console.log('MMDEBUG invalid Vertrex:' + vx_id);
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


      if (response["graph_id"] === this.graph_id) {
        console.log('MMDEBUG: received update for ' + this.graph_id + ', operation=' + response["operation"] + ', type=' + response["type"]);
        this.nodePositions[0] = this.nodePositions[0] - 1.8;
        this.nodePositions[5] = this.nodePositions[5] - 1.8;
        this.nodePositions[10] = this.nodePositions[10] - 1.8;
        this.graphRenderer.setNodes(this.nodePositions, this.nodeVisuals);
        if (response["operation"] === "CREATE") {
          console.log('MMDEBUG: TODO ......... create');
        } else if (response["operation"] === "UPDATE") {

          if (response["type"] === "Vertex" || response["type"] === "VertexAttrib")  {
            console.log('MMDEBUG: TODO Vertex/VertexAttrib update');
            this.loadVertex(1);
          } else if (response["type"] === "Transaction" || response["type"] === "TransactionAttrib")  {
            console.log('MMDEBUG: TODO Transaction/TransactionAttrib update');
          }

        } else if (response["operation"] === "DELETE") {
          console.log('MMDEBUG: TODO ......... delete');
        }
      }

    }
  }


  componentDidMount = () => {

    this.addWebSocket();

      const e = new ElementList(2);
      const id = e.add();
      console.log(id);
      console.log(e.getCount());
      
      var controller = new CanvasController(this.canvasRef.current);
      var gl = controller.gl;


      ConstellationGraphLoader.load("http://localhost:8000/graphs/" + this.graph_id + "/json", (np, nv, labels, lp) => {
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
            <canvas ref={this.canvasRef} />
        )
    }
}

export default GraphComponent;
