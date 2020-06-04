'use strict';

/**
 * Take a JSON document representing a Constellation graph and visualise
 * it using babylon.js (www.babylonjs.com).
 *
 * TODO reverse all the z coordinates up front so I don't have to keep doing it in random code.
 *
 * @param {JSON} data A JSON document representing a Constellation graph.
 * @param {function} eventHandler A handler for any events that need handling
 * @param {string} resourceDir The directory where the resource subdirectories can be found.
 */
const createGraph = function(data, eventHandler, resourceDir='.') {
  const node_spritesVertexShader = `
    attribute vec4 position;
    attribute vec4 options;
    attribute vec2 inverts;
    attribute vec4 cellInfo;
    attribute vec4 color;

    uniform mat4 view;
    uniform mat4 projection;

    varying vec2 vUV;
    varying vec2 bgUV;
    varying vec4 vColor;
    // #include<fogVertexDeclaration>
    void main(void) {
      vec3 viewPos = (view*vec4(position.xyz, 1.0)).xyz;
      vec2 cornerPos;
      float angle = position.w;
      vec2 size = vec2(options.x,options.y);
      vec2 offset = options.zw;
      cornerPos = vec2(offset.x-0.5, offset.y-0.5)*size;

      // vec3 rotatedCorner;
      // rotatedCorner.x = cornerPos.x*cos(angle)-cornerPos.y*sin(angle);
      // rotatedCorner.y = cornerPos.x*sin(angle)+cornerPos.y*cos(angle);
      // rotatedCorner.z = 0.;

      vec3 rotatedCorner;
      rotatedCorner.x = cornerPos.x;
      rotatedCorner.y = cornerPos.y;
      rotatedCorner.z = 0.;

      viewPos += rotatedCorner;
      gl_Position = projection*vec4(viewPos,1.0);

      vColor = color;

      vec2 uvOffset = vec2(abs(offset.x-inverts.x), abs(1.0-offset.y-inverts.y));
      vec2 uvPlace = cellInfo.xy;
      vec2 uvSize = cellInfo.zw;
      vUV.x = uvPlace.x+uvSize.x*uvOffset.x;
      vUV.y = uvPlace.y+uvSize.y*uvOffset.y;

      // Extract the background icon position from angle.
      // All of the icons are the same size, so we can reuse size and offset.
      //
      vec2 bgPlace = vec2(trunc(angle)/67108864.0, angle - trunc(angle));
      bgUV.x = bgPlace.x + uvSize.x*uvOffset.x;
      bgUV.y = bgPlace.y + uvSize.y*uvOffset.y;

      // #ifdef FOG
      // vFogDistance = viewPos;
      // #endif
    }
    `;

  const node_spritesPixelShader = `
    uniform bool alphaTest;
    varying vec4 vColor;

    varying vec2 vUV;
    varying vec2 bgUV;
    uniform sampler2D diffuseSampler;

    // #include<fogFragmentDeclaration>

    void main(void) {
      vec4 color = texture2D(diffuseSampler, vUV);
      if(true) // (alphaTest)
      {
        if (color.a<0.1)
        {
          vec4 bgColor = texture2D(diffuseSampler,bgUV);
          if(bgColor.a<0.1) discard;
          // bgColor.a = 1.0;
          color = bgColor * vColor;
        }
      }
      // color *= vColor;

      // #include<fogFragment>

      gl_FragColor=color;
    }
    `;

  const canvas = document.getElementById('renderCanvas');
  const engine = new BABYLON.Engine(canvas, true, {preserveDrawingBuffer:true});
  console.log('Maximum texture size:', engine.getCaps().maxTextureSize);

  const resize = () =>  {
    console.log('GRAPH RESIZE');
    engine.resize();
  };

  const createScene = function () {
    const SIZE = 2.5;
    const ARROWHEAD_LENGTH = 0.5;

    class Highlighter {
      static createHighlighter(name, diameter, scene) {
        diameter *= 2;
        const mesh = BABYLON.MeshBuilder.CreateTorus('torus'+name, {diameter:diameter, thickness:1.0, tessellation:24}, scene);
        mesh.rotate(BABYLON.Axis.X, Math.PI/2, BABYLON.Space.LOCAL);
        mesh.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;

        const texture = new BABYLON.StandardMaterial('texture'+name, scene);
        // texture.emissiveTexture = new BABYLON.Texture(`${resourceDir}/highlight-texture.png`);
        texture.diffuseTexture = new BABYLON.Texture(`${resourceDir}/highlight-texture.png`);
        // texture.alpha = 0.9;
        // mat.backFaceCulling = true;
        mesh.material = texture;
        mesh.material.alpha = 0.75;
        return mesh;
      };

      constructor(scene) {
        this.diameter = SIZE;
        this.mesh = Highlighter.createHighlighter('highlight', this.diameter, scene);
        this.hide();
      }

      show(position, diameter, scene) {
        if(diameter!=this.diameter) {
          this.mesh.dispose();
          this.diameter = diameter;
          this.mesh = Highlighter.createHighlighter('highlight', this.diameter, scene);
        }

        // const glow = new BABYLON.GlowLayer("glow", scene);//, {mainTextureSamples:4});
        // glow.intensity = 0.5;
        // glow.addIncludedOnlyMesh(this.mesh);

        this.mesh.position = position;
        this.mesh.isVisible = true;
      }

      hide() {
        this.mesh.isVisible = false;
      }

      spin() {
        if(this.mesh.isVisible) {
          this.mesh.rotate(BABYLON.Axis.Z, Math.PI/24, BABYLON.Space.WORLD);
        }
      }

      dispose() {
        this.mesh.dispose();
      }
    }

    class HighlighterT3 {
      static createSpinner(name, diameter, color, scene) {
        const torus = BABYLON.MeshBuilder.CreateTorus('torus'+name, {diameter:diameter, thickness:0.5, tessellation:24}, scene);
        const texture = new BABYLON.StandardMaterial('texture'+name, scene);
        texture.diffuseColor = color;
        texture.emissiveColor = color;
        texture.alpha = 0.4;
        torus.material = texture;
        torus.material.wireframe = false;

        return torus;
      };

      create() {
        const d = this.diameter*2;
        this.torus1 = HighlighterT3.createSpinner('x', d, BABYLON.Color3.Red(), scene);
        this.torus1.rotate(BABYLON.Axis.X, Math.PI/2, BABYLON.Space.LOCAL);
        this.torus2 = HighlighterT3.createSpinner('y', d, BABYLON.Color3.Green(), scene)
        this.torus3 = HighlighterT3.createSpinner('z', d, BABYLON.Color3.Blue(), scene)
        this.torus3.rotate(BABYLON.Axis.Z, Math.PI/2, BABYLON.Space.WORLD);

        this.glow = new BABYLON.GlowLayer('glow_torus', scene);//, {mainTextureSamples:4});
        this.glow.intensity = 1.0;
        this.glow.addIncludedOnlyMesh(this.torus1);
        this.glow.addIncludedOnlyMesh(this.torus2);
        this.glow.addIncludedOnlyMesh(this.torus3);
      }

      constructor(scene) {
        this.diameter = SIZE;
        this.create();
        this.hide();
      }

      show(position, diameter, scene) {
        if(diameter!=this.diameter) {
          this.dispose();
          this.diameter = diameter;
          this.create();
        }

        this.torus1.position = position;
        this.torus2.position = position;
        this.torus3.position = position;
        this.torus1.isVisible = true;
        this.torus2.isVisible = true;
        this.torus3.isVisible = true;
      }

      hide() {
        this.torus1.isVisible = false;
        this.torus2.isVisible = false;
        this.torus3.isVisible = false;
      }

      spin() {
        const ticks = 45;
        this.torus1.rotate(BABYLON.Axis.X, Math.PI/ticks, BABYLON.Space.WORLD);
        this.torus1.rotate(BABYLON.Axis.Z, 0.01, BABYLON.Space.LOCAL);
        this.torus2.rotate(BABYLON.Axis.Z, Math.PI/ticks, BABYLON.Space.WORLD);
        this.torus2.rotate(BABYLON.Axis.X, 0.01, BABYLON.Space.LOCAL);
        this.torus3.rotate(BABYLON.Axis.Y, Math.PI/ticks, BABYLON.Space.WORLD);
        this.torus3.rotate(BABYLON.Axis.Z, 0.01, BABYLON.Space.LOCAL);
      }

      dispose() {
        this.torus1.dispose();
        this.torus2.dispose();
        this.torus3.dispose();
        this.glow.dispose();
      }
    }

    /**
     * Highlight a line.
     */
    class LineHighlighter {
      /**
       * Determine the physical (x,y,z) size of the graph.
       *
       * @param {graph data} data
       */
      static _getPhysicalSize = function(data) {
        const values = Object.values(data.vertex);
        console.log(values);
        const min3 = new BABYLON.Vector3(values[0].x, values[0].y, -values[0].z);
        const max3 = new BABYLON.Vector3(values[0].x, values[0].y, -values[0].z);
        values.forEach(v => {
          min3.minimizeInPlaceFromFloats(v.x, v.y, -v.z);
          max3.maximizeInPlaceFromFloats(v.x, v.y, -v.z);
        });

        const dist = BABYLON.Vector3.Distance(min3, max3);

        return dist;
      };

      /**
       * Determine a diameter based on the size of the graph.
       * In a physically large graph, the line highlight can be hard to see.
       * We use arbitrary numbers to interpolate (change to make it better if you like):
       * * size==10 -> diameter = 0.25
       * * size=136 -> diameter = 2
       *
       * @param {number} dist
       */
      static _getDiameter(dist) {
        dist = Math.max(0, dist-10)
        dist *= 1.75/126;
        dist += 0.25;
        return dist;
      }

      static createSpinner(name, height, diameter, color, scene) {
        // We expect the face texture to have the interesting stuff in
        // the top half (for the tube), and a transparent bottom half (for the caps).
        // UV coordinates are (0,0) == bottom-left.
        //
        const faceUV = [
          new BABYLON.Vector4(0, 0, 0.49, 0.49), 	// bottom cap
          new BABYLON.Vector4(0, 0.5, 1.0, 1.0),  // tube
          new BABYLON.Vector4(0, 0, 0.49, 0.49)   // top cap
        ];

        // TODO Should the diameter of the link highlighter be dependent on
        // the length of the line, or the size (x,y,z) of the graph?
        //
        const cyl = BABYLON.MeshBuilder.CreateCylinder('cyl' + name, {height:height, diameter:diameter, faceUV:faceUV, updatable:false, sideOrientation:BABYLON.Mesh.DOUBLESIDE}, scene);
        // const cyl = BABYLON.MeshBuilder.CreateCylinder('cyl' + name, {diameter:0.25/2, height:height, sideOrientation:BABYLON.Mesh.DOUBLESIDE, frontUVs:faceUV, backUVs:faceUV, updatable:false}, scene);
        const texture = new BABYLON.StandardMaterial('texture' + name, scene);
        texture.diffuseTexture = new BABYLON.Texture(`${resourceDir}/highlight-link-texture.png`);
        texture.diffuseTexture.hasAlpha = true;
        texture.backFaceCulling = false;
        // texture.twoSidedLighting = true;
        // texture.disableLighting = true;
        texture.emissiveColor = color;
        cyl.material = texture;

        return cyl;
      }

      create(height, color, scene) {
        this.cyl = LineHighlighter.createSpinner('linehigh', height, this.diameter, color, scene);
      }

      constructor(scene) {
        const physicalSize = LineHighlighter._getPhysicalSize(data);
        this.diameter = LineHighlighter._getDiameter(physicalSize);

        this.create(scene);

        this.glow = new BABYLON.GlowLayer('glowlinehigh', scene);//, {mainTextureSamples:4});
        this.glow.intensity = 0.75;
        this.glow.isEnabled = false;

        this.hide();
      }

      show(link) {
        // The height will almost certainly be different every time,
        // so dispose of the old mesh and create a new one.
        //
        this.dispose();

        const arrowLen = a => link.directions.includes(a) ? ARROWHEAD_LENGTH : 0;

        const color = new BABYLON.Color4(...link.color);

        // Calculate the height and position of the highlight cylinder.
        // Start with the positions of the src and dst nodes.
        // Adjust for the src nradius and dst nradius.
        // Adjust for the optional src arrow and dst arrow.
        //
        const src = data.vertex[link.sid_];
        const srcPos = new BABYLON.Vector3(src.x, src.y, -src.z);
        const dst = data.vertex[link.did_];
        const dstPos = new BABYLON.Vector3(dst.x, dst.y, -dst.z);

        const hypot = BABYLON.Vector3.Distance(srcPos, dstPos);
        const soffset = src.nradius * Math.sqrt(SIZE / 2) + arrowLen('<'); // offset by size of node
        const srco = new BABYLON.Vector3(
          soffset * (srcPos.x - dstPos.x) / hypot,
          soffset * (srcPos.y - dstPos.y) / hypot,
          soffset * (srcPos.z - dstPos.z) / hypot
        );
        const doffset = dst.nradius * Math.sqrt(SIZE / 2) + arrowLen('>'); // offset by size of node
        const dsto = new BABYLON.Vector3(
          doffset * (dstPos.x - srcPos.x) / hypot,
          doffset * (dstPos.y - srcPos.y) / hypot,
          doffset * (dstPos.z - srcPos.z) / hypot
        );

        // The new src and dst positions with offsets taken into account.
        //
        const srcPoso = srcPos.subtract(srco);
        const dstPoso = dstPos.subtract(dsto);

        const height = BABYLON.Vector3.Distance(srcPoso, dstPoso);

        this.create(height, color, scene);

        // Position the cylinder halfway between the end points.
        // Rotate the cylinder to align it with the line.
        //
        const position = srcPoso.add(dstPoso).scale(0.5);
        this.cyl.position = position;
        this.cyl.lookAt(dstPoso, 0, -Math.PI / 2, Math.PI);

        this.cyl.isVisible = true;
        this.glow.addIncludedOnlyMesh(this.cyl);
        this.glow.isEnabled = true;
      }

      hide() {
        this.cyl.isVisible = false;
      }

      spin() {
        const ticks = 90;
        this.cyl.rotate(BABYLON.Axis.Y, Math.PI / ticks, BABYLON.Space.LOCAL);
      }

      dispose() {
        this.glow.enabled = false;
        this.glow.removeIncludedOnlyMesh(this.cyl);
        this.cyl.dispose();
      }
    }

    // Scene and lights.
    //
    const scene = new BABYLON.Scene(engine);

    const highlight = new Highlighter(scene);
    const lineHighlight = new LineHighlighter(scene);

    const selectVxId = id => {
      const v = data.vertex[id];
      highlight.show(new BABYLON.Vector3(v.x, v.y, -v.z), v.nradius*2.0, scene);
    };

    const selectLinkId = id => {
      const link = data.transaction[id];
      lineHighlight.show(link);
    };

    // Camera.
    //
    const camera = new BABYLON.ArcRotateCamera('camera1', 0, 0, 0, new BABYLON.Vector3(0, 0, -0), scene);
    camera.wheelPrecision = 50;

    camera.attachControl(canvas, true);
    scene.activeCamera.panningSensibility = 50;

    const light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(1, 1, 0), scene);
    light.groundColor = new BABYLON.Color3(.5, .5, .5);
    light.intensity = 0.75;

    // const pl = new BABYLON.PointLight('pl', new BABYLON.Vector3(0, 0, 0), scene);
    // // pl.diffuse = new BABYLON.Color3(1, 1, 1);
    // // pl.specular = new BABYLON.Color3(0.5, 0.2, 0.2);
    // pl.intensity = 0.75;

    // Which attributes are used for the label and node color attributes?
    //
    const label_attr = data.label_attr;
    const node_color_attr = data.node_color_attr;

    /**
     * Display a label using BABYLON.GUI.
     *
     * Doing labels like Constellation is nasty and complicated.
     * Instead, we'll use BABYLON.GUI to create a single TextBlock and
     * make it visible when the cursor hovers over something.
     * We also use a Rectangle to make a nice border, and change its size
     * to fit the text as we go.
     * Create a Rectangle containing a TextBlock to make a pretty node label.
     */
    class TextDisplayer {
      constructor() {
        this.label = new BABYLON.GUI.Rectangle('label');
        this.label.isPointerBlocker = false;
        this.text = new BABYLON.GUI.TextBlock('text');
        this.text.isPointerBlocker = false;

        // Create a dummy label mesh to attach the label to.
        //
        this.labelMesh = new BABYLON.TransformNode();

        // BABYLON GUI root.
        //
        this.advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI('UI');
        this.advancedTexture.useInvalidateRectOptimization = false;

        this._createLabel(this.advancedTexture, this.labelMesh);

        this.text.text = '';
      }
      _createLabel(advancedTexture, mesh) {
        this.label.isVisible = false;
        this.text.isVisible = false;
        this.label.background = 'black';
        this.label.alpha = 0.85;
        this.label.cornerRadius = 20;
        this.label.thickness = 1;
        advancedTexture.addControl(this.label);
        this.label.linkWithMesh(mesh);

        this.text.resizeToFit = true;
        this.text.text = mesh.name;
        this.text.color = data.label_color;

        // Constants for the callback closure.
        //
        const ll = this.label;
        const tt = this.text;
        this.text.onLinesReadyObservable.add(function () {
          // Manually set the rectangle size.
          // We don't use label.adaptWidth/HeightToChildren() because
          // we want padding around the text, and setting paddingTop/Bottom/Left/Right()
          // doesn't seem to do the same as what we're doing here.
          //
          const w = parseFloat(tt.width.slice(0, -2)); // Remove the trailing 'px';
          const h = parseFloat(tt.height.slice(0, -2)); // Remove the trailing 'px';
          ll.width = `${w + 20}px`;
          ll.height = `${h + 20}px`;
          const hasText = !!tt.text;// !== '';
          ll.isVisible = hasText;
          tt.isVisible = hasText;
        });
        this.label.addControl(this.text)
      };

      /**
       * Show the label with text at the given position.
       * Typically called from an OnPointerOverTrigger action.
       * @param {string} s
       * @param {Vector3} position
       */
      show(s, position, offset=0) {
        this.text.text = s;
        this.labelMesh.position = position;
        this.label.isVisible = true;
        this.text.isVisible = true;
        this.label.linkOffsetY = offset;
      }

      /**
       * Hide the label.
       * Typically called from an OnPointerOutTrigger action.
       */
      hide() {
        this.text.text = '';
        this.label.isVisible = false;
        this.text.isVisible = false;
      }
    }

    const textDisplayer = new TextDisplayer();

    scene.clearColor = new BABYLON.Color4(...data.background_color);

    const resetCamera = function() {
      camera.position = new BABYLON.Vector3(...data.camera.eye);
      camera.target = new BABYLON.Vector3(...data.camera.centre);
      camera.upVector = new BABYLON.Vector3(...data.camera.up);
    };

    /**
     * Create a screenshot of the graph.
     */
    const screenshot = function() {
      BABYLON.ScreenshotTools.CreateScreenshot(engine, camera, {width:canvas.width, height:canvas.height}, img => {
        // Hack our way to downloading the image. :-)
        //
        const a = document.createElement('a');
        a.href = img;
        a.download = 'graph.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      });
    };

    const unselect = function() {
      highlight.hide();
      lineHighlight.hide();
    }

    data.camera.eye[2] = -data.camera.eye[2];
    data.camera.centre[2] = -data.camera.centre[2];
    data.camera.up[2] = -data.camera.up[2];
    resetCamera();

    const NVX = Object.keys(data.vertex).length;

    const createBlazes = function (vertices) {
      // Set up blazes (if there are any).
      //
      const vxs = Object.values(vertices).filter(vx => vx.blaze !== null);
      const nBlazes = vxs.length;

      const blazeMesh = BABYLON.MeshBuilder.CreateCylinder('blazes', {
        height: 1.25,
        diameterBottom: 0.5,
        diameterTop: 0.0,
        tessellation: 4
      }, scene);
      // blazeMesh.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL
      blazeMesh.alwaysSelectAsActiveMesh = true;
      blazeMesh.isVisible = false;

      let colorData = new Float32Array(4 * (nBlazes + 1));
      for (let ix = 0; ix < nBlazes; ix++) {
        colorData[ix * 4 + 0] = vxs[ix].blaze.color[0];
        colorData[ix * 4 + 1] = vxs[ix].blaze.color[1];
        colorData[ix * 4 + 2] = vxs[ix].blaze.color[2];
        colorData[ix * 4 + 3] = vxs[ix].blaze.color[3];
      }

      const buffer = new BABYLON.VertexBuffer(engine, colorData, BABYLON.VertexBuffer.ColorKind, false, false, 4, true);
      blazeMesh.setVerticesBuffer(buffer);

      blazeMesh.material = new BABYLON.StandardMaterial('blaze_mat');
      // blazeMesh.material.disableLighting = true;
      blazeMesh.material.emissiveColor = BABYLON.Color3.White();

      const toRadians = angle => angle * (Math.PI / 180);
      for (let ix = 0; ix < nBlazes; ix++) {
        const instance = blazeMesh.createInstance('blaze' + ix);
        instance.alwaysSelectAsActiveMesh = true;
        // instance.enableEdgesRendering();
        // instance.edgesWidth = 1.0;
        // instance.edgesColor = new BABYLON.Color4(0, 0, 0, 1);
        const v = vxs[ix];
        const zangle = toRadians(v.blaze.angle)
        instance.rotation.x = Math.PI;
        instance.rotation.z = zangle;

        // The offset has to take the angle into account.
        //
        const offset = 1.25 / 2 + v.nradius * Math.sqrt(SIZE / 2); // offset by half height of cylinder + size of node
        instance.position.x = v.x + offset * Math.sin(zangle);
        instance.position.y = v.y + offset * Math.cos(zangle);
        instance.position.z = -v.z;
      }
    };

    createBlazes(data.vertex);

    const createNodes = function () {
      // We use custom shaders for nodes.
      // We need to blend two icons (background + foreground) into one.
      // Since we don't need to rotate the icons, we steal the angle value
      // and sneak the background icon coordinates in there.
      //
      BABYLON.Effect.RegisterShader('sprites', node_spritesPixelShader, node_spritesVertexShader);
      const spriteMgr = new BABYLON.SpriteManager('vxMgr', `${resourceDir}/${data.sprite_atlas.name}`, NVX, 256, scene);

      spriteMgr.fogEnabled = false;
      spriteMgr.isPickable = true;

      const w = data.sprite_atlas.width;
      const h = data.sprite_atlas.height;

      for(let [i, vx] of Object.entries(data.vertex)) {
        const sprite = new BABYLON.Sprite(i, spriteMgr);
        sprite.position.x = vx.x;
        sprite.position.y = vx.y;
        sprite.position.z = -vx.z;
        sprite.cellIndex = vx.fg_icon_index;
        sprite.size = SIZE * vx.nradius; // make the node sizees approximate Constellation.

        // We need to pass the x,y of the background icon to the shaders.
        // We don't use angle, so let's put them in there by abusing maths.
        // 67108864 = 2**26.
        //
        sprite.angle = Math.trunc(vx.bg_icon_index / w * 67108864) + vx.bg_icon_index / h;
        sprite.color = new BABYLON.Color4(...vx[node_color_attr]);

        // https://doc.babylonjs.com/how_to/how_to_use_actions
        //
        sprite.isPickable = true;
        sprite.actionManager = new BABYLON.ActionManager(scene);
        sprite.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOverTrigger, event => {
          textDisplayer.show(data.vertex[event.source.name][label_attr], event.source.position);
        }));

        sprite.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOutTrigger, event => {
          textDisplayer.hide();
        }));

        sprite.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, event => {
          eventHandler('v', event.source.name);
          // const v = data.vertex[event.source.name];
          // highlight.show(new BABYLON.Vector3(v.x, v.y, -v.z), v.nradius*2.0, scene);
        }));

        sprite.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnCenterPickTrigger, event => {
          const v = data.vertex[event.source.name];
          console.log('PickC', v);
          camera.target = new BABYLON.Vector3(v.x, v.y, -v.z);
        }));
      }
    };

    createNodes();

    // Lines.
    //
    const createLines = function (transaction) {
      // const NTX = data.transaction.length;
      const vxs = data.vertex;
      const lines = [];
      const lineColors = [];
      transaction.forEach(tx => {
        const sv = vxs[tx['sid_']];
        const dv = vxs[tx['did_']];
        // const hypot = Math.hypot(sv.x - dv.x, sv.y - dv.y, sv.z - dv.z);
        const hypot = BABYLON.Vector3.Distance(sv, dv);
        const soffset = sv.nradius * Math.sqrt(SIZE / 2); // offset by size of node
        const osx = soffset * (sv.x - dv.x) / hypot;
        const osy = soffset * (sv.y - dv.y) / hypot;
        const osz = soffset * (sv.z - dv.z) / hypot;
        const doffset = dv.nradius * Math.sqrt(SIZE / 2); // offset by size of node
        const odx = doffset * (dv.x - sv.x) / hypot;
        const ody = doffset * (dv.y - sv.y) / hypot;
        const odz = doffset * (dv.z - sv.z) / hypot;
        const line = [
          new BABYLON.Vector3(sv.x - osx, sv.y - osy, -sv.z + osz),
          new BABYLON.Vector3(dv.x - odx, dv.y - ody, -dv.z + odz)
        ];
        lines.push(line);

        const color = new BABYLON.Color4(...tx.color);
        lineColors.push([color, color]);
      });

      const liness = BABYLON.MeshBuilder.CreateLineSystem('liness', { lines: lines, colors: lineColors, useVertexAlpha: false, width: 10 }, scene);

      liness.actionManager = new BABYLON.ActionManager(scene);
      liness.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOverTrigger, event => {
        // Launch a ray to pick the mesh in the scene.
        // This lets us find the particular line (mesh face) that triggered the action.
        // The predicate avoids meshes that are in front of the line.
        //
        const pickResult = scene.pick(event.pointerX, event.pointerY, pm => pm.id==liness.id);
        if(pickResult.hit) {
          // The faceId is the position of the picked face's indices in the
          // indices array. Because the indices array is in the same order as
          // the transactions in the forEach() loop above, it's also an index
          // into the transactions array.
          //
          const linkIx = pickResult.faceId;
          // eventHandler('t', transaction[pickResult.faceId])

          const s = ''+transaction[linkIx].count
          textDisplayer.show(s, pickResult.pickedPoint, -20);
        }

        liness.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOutTrigger, event => {
            textDisplayer.hide();
        }));

        liness.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, event => {
          const pickResult = scene.pick(event.pointerX, event.pointerY, pm => pm.id==liness.id);
          if(pickResult.hit) {
            const linkIx = pickResult.faceId;
            eventHandler('link', linkIx);
          }
        }));

      }));
    }

    createLines(data.transaction);

    // Direction indicators.
    //
    const createDirections = function (transactions) {
      const arrows = []
      transactions.forEach(tx => {
        const dirs = tx.directions;
        if (dirs.includes('>')) {
          arrows.push({ sid_: tx.sid_, did_: tx.did_, color: tx.color })
        }
        if (dirs.includes('<')) {
          arrows.push({ sid_: tx.did_, did_: tx.sid_, color: tx.color })
        }
      });

      const nArrows = arrows.length;
      const arrowMesh = BABYLON.MeshBuilder.CreateCylinder('arrowheads', {
        height: ARROWHEAD_LENGTH,
        diameterBottom: 0.25,
        diameterTop: 0.0,
        tessellation: 4
      }, scene);
      arrowMesh.alwaysSelectAsActiveMesh = true;
      arrowMesh.registerInstancedBuffer('color', 4);
      arrowMesh.instancedBuffers.color = BABYLON.Color3.White();

      arrowMesh.isVisible = false;

      arrowMesh.material = new BABYLON.StandardMaterial('arrow_mat');
      // arrowMesh.material.disableLighting = true;
      arrowMesh.material.emissiveColor = BABYLON.Color3.White();

      const vxs = data.vertex;
      const toRadians = angle => angle * (Math.PI / 180);
      for (let ix = 0; ix < nArrows; ix++) {
        const instance = arrowMesh.createInstance('arrow' + ix);
        // Always select as active mesh: without this, instances not on screen
        // aren't drawn, so the color buffer gets out of sync.
        //
        // See:
        //  - https://forum.babylonjs.com/t/unwanted-color-changing-with-mesh-instances/11168
        //  - https://doc.babylonjs.com/how_to/how_to_use_instances
        //
        instance.alwaysSelectAsActiveMesh = true;

        instance.instancedBuffers.color = new BABYLON.Color4(...arrows[ix].color);


        // Show the edges, it looks more 3D and adds definition.
        //
        instance.enableEdgesRendering();
        instance.edgesWidth = 1.0;
        instance.edgesColor = new BABYLON.Color4(0, 0, 0, 1);

        // Figure out the offset of the arrowhead from the node.
        //
        const sv = vxs[arrows[ix].sid_];
        const dv = vxs[arrows[ix].did_];
        const hypot = BABYLON.Vector3.Distance(sv, dv);
        const offset = ARROWHEAD_LENGTH / 2 + dv.nradius * Math.sqrt(SIZE / 2); // offset by half height of cylinder + size of node
        const ox = offset * (sv.x - dv.x) / hypot;
        const oy = offset * (sv.y - dv.y) / hypot;
        const oz = offset * (sv.z - dv.z) / hypot;
        instance.position.x = dv.x + ox;
        instance.position.y = dv.y + oy;
        instance.position.z = -dv.z - oz;

        // Make the arrowhead look at the destination node.
        // The pitch and roll make the cylinder line up in the correct direction.
        //
        instance.lookAt(new BABYLON.Vector3(dv.x, dv.y, -dv.z), 0, -Math.PI / 2, Math.PI);
      }
    };

    createDirections(data.transaction);

    scene.registerBeforeRender(function() {
      highlight.spin();
      lineHighlight.spin();
    });

    return {
      scene: scene,
      resetCamera, resetCamera,
      resize: resize,
      screenshot: screenshot,
      selectVxId: selectVxId,
      selectLinkId: selectLinkId,
      unselect: unselect
    };
  }
  // );
  //.catch(error => {console.log('Error:', error);});

  // scene.freezeActiveMeshes();

  const scene = createScene();

  // scene.registerBeforeRender(function() {
  //   scene.activeCamera.alpha += 0.01;
  //   // scene.activeCamera.beta += 0.01;
  // })

  // Register a render loop to repeatedly render the scene
  engine.runRenderLoop(function () {
    scene.scene.render();
  });

  // Watch for browser/canvas resize events.
  // If the canvas covers the window, no problem.
  // If the canvas is part of a layout, then this listener won't get
  // notified if the layout changes but the window doesn't.
  // Sadly, canvas doesn't have a convenient resize event,
  // we havt to rely on the outer layout totell us when a canvas resize happens.
  //
  window.addEventListener('resize', function () {
    engine.resize();
  });

  return {
    resetCamera: scene.resetCamera,
    resize: resize,
    screenshot: scene.screenshot,
    selectVxId: scene.selectVxId,
    selectLinkId: scene.selectLinkId,
    unselect: scene.unselect
  };
}