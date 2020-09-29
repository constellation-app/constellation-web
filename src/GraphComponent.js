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

class GraphComponent extends Component {

    canvasRef = React.createRef();
    camera = null;
    
    componentDidMount = () => {     

      var controller = new CanvasController(this.canvasRef.current);
      var gl = controller.gl;
  
      const nodeCount = 1000; const graphRadius = 400; const linkLength = 100;
      // const nodeCount = 50000; const graphRadius = 400; const linkLength = 20;
        
      var { nodePositions, nodeVisuals, linkPositions } = TestGraphs.closestNeighbours(nodeCount, graphRadius, linkLength);
      // var { nodePositions, nodeVisuals, linkPositions } = TestGraphs.center();
      
      this.nodePositions = nodePositions;
      this.nodeVisuals = nodeVisuals;
      
      const graphRenderer = new GraphRenderer(gl);

      this.camera = new Camera(graphRenderer);
      this.camera.setProjection(1024, 1024, Math.PI * 0.5, 1, 10000);
      this.camera.lookAt(new Float32Array([400, 0, 300]), new Float32Array([0, 0, 0]), new Float32Array([0, 1, 0]));

      graphRenderer.setNodes(nodePositions, nodeVisuals);
      graphRenderer.setLinks(linkPositions);
      graphRenderer.setGlyphScale(3);

      this.graphRenderer = graphRenderer;

      var glyphRenderer = new GlyphRenderer(36, 'NotoSansSC-Black.otf', 2, (error) => {
        graphRenderer.setGlyphRenderer(glyphRenderer);

        const glyphs = [];
        const labels = ["这是什么", "abcdefghijklmnopqrstuvwxyz", "يونيكود.", "Node"];
        for (var i = 0; i < nodeCount; i++) {
          const label = Math.floor(Math.random() * labels.length);
          glyphRenderer.renderText(i, labels[label] + "-" + i, glyphs);
        }
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
        this.camera.setSize(width, height);
      };

      controller.start();

      // new Trackball(this.canvasRef.current, this.camera);
      const nodeHoverSelector = new NodeHoverSelector(this.canvasRef.current, this.camera, this.graphRenderer, this.nodePositions, this.nodeVisuals, true);
      new ZoomGesture(nodeHoverSelector);
      new PanGesture(nodeHoverSelector);
    }

    clickHandler = (event) => {
      const selectedId = Selector.selectNode(event.clientX, event.clientY, this.camera, this.nodePositions);
      if (selectedId) {
        console.log(selectedId);
        BufferBuilder.selectNode(selectedId, this.nodeVisuals);
        this.graphRenderer.updateNodeVisuals(this.nodeVisuals, selectedId, selectedId + 1);
      }
    }

    render() {
        return (
            <canvas ref={this.canvasRef} />
        )
    }
}

export default GraphComponent;
