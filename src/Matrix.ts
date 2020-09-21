export class Matrix {

  static createMatrix = () => {
    return new Float32Array(16);
  }

  static normalize = (vector: number[]): void => {
    const length = Math.sqrt(vector[0] * vector[0] + vector[1] * vector[1] + vector[2] * vector[2]);
    if (length > 0) { 
      vector[0] /= length;
      vector[1] /= length;
      vector[2] /= length;
    }
  }

  static cross = (a: number[], b: number[]): number[] => {
    return [
      a[1] * b[2] - a[2] * b[1],
      a[2] * b[0] - a[0] * b[2],
      a[0] * b[1] - a[1] * b[0]
    ];
  }

  static dot = (a: number[], b: number[]): number => {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  }
  
  static createViewMatrix = (eyeX: number, eyeY: number, eyeZ: number, targetX: number, targetY: number, targetZ: number,  upX: number, upY: number, upZ: number): Float32Array => {
    const matrix = Matrix.createMatrix();
    Matrix.updateViewMatrix(eyeX, eyeY, eyeZ, targetX, targetY, targetZ, upX, upY, upZ, matrix);
    return matrix;
  }
  
  static updateViewMatrix = (eyeX: number, eyeY: number, eyeZ: number, targetX: number, targetY: number, targetZ: number,  upX: number, upY: number, upZ: number, matrix: Float32Array): void => {
    var zx = eyeX - targetX;
    var zy = eyeY - targetY;
    var zz = eyeZ - targetZ;

    const zLength = Math.sqrt(zx * zx + zy * zy + zz * zz);
    if (zLength > 0) { 
      zx /= zLength;
      zy /= zLength;
      zz /= zLength;
    }

    var xx = zy * upZ - zz * upY;
    var xy = zz * upX - zx * upZ;
    var xz = zx * upY - zy * upX;

    const xLength = Math.sqrt(xx * xx + xy * xy + xz * xz);
    if (xLength > 0) { 
      xx /= xLength;
      xy /= xLength;
      xz /= xLength;
    }

    const yx = xy * zz - xz * zy;
    const yy = xz * zx - xx * zz;
    const yz = xx * zy - xy * zx;

    const xDotEye = xx * eyeX + xy * eyeY + xz * eyeZ;
    const yDotEye = yx * eyeX + yy * eyeY + yz * eyeZ;
    const zDotEye = zx * eyeX + zy * eyeY + zz * eyeZ;

    matrix[0] = xx;
    matrix[1] = yx;
    matrix[2] = zx;
    matrix[3] = 0;
    
    matrix[4] = xy;
    matrix[5] = yy;
    matrix[6] = zy;
    matrix[7] = 0;
    
    matrix[8] = xz;
    matrix[9] = yz;
    matrix[10] = zz;
    matrix[11] = 0;
    
    matrix[12] = -xDotEye;
    matrix[13] = -yDotEye;
    matrix[14] = -zDotEye;
    matrix[15] = 1;
  }

  static createProjectionMatrix = (fieldOfViewInRadians: number, aspectRatio: number, near: number, far: number): Float32Array => {
    const matrix = Matrix.createMatrix();
    Matrix.updateProjectionMatrix(fieldOfViewInRadians, aspectRatio, near, far, matrix);
    return matrix;
  }

  static updateProjectionMatrix = (fieldOfViewInRadians: number, aspectRatio: number, near: number, far: number, matrix: Float32Array): void => {
    var f = 1.0 / Math.tan(fieldOfViewInRadians / 2);
    var rangeInv = 1.0 / (near - far);
    
    matrix[0] = f / aspectRatio;
    matrix[1] = 0;
    matrix[2] = 0;
    matrix[3] = 0;

    matrix[4] = 0;
    matrix[5] = f;
    matrix[6] = 0;
    matrix[7] = 0;

    matrix[8] = 0;
    matrix[9] = 0;
    matrix[10] = (near + far) * rangeInv;
    matrix[11] = -1;

    matrix[12] = 0;
    matrix[13] = 0;
    matrix[14] = near * far * rangeInv * 2;
    matrix[15] = 0;
  }

  static rotatePoint = (point: Float32Array, viewMatrix: Float32Array, result: Float32Array): void => {
    const x = point[0] - viewMatrix[12];
    const y = point[1] - viewMatrix[13];
    const z = point[2] - viewMatrix[14];


  }
}