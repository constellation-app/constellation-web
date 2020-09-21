import { Matrix } from './Matrix';
import { GraphRenderer } from './GraphRenderer';

export class FrameRateAction {
    time = -1;
    count = 0;

    execute = (time: number): void => {
        if (this.time < 0) {
          this.time = Math.floor(time / 1000);
        } else {
          this.count += 1;
          const newTime = Math.floor(time / 1000);
          if (newTime > this.time) {
              this.time = newTime;
              console.log("FRAMES: " + this.count);
              this.count = 0;
          }
        }
      }
}

export class RotateAction {
    time = -1;
    viewMatrix = Matrix.createMatrix();

    readonly graphRenderer: GraphRenderer;
  
    constructor(graphRenderer: GraphRenderer) {
      this.graphRenderer = graphRenderer;
    }
  
    execute = (time: number): void => {
      if (this.time < 0) {
        this.time = time;
        this.createViewMatrix(0);
      } else {
        this.createViewMatrix((time - this.time) / 5000);
      }
    }
  
    createViewMatrix = (time: number) => {
      const sin = Math.sin(time);
      var x = sin * (sin < 0 ? 1600 : 400);
      var z = Math.cos(time) * 400;
      Matrix.updateViewMatrix(x, 0, z, 0, 0, 0, 0, 1, 0, this.viewMatrix);
      this.graphRenderer.setViewMatrix(this.viewMatrix);
    }
  }