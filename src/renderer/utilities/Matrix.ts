export class Matrix {

  private static z: Float32Array = new Float32Array(3);
  private static y: Float32Array = new Float32Array(3);
  private static x: Float32Array = new Float32Array(3);
  private static temp: Float32Array = new Float32Array(3);

  static createMatrix = () => {
    return new Float32Array(16);
  }

  static createVector = () => {
    return new Float32Array(3);
  }

  static copyVector = (source: Float32Array, destination: Float32Array): void => {
    destination[0] = source[0];
    destination[1] = source[1];
    destination[2] = source[2];
  }

  static copyVectorFromBuffer = (buffer: Float32Array, offset: number, destination: Float32Array): void => {
    destination[0] = buffer[offset];
    destination[1] = buffer[offset + 1];
    destination[2] = buffer[offset + 2];
  }

  static copyMatrix = (source: Float32Array, destination: Float32Array): void => {
    destination[0] = source[0];
    destination[1] = source[1];
    destination[2] = source[2];
    destination[3] = source[3];

    destination[4] = source[4];
    destination[5] = source[5];
    destination[6] = source[6];
    destination[7] = source[7];

    destination[8] = source[8];
    destination[9] = source[9];
    destination[10] = source[10];
    destination[11] = source[11];

    destination[12] = source[12];
    destination[13] = source[13];
    destination[14] = source[14];
    destination[15] = source[15];
  }

  static vectorLength = (vector: Float32Array): number => {
    return Math.sqrt(vector[0] * vector[0] + vector[1] * vector[1] + vector[2] * vector[2]);
  }

  static normalize = (vector: Float32Array, result: Float32Array): void => {
    const scale = 1.0 / Matrix.vectorLength(vector);
    result[0] = vector[0] * scale;
    result[1] = vector[1] * scale;
    result[2] = vector[2] * scale;
  }

  static cross = (a: Float32Array, b: Float32Array, result: Float32Array): void => {
    result[0] = a[1] * b[2] - a[2] * b[1];
    result[1] = a[2] * b[0] - a[0] * b[2];
    result[2] = a[0] * b[1] - a[1] * b[0];
  }

  static dot = (a: Float32Array, b: Float32Array): number => {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  }
  
  static subtract = (a: Float32Array, b: Float32Array, result: Float32Array): void => {
    result[0] = a[0] - b[0];
    result[1] = a[1] - b[1];
    result[2] = a[2] - b[2];
  }

  static add = (a: Float32Array, b: Float32Array, result: Float32Array): void => {
    result[0] = a[0] + b[0];
    result[1] = a[1] + b[1];
    result[2] = a[2] + b[2];
  }

  static scale = (vector: Float32Array, scale: number, result: Float32Array): void => {
    result[0] = vector[0] * scale;
    result[1] = vector[1] * scale;
    result[2] = vector[2] * scale;
  }

  static multiply = (a: Float32Array, b: Float32Array, result: Float32Array): void => {
    result[0] = a[0] * b[0] + a[4] * b[1] + a[8] * b[2] + a[12] * b[3];
    result[1] = a[1] * b[0] + a[5] * b[1] + a[9] * b[2] + a[13] * b[3];
    result[2] = a[2] * b[0] + a[6] * b[1] + a[10] * b[2] + a[14] * b[3];
    result[3] = a[3] * b[0] + a[7] * b[1] + a[11] * b[2] + a[15] * b[3];
    
    result[0] = a[0] * b[4] + a[4] * b[5] + a[8] * b[6] + a[12] * b[7];
    result[1] = a[1] * b[4] + a[5] * b[5] + a[9] * b[6] + a[13] * b[7];
    result[2] = a[2] * b[4] + a[6] * b[5] + a[10] * b[6] + a[14] * b[7];
    result[3] = a[3] * b[4] + a[7] * b[5] + a[11] * b[6] + a[15] * b[7];
    
    result[0] = a[0] * b[8] + a[4] * b[9] + a[8] * b[10] + a[12] * b[11];
    result[1] = a[1] * b[8] + a[5] * b[9] + a[9] * b[10] + a[13] * b[11];
    result[2] = a[2] * b[8] + a[6] * b[9] + a[10] * b[10] + a[14] * b[11];
    result[3] = a[3] * b[8] + a[7] * b[9] + a[11] * b[10] + a[15] * b[11];
    
    result[0] = a[0] * b[12] + a[4] * b[13] + a[8] * b[14] + a[12] * b[15];
    result[1] = a[1] * b[12] + a[5] * b[13] + a[9] * b[14] + a[13] * b[15];
    result[2] = a[2] * b[12] + a[6] * b[13] + a[10] * b[14] + a[14] * b[15];
    result[3] = a[3] * b[12] + a[7] * b[13] + a[11] * b[14] + a[15] * b[15];
  }

  static createViewMatrix = (eye: Float32Array, target: Float32Array,  up: Float32Array): Float32Array => {
    const matrix = Matrix.createMatrix();
    Matrix.updateViewMatrix(eye, target, up, matrix);
    return matrix;
  }
  
  static updateViewMatrix = (eye: Float32Array, target: Float32Array,  up: Float32Array, matrix: Float32Array): void => {
    Matrix.subtract(eye, target, Matrix.temp); // Z = eye - target
    Matrix.normalize(Matrix.temp, Matrix.z); // Z

    Matrix.cross(Matrix.z, up, Matrix.temp); // X = Z cross up
    Matrix.normalize(Matrix.temp, Matrix.x); // X

    Matrix.cross(Matrix.x, Matrix.z, Matrix.y); // Y = X cross Z

    matrix[0] = Matrix.x[0];
    matrix[1] = Matrix.y[0];
    matrix[2] = Matrix.z[0];
    matrix[3] = 0;
    
    matrix[4] = Matrix.x[1];
    matrix[5] = Matrix.y[1];
    matrix[6] = Matrix.z[1];
    matrix[7] = 0;
    
    matrix[8] = Matrix.x[2];
    matrix[9] = Matrix.y[2];
    matrix[10] = Matrix.z[2];
    matrix[11] = 0;
    
    matrix[12] = -Matrix.dot(Matrix.x, eye);
    matrix[13] = -Matrix.dot(Matrix.y, eye);
    matrix[14] = -Matrix.dot(Matrix.z, eye);
    matrix[15] = 1;
  }

  static copyForwardVector = (viewMatrix: Float32Array, vector: Float32Array): void => {
    vector[0] = -viewMatrix[2];
    vector[1] = -viewMatrix[6];
    vector[2] = -viewMatrix[10];
  }

  static copyUpVector = (viewMatrix: Float32Array, vector: Float32Array): void => {
    vector[0] = viewMatrix[1];
    vector[1] = viewMatrix[5];
    vector[2] = viewMatrix[9];
  }

  static copyRightVector = (viewMatrix: Float32Array, vector: Float32Array): void => {
    vector[0] = viewMatrix[0];
    vector[1] = viewMatrix[4];
    vector[2] = viewMatrix[8];
  }

  static copyTranslationVector = (viewMatrix: Float32Array, vector: Float32Array): void => {
    vector[0] = viewMatrix[12];
    vector[1] = viewMatrix[13];
    vector[2] = viewMatrix[14];
  }

  static createProjectionMatrix = (fieldOfViewInRadians: number, aspectRatio: number, near: number, far: number): Float32Array => {
    const matrix = Matrix.createMatrix();
    Matrix.updateProjectionMatrix(fieldOfViewInRadians, aspectRatio, near, far, matrix);
    return matrix;
  }

  static updateProjectionMatrix = (fieldOfViewInRadians: number, aspectRatio: number, near: number, far: number, matrix: Float32Array): void => {
    var f = 1.0 / Math.tan(fieldOfViewInRadians * 0.5);
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
    matrix[14] = 2 * near * far * rangeInv;
    matrix[15] = 0;
  }

  static rotateAroundAxis = (angle: number, axis: Float32Array, matrix: Float32Array): void => {
    const s = Math.sin(angle);
    const c = Math.cos(angle);

    matrix[0] = c + axis[0] * axis[0] * (1.0 - c);
    matrix[1] = axis[1] * axis[0] * (1.0 - c) + axis[2] * s;
    matrix[2] = axis[2] * axis[0] * (1.0 - c) - axis[1] * s;
    matrix[3] = 0.0;
    
    matrix[4] = axis[0] * axis[1] * (1.0 - c) - axis[2] * s;
    matrix[5] = c + axis[1] * axis[1] * (1.0 - c);
    matrix[6] = axis[2] * axis[1] * (1.0 - c) + axis[0] * s;
    matrix[7] = 0.0;

    matrix[8] = axis[0] * axis[2] * (1.0 - c) + axis[1] * s;
    matrix[9] = axis[1] * axis[2] * (1.0 - c) - axis[0] * s;
    matrix[10] = c + axis[2] * axis[2] * (1.0 - c);
    matrix[11] = 0.0;

    matrix[12] = 0.0;
    matrix[13] = 0.0;
    matrix[14] = 0.0;
    matrix[15] = 1.0;
  }

  static world2LocalPoint = (point: Float32Array, pointOffset: number, viewMatrix: Float32Array, result: Float32Array): void => {
    const x = point[pointOffset + 0];
    const y = point[pointOffset + 1];
    const z = point[pointOffset + 2];

    result[0] = x * viewMatrix[0] + y * viewMatrix[4] + z * viewMatrix[8] + viewMatrix[12];
    result[1] = x * viewMatrix[1] + y * viewMatrix[5] + z * viewMatrix[9] + viewMatrix[13];
    result[2] = x * viewMatrix[2] + y * viewMatrix[6] + z * viewMatrix[10] + viewMatrix[14];
  }

  static world2LocalPointInRange = (point: Float32Array, pointOffset: number, viewMatrix: Float32Array, near: number, far: number, result: Float32Array): boolean => {
    const x = point[pointOffset + 0];
    const y = point[pointOffset + 1];
    const z = point[pointOffset + 2];

    result[2] = x * viewMatrix[2] + y * viewMatrix[6] + z * viewMatrix[10] + viewMatrix[14];
    if (result[2] < near && result[2] > far) {
      result[0] = x * viewMatrix[0] + y * viewMatrix[4] + z * viewMatrix[8] + viewMatrix[12];
      result[1] = x * viewMatrix[1] + y * viewMatrix[5] + z * viewMatrix[9] + viewMatrix[13];
      return true;
    } else {
      return false;
    }
  }

  static local2WorldPoint = (point: Float32Array, pointOffset: number, viewMatrix: Float32Array, result: Float32Array): void => {
    const x = point[pointOffset + 0] - viewMatrix[12];
    const y = point[pointOffset + 1] - viewMatrix[13];
    const z = point[pointOffset + 2] - viewMatrix[14];

    result[0] = x * viewMatrix[0] + y * viewMatrix[1] + z * viewMatrix[2];
    result[1] = x * viewMatrix[4] + y * viewMatrix[5] + z * viewMatrix[6];
    result[2] = x * viewMatrix[8] + y * viewMatrix[9] + z * viewMatrix[10];
  }

  static world2LocalVector = (point: Float32Array, pointOffset: number, viewMatrix: Float32Array, result: Float32Array): void => {
    const x = point[pointOffset + 0];
    const y = point[pointOffset + 1];
    const z = point[pointOffset + 2];

    result[0] = x * viewMatrix[0] + y * viewMatrix[4] + z * viewMatrix[8];
    result[1] = x * viewMatrix[1] + y * viewMatrix[5] + z * viewMatrix[9];
    result[2] = x * viewMatrix[2] + y * viewMatrix[6] + z * viewMatrix[10];
  }

  static local2WorldVector = (point: Float32Array, pointOffset: number, viewMatrix: Float32Array, result: Float32Array): void => {
    const x = point[pointOffset + 0];
    const y = point[pointOffset + 1];
    const z = point[pointOffset + 2];

    result[0] = x * viewMatrix[0] + y * viewMatrix[1] + z * viewMatrix[2];
    result[1] = x * viewMatrix[4] + y * viewMatrix[5] + z * viewMatrix[6];
    result[2] = x * viewMatrix[8] + y * viewMatrix[9] + z * viewMatrix[10];
  }
}