import { Camera } from "../Camera";
import { Matrix } from "./Matrix";

export class Selector {

  private static pixelVector = Matrix.createVector();
  private static transformedPoint = Matrix.createVector();

  static selectNode = (x: number, y: number, camera: Camera, nodePositions: Float32Array, nodeCount: number): number | null => {
    const pixelVector = Selector.pixelVector;
    const transformedPoint = Selector.transformedPoint;
    
    camera.updatePixelVector(x, y, pixelVector);
    
    let directHitZ = -camera.far;
    let directHitId: number | null = null;

    for (let nodeId = 0; nodeId < nodeCount; nodeId++) {
      const nodeOffset = nodeId * 4;
      if (Matrix.world2LocalPointInRange(nodePositions, nodeOffset, camera.viewMatrix, -camera.near, directHitZ, transformedPoint)) {
        const x = pixelVector[0] * -transformedPoint[2];
        const y = pixelVector[1] * -transformedPoint[2];
        const distX = x - transformedPoint[0];
        const distY = y - transformedPoint[1];
        const radius = nodePositions[nodeOffset + 3];
        if (distX * distX + distY * distY < radius * radius) {
          directHitZ = transformedPoint[2];
          directHitId = nodeId; 
        }
      }
    }

    return directHitId;
  }

  static selectClosestNode = (x: number, y: number, camera: Camera, nodePositions: Float32Array, nodeCount: number): number | null => {
    const pixelVector = Selector.pixelVector;
    const transformedPoint = Selector.transformedPoint;
    
    camera.updatePixelVector(x, y, pixelVector);
    
    let directHitZ = -camera.far;
    let directHitId: number | null = null;

    let closestId: number | null = null;
    let closestDistance: number = Number.POSITIVE_INFINITY;

    for (let nodeId = 0; nodeId < nodeCount; nodeId++) {
      const nodeOffset = nodeId * 4;

      if (Matrix.world2LocalPointInRange(nodePositions, nodeOffset, camera.viewMatrix, -camera.near, -camera.far, transformedPoint)) {
          
        const x = pixelVector[0] * -transformedPoint[2];
        const y = pixelVector[1] * -transformedPoint[2];
        const distanceX = x - transformedPoint[0];
        const distanceY = y - transformedPoint[1];
        const distanceSquared = distanceX * distanceX + distanceY * distanceY;
        const radius = nodePositions[nodeOffset + 3];
        
        if (transformedPoint[2] > -directHitZ && distanceSquared < radius * radius) {
          directHitZ = transformedPoint[2];
          directHitId = nodeId; 
        } else if (directHitId === null) {
          const distance = Math.sqrt(distanceSquared);
          const offset = (distance - radius) / -transformedPoint[2];
          if (offset < closestDistance) {
            closestDistance = offset;
            closestId = nodeId;
          }
        }
      }
    }

    return closestId || closestId;
  }
}