import { Camera } from './renderer/Camera';

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
    eye = new Float32Array([0, 0, 0]);
    target = new Float32Array([0, 0, 0]);
    up = new Float32Array([0, 1, 0]);
    camera: Camera;

    constructor(camera: Camera) {
      this.camera = camera;
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
      this.eye[0] = sin * (sin < 0 ? 1600 : 400);
      this.eye[2] = Math.cos(time) * 400;
      this.camera.lookAt(this.eye, this.target, this.up);
    }
  }