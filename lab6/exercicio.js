var canvas		= null;
var shader		= null;
var model		= new Array;
var axis		= null;
var gl			= null;
var xSpeed		= 0.0;
var ySpeed		= 0.0;
var cameraPos 	= new Vector3();
var cameraLook 	= new Vector3();
var cameraUp 	= new Vector3();
var lightPos 	= new Vector3();
var RotMoon		= 0.0;
var RotEarth	= 0.0;
var RotMercury	= 0.0;

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
	gl.enable(gl.DEPTH_TEST);
	
	return gl;
}

// ********************************************************
// ********************************************************
// Read a file
function readOBJFile(fileName, scale, reverse) {
	var request = new XMLHttpRequest();
	
	request.onreadystatechange = function() {
		if (request.readyState === 4 && request.status !== 404) 
			onReadOBJFile(request.responseText, fileName, scale, reverse);
		}
	request.open('GET', fileName, true); // Create a request to acquire the file
	request.send();                      // Send the request
}

// ********************************************************
// ********************************************************
// OBJ File has been read
function onReadOBJFile(fileString, fileName, scale, reverse) {
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
function onReadComplete() {
	
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
	
		groupModel.normalBuffer = gl.createBuffer();
		if (groupModel.normalBuffer) {		
			gl.bindBuffer(gl.ARRAY_BUFFER, groupModel.normalBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, g_drawingInfo.normals[o], gl.STATIC_DRAW);
			}
		else
			alert("ERROR: can not create normalBuffer");

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

function initAxisVertexBuffer() {
	var axis	= new Object(); // Utilize Object object to return multiple buffer objects
	var vPos 	= new Array;
	var vColor 	= new Array;
	var vNormal	= new Array;
	var lInd 	= new Array;

	// X Axis
	// V0
	vPos.push(0.0);
	vPos.push(0.0);
	vPos.push(0.0);
	vColor.push(1.0);
	vColor.push(0.0);
	vColor.push(0.0);
	vColor.push(1.0);
	vNormal.push(1.0);
	vNormal.push(0.0);
	vNormal.push(0.0);
	// V1
	vPos.push(1.0);
	vPos.push(0.0);
	vPos.push(0.0);
	vColor.push(1.0);
	vColor.push(0.0);
	vColor.push(0.0);
	vColor.push(1.0);
	vNormal.push(1.0);
	vNormal.push(0.0);
	vNormal.push(0.0);

	// Y Axis
	// V2
	vPos.push(0.0);
	vPos.push(0.0);
	vPos.push(0.0);
	vColor.push(0.0);
	vColor.push(1.0);
	vColor.push(0.0);
	vColor.push(1.0);
	vNormal.push(1.0);
	vNormal.push(0.0);
	vNormal.push(0.0);
	// V3
	vPos.push(0.0);
	vPos.push(1.0);
	vPos.push(0.0);
	vColor.push(0.0);
	vColor.push(1.0);
	vColor.push(0.0);
	vColor.push(1.0);
	vNormal.push(1.0);
	vNormal.push(0.0);
	vNormal.push(0.0);

	// Z Axis
	// V4
	vPos.push(0.0);
	vPos.push(0.0);
	vPos.push(0.0);
	vColor.push(0.0);
	vColor.push(0.0);
	vColor.push(1.0);
	vColor.push(1.0);
	vNormal.push(1.0);
	vNormal.push(0.0);
	vNormal.push(0.0);
	// V5
	vPos.push(0.0);
	vPos.push(0.0);
	vPos.push(1.0);
	vColor.push(0.0);
	vColor.push(0.0);
	vColor.push(1.0);
	vColor.push(1.0);
	vNormal.push(1.0);
	vNormal.push(0.0);
	vNormal.push(0.0);
	
	lInd.push(0);	
	lInd.push(1);	
	lInd.push(2);	
	lInd.push(3);	
	lInd.push(4);	
	lInd.push(5);	
	
	axis.vertexBuffer = gl.createBuffer();
	if (axis.vertexBuffer) {		
		gl.bindBuffer(gl.ARRAY_BUFFER, axis.vertexBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vPos), gl.STATIC_DRAW);
		}
	else
		alert("ERROR: can not create vertexBuffer");
	
	axis.normalBuffer = gl.createBuffer();
	if (axis.normalBuffer) {		
		gl.bindBuffer(gl.ARRAY_BUFFER, axis.normalBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vNormal), gl.STATIC_DRAW);
		}
	else
		alert("ERROR: can not create colorBuffer");

	axis.indexBuffer = gl.createBuffer();
	if (axis.indexBuffer) {		
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, axis.indexBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(lInd), gl.STATIC_DRAW);
		}
	else
		alert("ERROR: can not create indexBuffer");
	
	axis.numObjects = lInd.length;
	
	return axis;
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

	if (o.normalBuffer != null) {
		gl.bindBuffer(gl.ARRAY_BUFFER, o.normalBuffer);
		gl.vertexAttribPointer(shaderProgram.vNormalAttr, 3, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(shaderProgram.vNormalAttr);
		}
	else
		alert("o.normalBuffer == null");

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, o.indexBuffer);

	gl.drawElements(primitive, o.numObjects, gl.UNSIGNED_SHORT, 0);
}

// ********************************************************
// ********************************************************
function drawScene() {

var modelMat 	= new Matrix4();
var ViewMat 	= new Matrix4();
var ProjMat 	= new Matrix4();
var NormMat 	= new Matrix4();
var Color		= new Vector3();

	Color.elements[0] = 1.0;
	Color.elements[1] = 1.0;
	Color.elements[2] = 1.0;

	modelMat.setIdentity();
	ViewMat.setIdentity();
	ProjMat.setIdentity();
	NormMat.setIdentity();

	gl.clear(gl.COLOR_BUFFER_BIT || gl.DEPTH_BUFFER_BIT);

	gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
	
    try {
    	gl.useProgram(shader);
		}
	catch(err){
        alert(err);
        console.error(err.description);
    	}
    		
    ViewMat.setLookAt(	cameraPos.elements[0], 
    					cameraPos.elements[1], 
    					cameraPos.elements[2], 
    					cameraLook.elements[0], 
    					cameraLook.elements[1], 
    					cameraLook.elements[2], 
    					cameraUp.elements[0], 
    					cameraUp.elements[1], 
    					cameraUp.elements[2] 
    				);
    
    ProjMat.setPerspective( 60.0, gl.viewportWidth / gl.viewportHeight, 0.1, 25.0);
    		
	gl.uniformMatrix4fv(shader.MMatUniform, false, modelMat.elements);
	gl.uniformMatrix4fv(shader.VMatUniform, false, ViewMat.elements);
	gl.uniformMatrix4fv(shader.PMatUniform, false, ProjMat.elements);
	gl.uniformMatrix4fv(shader.NMatUniform, false, NormMat.elements);
	gl.uniform3fv(shader.uColor, Color.elements);

	draw(axis, shader, gl.LINES);	
	
	
	// Desenha Sol
			
	Color.elements[0] = 1.0;
	Color.elements[1] = 1.0;
	Color.elements[2] = 0.0;
	
	modelMat.scale(2.5, 2.5, 2.5);
	NormMat.setInverseOf(modelMat);
	NormMat.transpose();
	
	gl.uniformMatrix4fv(shader.MMatUniform, false, modelMat.elements);
	gl.uniformMatrix4fv(shader.NMatUniform, false, NormMat.elements);
	gl.uniform3fv(shader.uColor, Color.elements);
	
	for(var o = 0; o < model.length; o++) 
		draw(model[o], shader, gl.TRIANGLES);
	
	// Desenha Mercurio
				
	Color.elements[0] = 1.0;
	Color.elements[1] = 0.3;
	Color.elements[2] = 0.3;
			
	modelMat.setIdentity();
	modelMat.rotate(RotMercury, 0.0, 1.0, 0.0);
	modelMat.translate(2.2, 0.0, 0.0);
	modelMat.scale(0.8, 0.8, 0.8);
	NormMat.setInverseOf(modelMat);
	NormMat.transpose();
	
	gl.uniformMatrix4fv(shader.MMatUniform, false, modelMat.elements);
	gl.uniformMatrix4fv(shader.NMatUniform, false, NormMat.elements);
	gl.uniform3fv(shader.uColor, Color.elements);	
	
	for(var o = 0; o < model.length; o++) 
		draw(model[o], shader, gl.TRIANGLES);
	
	// Desenha Lua
				
	Color.elements[0] = 0.2;
	Color.elements[1] = 0.2;
	Color.elements[2] = 1.0;
			
	modelMat.setIdentity();
	modelMat.rotate(RotEarth, 0.0, 1.0, 0.0);
	modelMat.translate(4.5, 0.0, 0.0);
	modelMat.scale(2.0, 2.0, 2.0);
	NormMat.setInverseOf(modelMat);
	NormMat.transpose();
	
	gl.uniformMatrix4fv(shader.MMatUniform, false, modelMat.elements);
	gl.uniformMatrix4fv(shader.NMatUniform, false, NormMat.elements);
	gl.uniform3fv(shader.uColor, Color.elements);		
	
	for(var o = 0; o < model.length; o++) 
		draw(model[o], shader, gl.TRIANGLES);
	
	// Desenha Lua
	Color.elements[0] = 0.6;
	Color.elements[1] = 0.6;
	Color.elements[2] = 0.6;
	
	modelMat.setIdentity();
	modelMat.rotate(RotEarth, 0.0, 1.0, 0.0);
	modelMat.translate(4.5, 0.0, 0.0);
	modelMat.rotate(RotMoon, 0.0, 1.0, 0.0);
	modelMat.translate(1.0, 0.0, 0.0);
	modelMat.scale(0.8, 0.8, 0.8);
	NormMat.setInverseOf(modelMat);
	NormMat.transpose();
	
	gl.uniformMatrix4fv(shader.MMatUniform, false, modelMat.elements);
	gl.uniformMatrix4fv(shader.NMatUniform, false, NormMat.elements);
	gl.uniform3fv(shader.uColor, Color.elements);		
	
	for(var o = 0; o < model.length; o++) 
		draw(model[o], shader, gl.TRIANGLES);
}
        
// ********************************************************
// ********************************************************
function webGLStart() {

	canvas					= document.getElementById("LuzDoSol");
	gl 						= initGL(canvas);
	
	shader 					= initShaders("LuzDoSol", gl);	
	shader.vPositionAttr 	= gl.getAttribLocation(shader, "aVPosition");		
	shader.vNormalAttr 		= gl.getAttribLocation(shader, "aVNorm");
	shader.MMatUniform 		= gl.getUniformLocation(shader, "uModelMat");
	shader.VMatUniform 		= gl.getUniformLocation(shader, "uViewMat");
	shader.PMatUniform 		= gl.getUniformLocation(shader, "uProjMat");
	shader.NMatUniform 		= gl.getUniformLocation(shader, "uNormMat");
	
	if (shader.vPositionAttr < 0 || shader.vNormalAttr < 0 || 
		!shader.MMatUniform || !shader.VMatUniform || !shader.PMatUniform || !shader.NMatUniform ) {
		console.log("Error getAttribLocation"); 
		return;
		}
		
	shader.uColor 			= gl.getUniformLocation(shader, "uColor");
	
	if (shader.uCcolor < 0 ) {
		console.log("Error getAttribLocation"); 
		return;
		}
	
	axis = initAxisVertexBuffer();
	if (!axis) {
		console.log('Failed to set the AXIS vertex information');
		return;
		}
	readOBJFile("sphere.obj", 1, true);
	
	var tick = function() {   // Start drawing
		if (g_objDoc != null && g_objDoc.isMTLComplete()) { // OBJ and all MTLs are available
			
			onReadComplete();
			
			g_objDoc = null;
			
			cameraPos.elements[0] 	= 0.0;
			cameraPos.elements[1] 	= 10.0;
			cameraPos.elements[2] 	= 0.0;
			cameraLook.elements[0] 	= 0.0;
			cameraLook.elements[1] 	= 0.0;
			cameraLook.elements[2] 	= 0.0;
			cameraUp.elements[0] 	= 0.0;
			cameraUp.elements[1] 	= 0.0;
			cameraUp.elements[2] 	= 1.0;
			
			lightPos.elements[0]	= 0.0;
			lightPos.elements[1]	= 0.0;
			lightPos.elements[2]	= 0.0;
			}
		if (model.length > 0) {
			drawScene();
			animate();
			}
		else
			requestAnimationFrame(tick, canvas);
		};	
	tick();
}
    
// ********************************************************
// ********************************************************
function animate() {
	requestAnimationFrame(animate, canvas);
	RotMercury += 1.0;
	RotEarth += 0.08;
	RotMoon += 8.0;
	drawScene();
}
    
// ********************************************************
// ********************************************************
function degToRad(degrees) {
	return degrees * Math.PI / 180;
}
