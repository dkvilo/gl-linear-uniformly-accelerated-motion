import { mat4, quat2, vec2 } from "gl-matrix";

import { Shader } from "./shader";
import { InputManager } from "./input";

const vertex_shader = `
  #version 100
  
  attribute vec2 position;
  uniform mat4 mvp;

  void main() {
    gl_Position = mvp * vec4(position, 0.0, 1.0);
  }

`;

const fragment_shader = `
  #version 100
  precision highp float;

  uniform vec4 color;
  
  void main() {
    gl_FragColor = color;
  }

`;

+(function() {
	const canvas = document.getElementById("renderer");
  
  // set canvas width and height 
  canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

  // gain access webgl2 context
	const gl = canvas.getContext("webgl2");
	if (!gl) {
		throw new Error(
			"Failed to get WebGL context, Your browser or device may not support WebGL"
		);
	}

  // 
  // Quad position, rotation info
  // 
	const transform = {
    pos: vec2.create(), // vector2d
    rot: quat2.create() // quaternion2d
	};

  // global store for registering active key
	const KeyStore = {
		__current__: null,
	};

  // simple input manager abstraction
  const input = new InputManager();
  
  // initialize listener
	input.On("keydown").Store(KeyStore).Listen();

  // main loop the app
	__Run_Loop();
	function __Run_Loop() {
		gl.viewport(0, 0, window.innerWidth, window.innerHeight);
		requestAnimationFrame((time) => {
			__Render(time);
			__Run_Loop();
		});
	}

  // 
  // simple key processor
  // 
  // This time variable is from requestAnimationFrame (do not use),
  // You probably need way to calculate delta time to make things frame rate independent
	function __position_controller(time) {
    // 
    // 
    // This is very lazy and dumb calculation of object acceleration  
    // You should not calculate acceleration in world space, Instead you have to convert world space to screen
    // Which is just a fancy description of very simple equation
    // 
    // 
    const speed = 0.4;
  
    if (KeyStore["__current__"] == "a") {
      transform.pos[0] = transform.pos[0] -= speed;
    } 

    if (KeyStore["__current__"] == "d") {
      transform.pos[0] = transform.pos[0] +=  speed;
    }

    if (KeyStore["__current__"] == "w") {
      transform.pos[1] = transform.pos[1] += speed;
    }

    if (KeyStore["__current__"] == "s") {
      transform.pos[1] = transform.pos[1] -= speed;
    }

    // Stop the motion
    if (KeyStore["__current__"] === "Escape") {
      vec2.zero(transform.pos)
    }
	}

  // nice abstraction on top of shader api
	const quadShader = new Shader(gl, vertex_shader, fragment_shader);

  // X, Y coordinates
	const vertices = new Float32Array([
		-0.5, -0.5,
		 0.5, -0.5,
		 0.5,  0.5,
		 0.5,  0.5,
		-0.5,  0.5,
		-0.5, -0.5,
	]);

  let camera = mat4.create();
	let model = mat4.create();
	let mvp = mat4.create();

  // configure perspective projection matrix for "camera" 
  // calculate (45 * Math.PI / 180) fovy and convert to radians  
  mat4.perspective(camera, 45 * Math.PI / 180, window.innerWidth / window.innerHeight, 0.1, 1000.0)

  // translate camera Z position 
  mat4.translate(camera, camera, [0, 0, -4])
  
  // create identity matrix 
    // [1, 0, 0, 0]
    // [0, 1, 0, 0]
    // [0, 0, 1, 0]
    // [0, 0, 0, 1]  
  mat4.identity(model);

  // Scale the model if you want
  mat4.scale(model, model, [0.5, 0.5, 0.5])

  // allocate memory for vertex buffer
  const vbo = gl.createBuffer();    


	function __Render(time) {

    // read the input and calculate quad position
    __position_controller(time);
    
    // Make reasonable range of acceleration, cause we are using world space coordinate values
    // Why? cause apparently someone is too lazy to convert into local space, also we dont care
    let x = (5.0 * (transform.pos[0]) / (window.innerWidth - 0));
    let y = (5.0 * (transform.pos[1]) / (window.innerHeight - 0));

    // translate the model according to the calculated position based on user input 
    mat4.translate(model, model, [x, y, 0])
    
    // Calculate mvp = model/view/projection
    mat4.mul(mvp, model, camera);
    
    // 
    // 
    // Setup General Renderer
    // 
    // 

    // set the painting color
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // paint the view with the given color
		gl.clear(gl.COLOR_BUFFER_BIT);

    // bind vertex buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);

    // upload the data to the buffer
		gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    // setup shader
		quadShader.Use();

    // get color position
		quadShader.program.color = gl.getUniformLocation(quadShader.program, "color");
    
    // pass color uniform value to fragment shader
    gl.uniform4fv(quadShader.program.color, [1.0, 1.0, 1.0, 1.0]);

    // get position attribute location
		quadShader.program.position = gl.getAttribLocation(quadShader.program, "position");
    gl.enableVertexAttribArray(quadShader.program.position);
    // pass the data for vertex coordinates
		gl.vertexAttribPointer(quadShader.program.position, 2, gl.FLOAT, false, 0, 0);

    // pass the calculated mvp to the vertex shader
		quadShader.program.mvp = gl.getUniformLocation(quadShader.program, "mvp");
		gl.uniformMatrix4fv(quadShader.program.mvp, false, mvp);

    // finlay draw the shape(s) two triangles, which itself defines the quad
    gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 2);
	}
})();
