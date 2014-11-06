var canvas;
var gl;
var squareVerticesBuffer;
var sphereVerticesBuffer;
var squareVerticesColorBuffer;
var mvMatrix;
var shaderProgram;
var vertexPositionAttribute;
var perspectiveMatrix;
var sphere;
var squareRotation = 0.0;
var lastSquareUpdateTime = 0;

//
// start
//
// Called when the canvas is created to get the ball rolling.
// Figuratively, that is. There's nothing moving in this demo.
//
function start() {
	canvas = document.getElementById("glcanvas");

	initWebGL(canvas);      // Initialize the GL context

	// Only continue if WebGL is available and working

	if (gl) {
		gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
		gl.clearDepth(1.0);                 // Clear everything
		gl.enable(gl.DEPTH_TEST);           // Enable depth testing
		gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

		// Initialize the shaders; this is where all the lighting for the
		// vertices and so forth is established.

		initShaders();

		// Here's where we call the routine that builds all the objects
		// we'll be drawing.

		initBuffers();

		// Set up to draw the scene periodically.

		setInterval(drawScene, 15);
	}
}

//
// initWebGL
//
// Initialize WebGL, returning the GL context or null if
// WebGL isn't available or could not be initialized.
//
function initWebGL() {
	gl = null;

	try {
		gl = canvas.getContext("experimental-webgl");
	}catch(e) {	}

	// If we don't have a GL context, give up now

	if (!gl) {
		alert("Unable to initialize WebGL. Your browser may not support it.");
	}
}

//
// initBuffers
//
// Initialize the buffers we'll need. For this demo, we just have
// one object -- a simple two-dimensional square.
//
function initBuffers() {
  
	// Create a buffer for the square's vertices.

	squareVerticesBuffer = gl.createBuffer();

	// Select the squareVerticesBuffer as the one to apply vertex
	// operations to from here out.

	gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesBuffer);

	// Now create an array of vertices for the square. Note that the Z
	// coordinate is always 0 here.

	var vertices = [
		1.0,  1.0,  0.0,
		-1.0, 1.0,  0.0,
		1.0,  -1.0, 0.0,
		-1.0, -1.0, 0.0
	];

	// Now pass the list of vertices into WebGL to build the shape. We
	// do this by creating a Float32Array from the JavaScript array,
	// then use it to fill the current vertex buffer.

	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

	var colors = [
		1.0,  1.0,  1.0,  1.0,    // white
		1.0,  0.0,  0.0,  1.0,    // red
		0.0,  1.0,  0.0,  1.0,    // green
		0.0,  0.0,  1.0,  1.0     // blue
	];

	squareVerticesColorBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesColorBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

	sphere = buildSphere(3, 3);

	sphereVerticesBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, sphereVerticesBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sphere), gl.STATIC_DRAW);

}

// ********************************************************
// ********************************************************
function buildSphere(np, np2){
	var vPos = new Array;
	var angle = np *  (Math.PI / 180.0);
	var angle2 = np2 *  (Math.PI / 180.0);
	var r = 1;
	var numPontos = 0;

	for(theta = 0.0; theta < 2*Math.PI; theta+=angle){
		for(alfa = 0.0; alfa < Math.PI; alfa+=angle2){
			var theta2 = randomFromInterval(2,0.6) * theta;
			var alfa2 = randomFromInterval(2,0.6) * alfa;
			var x = 0.0 + r * Math.cos(theta2) * Math.sin(alfa2);
			var y = 0.0 + r * Math.sin(theta2) * Math.sin(alfa2);
			var z = 0.0 + r * Math.cos(alfa2);
	/*
			var x = 0.0 + r * Math.cos(theta) * Math.sin(alfa);
			var y = 0.0 + r * Math.sin(theta) * Math.sin(alfa);
			var z = 0.0 + r * Math.cos(alfa);*/
			vPos.push(x);
			vPos.push(y);
			vPos.push(z);
			numPontos++;
		}
	}
	vPos.numItems = numPontos;
	return vPos;
}

//
// drawScene
//
// Draw the scene.
//
function drawScene() {
	// Clear the canvas before we start drawing on it.

	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	// Establish the perspective with which we want to view the
	// scene. Our field of view is 45 degrees, with a width/height
	// ratio of 640:480, and we only want to see objects between 0.1 units
	// and 100 units away from the camera.

	perspectiveMatrix = makePerspective(45, canvas.width/canvas.height, 0.1, 100.0);

	// Set the drawing position to the "identity" point, which is
	// the center of the scene.

	loadIdentity();

	// Now move the drawing position a bit to where we want to start
	// drawing the square.

	mvTranslate([-0.0, 0.0, -4.0]);

	mvPushMatrix();
	mvRotate(squareRotation, [1, 0, 1]);

	// Draw the square by binding the array buffer to the square's vertices
	// array, setting attributes, and pushing it to GL.

	/*gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesBuffer);
	gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);*/
	/*gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesColorBuffer);
	gl.vertexAttribPointer(vertexColorAttribute, 4, gl.FLOAT, false, 0, 0);*/

	gl.bindBuffer(gl.ARRAY_BUFFER, sphereVerticesBuffer);
	gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

	setMatrixUniforms();
	gl.drawArrays(gl.POINTS, 0, sphere.numItems);

	mvPopMatrix();

	var currentTime = (new Date).getTime();
	if (lastSquareUpdateTime) {
		var delta = currentTime - lastSquareUpdateTime;

		squareRotation += (30 * delta) / 1000.0;
	}

	lastSquareUpdateTime = currentTime;
}

//
// initShaders
//
// Initialize the shaders, so WebGL knows how to light our scene.
//
function initShaders() {
	var fragmentShader = getShader(gl, "shader-fs");
	var vertexShader = getShader(gl, "shader-vs");

	// Create the shader program

	shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
	gl.linkProgram(shaderProgram);

	// If creating the shader program failed, alert

	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
		alert("Unable to initialize the shader program.");
	}

	gl.useProgram(shaderProgram);

	vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
	gl.enableVertexAttribArray(vertexPositionAttribute);

	vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
	gl.enableVertexAttribArray(vertexColorAttribute);
}

//
// getShader
//
// Loads a shader program by scouring the current document,
// looking for a script with the specified ID.
//
function getShader(gl, id) {
	var shaderScript = document.getElementById(id);

	// Didn't find an element with the specified ID; abort.

	if (!shaderScript) {
		return null;
	}

	// Walk through the source element's children, building the
	// shader source string.

	var theSource = "";
	var currentChild = shaderScript.firstChild;

	while(currentChild) {
		if (currentChild.nodeType == 3) {
			theSource += currentChild.textContent;
		}

		currentChild = currentChild.nextSibling;
	}

	// Now figure out what type of shader script we have,
	// based on its MIME type.

	var shader;

	if (shaderScript.type == "x-shader/x-fragment") {
		shader = gl.createShader(gl.FRAGMENT_SHADER);
	} else if (shaderScript.type == "x-shader/x-vertex") {
		shader = gl.createShader(gl.VERTEX_SHADER);
	} else {
		return null;  // Unknown shader type
	}

	// Send the source to the shader object

	gl.shaderSource(shader, theSource);

	// Compile the shader program

	gl.compileShader(shader);

	// See if it compiled successfully

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		alert("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader));
		return null;
	}

	return shader;
}

//
// Matrix utility functions
//

function loadIdentity() {
	mvMatrix = Matrix.I(4);
}

function multMatrix(m) {
	mvMatrix = mvMatrix.x(m);
}

function mvTranslate(v) {
	multMatrix(Matrix.Translation($V([v[0], v[1], v[2]])).ensure4x4());
}

function setMatrixUniforms() {
	var pUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
	gl.uniformMatrix4fv(pUniform, false, new Float32Array(perspectiveMatrix.flatten()));

	var mvUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
	gl.uniformMatrix4fv(mvUniform, false, new Float32Array(mvMatrix.flatten()));
}

var mvMatrixStack = [];

function mvPushMatrix(m) {
	if (m) {
		mvMatrixStack.push(m.dup());
		mvMatrix = m.dup();
	} else {
		mvMatrixStack.push(mvMatrix.dup());
	}
}

function mvPopMatrix() {
	if (!mvMatrixStack.length) {
		throw("Can't pop from an empty matrix stack.");
	}
  
	mvMatrix = mvMatrixStack.pop();
	return mvMatrix;
}

function mvRotate(angle, v) {
	var inRadians = angle * Math.PI / 180.0;

	var m = Matrix.Rotation(inRadians, $V([v[0], v[1], v[2]])).ensure4x4();
	multMatrix(m);
}

// UTILS

function randomFromInterval(max, min){
	return (Math.random()*(max-min)+min);
}
