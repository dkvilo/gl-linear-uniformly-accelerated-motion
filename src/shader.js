//
//
//
//  David Kviloria <dkviloria@gmail.com>
//
//
//
export class Shader {
  
	constructor(gl, vs, fs) {
		this.gl = gl;
		this._vsSource = vs;
		this._fsSource = fs;
	}

	__create__shader__(shaderType) {
		let shader;
		if (shaderType == this.gl.VERTEX_SHADER) {
			shader = this.gl.createShader(this.gl.VERTEX_SHADER);
			this.gl.shaderSource(shader, this._vsSource);
		}

		if (shaderType === this.gl.FRAGMENT_SHADER) {
			shader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
			this.gl.shaderSource(shader, this._fsSource);
		}

		this.gl.compileShader(shader);

		return shader;
	}

	__setup__program__() {
		this.program = this.gl.createProgram();

		// Create and compile vertex shader from source
		const vertexShader = this.__create__shader__(this.gl.VERTEX_SHADER);

		// Attach Vertex Shader to program
		this.gl.attachShader(this.program, vertexShader);

		// Create and compile fragment shader from source
		const fragmentShader = this.__create__shader__(this.gl.FRAGMENT_SHADER);
		// Attach Fragment Shader
		this.gl.attachShader(this.program, fragmentShader);

		// Link the shader program with id
		this.gl.linkProgram(this.program);

		// remove shaders from program
		this.gl.detachShader(this.program, vertexShader);
		this.gl.detachShader(this.program, fragmentShader);

		// delete shaders
		this.gl.deleteShader(vertexShader);
		this.gl.deleteShader(fragmentShader);

		// check shader program status
		if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
			// get shader error
			const errorLog = this.gl.getProgramInfoLog(this.program);
			throw new Error(`Shader Program Linking error: ${errorLog}`);
		}

		return true;
	}

	__use_program__() {
		this.gl.useProgram(this.program);
	}

	__free__() {
		this.gl.useProgram(null);
		if (this._buffer) this.gl.deleteBuffer(this._buffer);
		if (this.program) this.gl.deleteProgram(this.program);
	}

	SetFloat32Array(value) {
		this.gl.bufferData(
			this.gl.ARRAY_BUFFER,
			new Float32Array([value]),
			this.gl.STATIC_DRAW
		);
	}

	Use() {
		if (this.__setup__program__()) {
			this.__use_program__();
		}
	}
}
