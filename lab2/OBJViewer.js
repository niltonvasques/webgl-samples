var canvas		= null;
var shader		= null;
var axis_shader		= null;
var model		= new Array;
var axis		= null;
var gl			= null;
var scale 		= 1.0;
var rotate		= 0;
var perspective		= new Matrix4();
var transX		= 1.0;
var transY 		= 1.0;
var transZ		= 1.0;

var g_objDoc 		= null;	// The information of OBJ file
var g_drawingInfo 	= null;	// The information for drawing 3D model

// ********************************************************
// ********************************************************
function initGL(canvas) {

	gl = canvas.getContext("webgl");
	if (!gl) { 
		alert("Could not initialise WebGL, sorry :-(");
		return gl;
		}
	gl.viewportWidth = canvas.width;
	gl.viewportHeight = canvas.height;
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	
	return gl;
}

// ********************************************************
// ********************************************************
// Read a file
function readOBJFile(fileName, gl, scale, reverse) {
	var request = new XMLHttpRequest();
	
	request.onreadystatechange = function() {
		if (request.readyState === 4 && request.status !== 404) 
			onReadOBJFile(request.responseText, fileName, gl, scale, reverse);
		}
	request.open('GET', fileName, true); // Create a request to acquire the file
	request.send();                      // Send the request
}

// ********************************************************
// ********************************************************
// OBJ File has been read
function onReadOBJFile(fileString, fileName, gl, scale, reverse) {
	var objDoc = new OBJDoc(fileName);	// Create a OBJDoc object
	var result = objDoc.parse(fileString, scale, reverse);	// Parse the file
	
	if (!result) {
		g_objDoc 		= null; 
		g_drawingInfo 	= null;
		console.log("OBJ file parsing error.");
		return;
		}
		
	g_objDoc = objDoc;
}

// ********************************************************
// ********************************************************
// OBJ File has been read compleatly
function onReadComplete(gl) {
	
var groupModel = null;

	g_drawingInfo 	= g_objDoc.getDrawingInfo();
	
	for(var o = 0; o < g_drawingInfo.numObjects; o++) {
		
		groupModel = new Object();

		groupModel.vertexBuffer = gl.createBuffer();
		if (groupModel.vertexBuffer) {		
			gl.bindBuffer(gl.ARRAY_BUFFER, groupModel.vertexBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, g_drawingInfo.vertices[o], gl.STATIC_DRAW);
			}
		else
			alert("ERROR: can not create vertexBuffer");
	
		groupModel.colorBuffer = gl.createBuffer();
		if (groupModel.colorBuffer) {		
			gl.bindBuffer(gl.ARRAY_BUFFER, groupModel.colorBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, g_drawingInfo.colors[o], gl.STATIC_DRAW);
			}
		else
			alert("ERROR: can not create colorBuffer");

		groupModel.indexBuffer = gl.createBuffer();
		if (groupModel.indexBuffer) {		
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, groupModel.indexBuffer);
			gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, g_drawingInfo.indices[o], gl.STATIC_DRAW);
			}
		else
			alert("ERROR: can not create indexBuffer");
		
		groupModel.numObjects = g_drawingInfo.indices[o].length;
		model.push(groupModel);
		}
}

// ********************************************************
// ********************************************************

function initAxisVertexBuffer(maxCoord) {
	var axisVertices = [
		0.0, 0.0, 0.0,	maxCoord, 0.0, 0.0, // Eixo X
		0.0, 0.0, 0.0,	0.0, maxCoord, 0.0, // Eixo Y
		0.0, 0.0, 0.0,	0.0, 0.0, maxCoord  // Eixo Z
	];  
		 
	var axisBuffer = gl.createBuffer();
	if(axisBuffer){
		gl.bindBuffer(gl.ARRAY_BUFFER, axisBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(axisVertices), gl.STATIC_DRAW);
	}else{
		console.log("Cannot create axis buffer");
	}

	return axisBuffer;

	
}

// ********************************************************
// ********************************************************
function draw(o, shaderProgram, primitive) {

	if (o.vertexBuffer != null) {
		gl.bindBuffer(gl.ARRAY_BUFFER, o.vertexBuffer);
		gl.vertexAttribPointer(shaderProgram.vPositionAttr, 3, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(shaderProgram.vPositionAttr);  
		}
	else
		alert("o.vertexBuffer == null");

	if (o.colorBuffer != null) {
		gl.bindBuffer(gl.ARRAY_BUFFER, o.colorBuffer);
		gl.vertexAttribPointer(shaderProgram.vColorAttr, 4, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(shaderProgram.vColorAttr);
		}
	else
		alert("o.colorBuffer == null");

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, o.indexBuffer);

	gl.drawElements(primitive, o.numObjects, gl.UNSIGNED_SHORT, 0);
}

// ********************************************************
// ********************************************************
function drawAxis(shaderProgram) {
	
	if(!axis){
		console.log("Axis not initialized");
	}
	
	shaderProgram.mvMatrix.setIdentity();

	gl.bindBuffer(gl.ARRAY_BUFFER, axis);
	gl.vertexAttribPointer(shaderProgram.vPositionAttr, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(shaderProgram.vPositionAttr);  
	
	setMatrixUniforms(shaderProgram, shaderProgram.mvMatrix, "uMVMatrix");
	setMatrixUniforms(shaderProgram, perspective, "uPMatrix");

	for(var i = 0; i < 3; i++)
		gl.drawArrays(gl.LINE_STRIP, i*2, 2);

}


// ********************************************************
// ********************************************************
function drawScene() {

	gl.clear(gl.COLOR_BUFFER_BIT);

	gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
	perspective.setIdentity();
	perspective.setPerspective(45, 1, 0.1, 100.0);
	perspective.lookAt(2,2,2, 0,0,0, 2,10,2);
	
	try {
		gl.useProgram(axis_shader);
	}catch(err){
		alert(err);
		console.error(err.description);
    	}
	drawAxis(axis_shader);
	
	try {
		gl.useProgram(shader);
		shader.mvMatrix.setIdentity();
		
		shader.mvMatrix.translate(transX, transY, transZ);
		shader.mvMatrix.rotate(rotate, 1, 0, 0);
		shader.mvMatrix.scale(scale, scale, scale);
	
		setMatrixUniforms(shader, shader.mvMatrix, "uMVMatrix");
		setMatrixUniforms(shader, perspective, "uPMatrix");
		for(var o = 0; o < model.length; o++) 
			draw(model[o], shader, gl.TRIANGLES);
	}catch(err){
		alert(err);
		console.error(err.description);
    	}
		
}
    
// ********************************************************
// ********************************************************
function webGLStart() {
	
	document.onkeydown 	= handleKeyDown;
	document.onkeyup 	= handleKeyUp;
	
	canvas 	= document.getElementById("viewOBJ");
	gl 		= initGL(canvas);
	shader 	= initShaders("viewOBJ", gl);	
	
	shader.vPositionAttr 	= gl.getAttribLocation(shader, "aVertexPosition");		
	shader.vColorAttr 	= gl.getAttribLocation(shader, "aVertexColor");
	shader.mvMatrix = new Matrix4();
	shader.mvMatrix.setIdentity();
	
	if (shader.vPositionAttr < 0 || shader.vColorAttr < 0) {
		console.log("Error getAttribLocation"); 
		return;
	}

	axis_shader = initShaders("shader",gl);

	axis_shader.vPositionAttr = gl.getAttribLocation(axis_shader, "aVertexPosition");
	
	axis_shader.mvMatrix = new Matrix4();
	axis_shader.mvMatrix.setIdentity();

	if(axis_shader.vPositionAttr < 0){
		console.log("Error getAttribLocation");
		return;
	}
		
	readOBJFile("simpleCube.obj", gl, 1, true);
	
	var tick = function() {   // Start drawing
		if (g_objDoc != null && g_objDoc.isMTLComplete()) { // OBJ and all MTLs are available
			
			onReadComplete(gl);
			
			g_objDoc = null;
			
			console.log("BBox = (" 	+ g_drawingInfo.BBox.Min.x + " , " 
									+ g_drawingInfo.BBox.Min.y + " , " 
									+ g_drawingInfo.BBox.Min.z + ")");
			console.log("		(" 	+ g_drawingInfo.BBox.Max.x + " , " 
									+ g_drawingInfo.BBox.Max.y + " , " 
									+ g_drawingInfo.BBox.Max.z + ")");
			console.log("		(" 	+ g_drawingInfo.BBox.Center.x + " , " 
									+ g_drawingInfo.BBox.Center.y + " , " 
									+ g_drawingInfo.BBox.Center.z + ")");
			
			scale = 1.0 / Math.max( 	Math.max( 	Math.abs(g_drawingInfo.BBox.Max.x - g_drawingInfo.BBox.Min.x), 
													Math.abs(g_drawingInfo.BBox.Max.y - g_drawingInfo.BBox.Min.y)),
										Math.abs(g_drawingInfo.BBox.Max.z - g_drawingInfo.BBox.Min.z));
				
			axis = initAxisVertexBuffer(1);
			if (!axis) {
				console.log('Failed to set the AXIS vertex information');
				return;
				}
			}
		requestAnimationFrame(tick, canvas);
		if (model.length > 0) 
			drawScene();
		else
			requestAnimationFrame(tick, canvas);
		};	
	tick();

/*	axis = initAxisVertexBuffer(0.5);
	if (!axis) {
		console.log('Failed to set the AXIS vertex information');
		return;
	}

	drawScene();
*/

}

// ********************************************************
// ********************************************************
function handleKeyUp(event) {
	
	var keyunicode = event.charCode || event.keyCode;
	if (keyunicode == 16)
		Upper = false;
}	

// ********************************************************
// ********************************************************
function handleKeyDown(event) {

	var factor = 0.01;
	
	var keyunicode = event.charCode || event.keyCode;
	
	if (keyunicode == 16) 
		Upper = true;

	switch (String.fromCharCode(keyunicode)) {
		case "S":
			if (Upper) 
				scale *= 2;
			else	
				scale *= 0.5;
			
				console.log("Scale = " + scale);
			break;

		case "R":
			if(Upper)
				rotate+= 5;
			else
				rotate-= 5;
				console.log("Rotate = " + rotate);
			break;
		
	}
		
	switch (keyunicode) {
		case 27	:	// ESC
					console.log("ESC");
			break;
		case 33	:	// Page Up
			console.log("PGUP");
			transZ += factor;
			break;
		case 34	:	// Page Down
			console.log("PGDOWN");
			transZ -= factor;
			break;
		case 37	:	// Left cursor key
			console.log("LEFT");
			transX -= factor;
			break;
		case 38	:	// Up cursor key
			console.log("UP");
			transY += factor;	
			break;
		case 39	:	// Right cursor key
			console.log("RIGHT");
			transX += factor;
			break;
		case 40	:	// Down cursor key
			console.log("DOWN");
			transY -= factor;
			break;
		}
	drawScene();	
}

function setMatrixUniforms(shader, matrix, matrix_name){
	var mvUniform = gl.getUniformLocation(shader, matrix_name);
	gl.uniformMatrix4fv(mvUniform, false, matrix.elements);
}
