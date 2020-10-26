import React, { Component } from 'react'

import { CanvasController } from './renderer/CanvasController';
import { GraphRenderer } from './renderer/GraphRenderer';

import { GlyphRenderer } from './renderer/GlyphRenderer';

import './GraphComponent.css';
import { Camera } from './renderer/Camera';
import { NodeHoverSelector } from './renderer/listeners/NodeHoverSelector';
import { ZoomGesture } from './renderer/listeners/ZoomGesture';
import { TestGraphs } from './TestGraphs';
import { DragGesture } from './renderer/listeners/DragGesture';

class GraphComponent extends Component {

  canvasRef = React.createRef();

  // runs once when the component mounts.
  componentDidMount = () => {
    const testGraph = TestGraphs.closestNeighbours(50, 80, 50);
    const controller = new CanvasController(this.canvasRef.current);
    const gl = controller.gl;

    const graphRenderer = new GraphRenderer(gl);

    const camera = new Camera(graphRenderer);
    camera.setProjection(1024, 1024, Math.PI * 0.5, 1, 10000);
    camera.lookAt(new Float32Array([100, 0, 300]), new Float32Array([0, 0, 0]), new Float32Array([0, 1, 0]));

    graphRenderer.setNodes(testGraph.nodePositions, testGraph.nodeVisuals);
    graphRenderer.setLinks(testGraph.linkPositions);

    var glyphRenderer = new GlyphRenderer(36, 'NotoSansSC-Black.otf', 2, (error) => {
      graphRenderer.setGlyphRenderer(glyphRenderer);

      const glyphs = [];
      for (var i = 0; i < testGraph.nodePositions.length / 4; i++) {
        glyphRenderer.renderText(i, 0, "Node " + i, glyphs);
        glyphRenderer.renderText(i, -1, "Vertex " + i, glyphs);
      }
      graphRenderer.setGlyphSize(3);
      graphRenderer.setGlyphs(new Float32Array(glyphs));
      graphRenderer.setGlyphColor(new Float32Array([1, 1, 0]));
    });

    controller.render = (gl, time) => {
      graphRenderer.render();
    };

    controller.updateSize = (width, height) => {
      camera.setSize(width, height);
    };

    controller.start();

    const nodeHoverSelector = new NodeHoverSelector(this.canvasRef.current, camera, graphRenderer, testGraph.nodePositions, testGraph.nodeVisuals, true);
    new ZoomGesture(nodeHoverSelector);
    new DragGesture(nodeHoverSelector);
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
