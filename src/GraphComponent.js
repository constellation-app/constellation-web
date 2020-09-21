import React, { Component } from 'react'

import { Matrix } from './Matrix';
import { CanvasController } from './CanvasController';
import { GraphRenderer } from './GraphRenderer';

import { RotateAction, FrameRateAction } from './CanvasActions';
import { GlyphRenderer } from './GlyphRenderer';
import { TestGraphs } from './TestGraphs';

import './GraphComponent.css';

class GraphComponent extends Component {

    canvasRef = React.createRef();

    componentDidMount = () => {      
      var controller = new CanvasController(this.canvasRef.current);
      var gl = controller.gl;
  
      const viewMatrix = Matrix.createViewMatrix(0, 0, 10, 0, 0, 0, 0, 1, 0);
      const projectionMatrix = Matrix.createProjectionMatrix(1, gl.canvas.width / gl.canvas.height, 1, 10000);
      
      const nodeCount = 1000; const graphRadius = 400; const linkLength = 100;
      // const nodeCount = 50000; const graphRadius = 400; const linkLength = 20;
        
      var { nodePositions, nodeVisuals, linkPositions } = TestGraphs.closestNeighbours(nodeCount, graphRadius, linkLength);
      console.log(linkPositions.length / 4);

      const graphRenderer = new GraphRenderer(gl);
      graphRenderer.setViewMatrix(viewMatrix);
      graphRenderer.setProjectionMatrix(projectionMatrix);
      graphRenderer.setNodes(nodePositions, nodeVisuals);
      graphRenderer.setLinks(linkPositions);
      graphRenderer.setGlyphScale(3);

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

      const rotateAction = new RotateAction(graphRenderer);
      const frameRateAction = new FrameRateAction();

      controller.render = (gl, time) => {
        rotateAction.execute(time);
        frameRateAction.execute(time);
        graphRenderer.render();
      };

      controller.updateSize = (width, height) => {
        Matrix.updateProjectionMatrix(1, width / height, 1, 10000, projectionMatrix);
        graphRenderer.setProjectionMatrix(projectionMatrix);
      };

      controller.start();
    }

    render() {
        return (
            <canvas ref={this.canvasRef} />
        )
    }
}

export default GraphComponent;
