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
    
    componentDidMount = () => {     

      const e = new ElementList(2);
      const id = e.add();
      console.log(id);
      console.log(e.getCount());
      
      var controller = new CanvasController(this.canvasRef.current);
      var gl = controller.gl;
  
      // const nodeCount = 1000; const graphRadius = 400; const linkLength = 100;
      // // const nodeCount = 50000; const graphRadius = 400; const linkLength = 20;
        
      // var { nodePositions, nodeVisuals, linkPositions } = TestGraphs.closestNeighbours(nodeCount, graphRadius, linkLength);
      // var { nodePositions, nodeVisuals, linkPositions } = TestGraphs.center();
      
      ConstellationGraphLoader.load("test_graph.json", (np, nv, labels, lp) => {
        const graphRenderer = new GraphRenderer(gl);

        const camera = new Camera(graphRenderer);
        camera.setProjection(1024, 1024, Math.PI * 0.5, 1, 10000);
        camera.lookAt(new Float32Array([400, 0, 300]), new Float32Array([0, 0, 0]), new Float32Array([0, 1, 0]));

        graphRenderer.setNodes(np, nv);
        graphRenderer.setLinks(lp);

        var glyphRenderer = new GlyphRenderer(36, 'NotoSansSC-Black.otf', 2, (error) => {
          graphRenderer.setGlyphRenderer(glyphRenderer);
  
          const glyphs = [];
          for (var i = 0; i < np.length / 4; i++) {
            if (labels[i]) {
              glyphRenderer.renderText(i, 0, labels[i], glyphs);
            }
          }
          graphRenderer.setGlyphScale(3);
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

        const nodeHoverSelector = new NodeHoverSelector(this.canvasRef.current, camera, graphRenderer, np, nv, true);
        new ZoomGesture(nodeHoverSelector);
        new PanGesture(nodeHoverSelector);
        new Rotator(this.canvasRef.current, camera);
      });

      // const graphRenderer = new GraphRenderer(gl);

      // const camera = new Camera(graphRenderer);
      // camera.setProjection(1024, 1024, Math.PI * 0.5, 1, 10000);
      // camera.lookAt(new Float32Array([400, 0, 300]), new Float32Array([0, 0, 0]), new Float32Array([0, 1, 0]));

      // graphRenderer.setNodes(nodePositions, nodeVisuals);
      // graphRenderer.setLinks(linkPositions);

      // var glyphRenderer = new GlyphRenderer(36, 'NotoSansSC-Black.otf', 2, (error) => {
      //   graphRenderer.setGlyphRenderer(glyphRenderer);

      //   const glyphs = [];
      //   const labels = ["这是什么", "abcdefghijklmnopqrstuvwxyz", "يونيكود.", "Node"];
      //   for (var i = 0; i < nodeCount; i++) {
      //     const label1 = Math.floor(Math.random() * labels.length);
      //     glyphRenderer.renderText(i, 0, labels[label1] + "-" + i, glyphs);
      //     const label2 = Math.floor(Math.random() * labels.length);
      //     glyphRenderer.renderText(i, -1, labels[label2] + "-" + i, glyphs);
      //   }
      //   graphRenderer.setGlyphScale(3);
      //   graphRenderer.setGlyphs(new Float32Array(glyphs));
      //   graphRenderer.setGlyphColor(new Float32Array([1, 1, 0]));
      // });

      // const rotateAction = new RotateAction(this.camera);
      // const frameRateAction = new FrameRateAction();

      // controller.render = (gl, time) => {
      //   // rotateAction.execute(time);
      //   // frameRateAction.execute(time);
      //   graphRenderer.render();
      // };

      // controller.updateSize = (width, height) => {
      //   camera.setSize(width, height);
      // };

      // controller.start();

      // // new Trackball(this.canvasRef.current, camera);
      
      // const nodeHoverSelector = new NodeHoverSelector(this.canvasRef.current, camera, graphRenderer, nodePositions, nodeVisuals, true);
      // new ZoomGesture(nodeHoverSelector);
      // new PanGesture(nodeHoverSelector);

      // // new NodeClickSelector(this.canvasRef.current, camera, graphRenderer, nodePositions, nodeVisuals, false);

      // new Rotator(this.canvasRef.current, camera);
    }

    render() {
        return (
            <canvas ref={this.canvasRef} />
        )
    }
}

export default GraphComponent;
