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
import { string } from 'yargs';

class GraphComponent extends Component {

    canvasRef = React.createRef();

    constructor() {
      super();
      this.endpoint = "ws://127.0.0.1:8000/ws/updates/"
      this.state = {
        numberOfVertices: Number(),
        currentGraphId: Number(),
        operationType: String(),
        graphTitle: String()
      };
      this.updateGraphId = this.updateGraphId.bind(this);
    }

    addWebStocket() {
      // Initialise WebSocket
      // This will fail if the endpoint cannot send a handshake in time (When server is not booted yet)
      const ws = new WebSocket(this.endpoint)
      ws.onmessage = evt =>{
        const message = JSON.parse(evt.data)
        const response = JSON.parse(message["message"])

        this.setState(state => {
           return {
            currentGraphId: response["graph_id"],
            operationType: response["operation"]
           };
         });

         this.updateGraphDetails()
      }
    }

    // fetches the details of the most recently updated graph
    // and stores them in state.
    // TODO: Currently uses next_vertex_id to determine the total count of vertices.
    updateGraphDetails() {
      fetch('http://127.0.0.1:8000/graphs/' + this.state.currentGraphId)
      .then(response => response.json())
      .then(data => 
        this.setState(state => {
        return {
          numberOfVertices: data["next_vertex_id"],
          graphTitle: data["title"]
        };
      })
      )
    }

    updateGraphId(event) {
      this.setState({currentGraphId: event.target.value}, () => {
        this.updateGraphDetails();
    });
    }
    
    componentDidMount = () => {    

      this.addWebStocket();

      var controller = new CanvasController(this.canvasRef.current);
      var gl = controller.gl;
  
      const nodeCount = 1000; const graphRadius = 400; const linkLength = 100;
      // const nodeCount = 50000; const graphRadius = 400; const linkLength = 20;
        
      var { nodePositions, nodeVisuals, linkPositions } = TestGraphs.closestNeighbours(nodeCount, graphRadius, linkLength);
      // var { nodePositions, nodeVisuals, linkPositions } = TestGraphs.center();
      
      // ConstellationGraphLoader.load("test_graph.json", (np, nv, labels) => {

      // });

      const graphRenderer = new GraphRenderer(gl);

      const camera = new Camera(graphRenderer);
      camera.setProjection(1024, 1024, Math.PI * 0.5, 1, 10000);
      camera.lookAt(new Float32Array([400, 0, 300]), new Float32Array([0, 0, 0]), new Float32Array([0, 1, 0]));

      graphRenderer.setNodes(nodePositions, nodeVisuals);
      graphRenderer.setLinks(linkPositions);

      var glyphRenderer = new GlyphRenderer(36, 'NotoSansSC-Black.otf', 2, (error) => {
        graphRenderer.setGlyphRenderer(glyphRenderer);

        const glyphs = [];
        const labels = ["这是什么", "abcdefghijklmnopqrstuvwxyz", "يونيكود.", "Node"];
        for (var i = 0; i < nodeCount; i++) {
          const label1 = Math.floor(Math.random() * labels.length);
          glyphRenderer.renderText(i, 0, labels[label1] + "-" + i, glyphs);
          const label2 = Math.floor(Math.random() * labels.length);
          glyphRenderer.renderText(i, -1, labels[label2] + "-" + i, glyphs);
        }
        graphRenderer.setGlyphScale(3);
        graphRenderer.setGlyphs(new Float32Array(glyphs));
        graphRenderer.setGlyphColor(new Float32Array([1, 1, 0]));
      });

      const rotateAction = new RotateAction(this.camera);
      const frameRateAction = new FrameRateAction();

      controller.render = (gl, time) => {
        // rotateAction.execute(time);
        // frameRateAction.execute(time);
        graphRenderer.render();
      };

      controller.updateSize = (width, height) => {
        camera.setSize(width, height);
      };

      controller.start();

      // new Trackball(this.canvasRef.current, camera);
      
      const nodeHoverSelector = new NodeHoverSelector(this.canvasRef.current, camera, graphRenderer, nodePositions, nodeVisuals, true);
      new ZoomGesture(nodeHoverSelector);
      new PanGesture(nodeHoverSelector);

      // new NodeClickSelector(this.canvasRef.current, camera, graphRenderer, nodePositions, nodeVisuals, false);

      new Rotator(this.canvasRef.current, camera);
    }



render() {
        return (
          <div>
            <label>showing most recently updated graph OR showing graph details by id</label>
            <br/>
            <label>Graph Title: {this.state.graphTitle}</label>
            <br/>
            <form>
            <label> Graph Id: </label>
            <input style={{width: '100px'}} type="number" value={this.state.currentGraphId} onChange={this.updateGraphId}/>
            <br/>
            <label>Number of Vertices: {this.state.numberOfVertices}</label>
            <br/>
            </form>
            
            <canvas ref={this.canvasRef} />
          </div>
        )
    }
}

export default GraphComponent;
