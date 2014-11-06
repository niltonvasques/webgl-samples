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
var modelRotMat	= new Matrix4();
var mouseDown 	= false;
var lastMouseX;
var	lastMouseY;

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

function initAxisVertexBuffer(gl) {
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
function draw(gl, o, shaderProgram, primitive) {

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
var lightColor	= new Vector4();
var matAmb		= new Vector4();
var matDif		= new Vector4();
var matSpec		= new Vector4();

	lightColor.elements[0] = 1.0;
	lightColor.elements[1] = 1.0;
	lightColor.elements[2] = 1.0;
	lightColor.elements[3] = 1.0;

	matAmb.elements[0] = 0.2;
	matAmb.elements[1] = 0.2;
	matAmb.elements[2] = 0.2;
	matAmb.elements[3] = 1.0;

	matDif.elements[0] = 0.5;
	matDif.elements[1] = 0.0;
	matDif.elements[2] = 0.0;
	matDif.elements[3] = 1.0;

	matSpec.elements[0] = 1.0;
	matSpec.elements[1] = 1.0;
	matSpec.elements[2] = 1.0;
	matSpec.elements[3] = 1.0;

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
    
    ProjMat.setPerspective( 75.0, gl.viewportWidth / gl.viewportHeight, 0.1, 1200.0);
    		
	gl.uniformMatrix4fv(shader.MMatUniform, false, modelMat.elements);
	gl.uniformMatrix4fv(shader.VMatUniform, false, ViewMat.elements);
	gl.uniformMatrix4fv(shader.PMatUniform, false, ProjMat.elements);
	gl.uniformMatrix4fv(shader.NMatUniform, false, NormMat.elements);
	gl.uniform3fv(shader.uCamPos, cameraPos.elements);
	gl.uniform4fv(shader.uLightColor, lightColor.elements);
	gl.uniform3fv(shader.uLightPos, lightPos.elements);
	gl.uniform3fv(shader.uCamPos, cameraPos.elements);

	draw(gl, axis, shader, gl.LINES);	
	
	modelMat.multiply(modelRotMat);
	NormMat.setInverseOf(modelMat);
	NormMat.transpose();
			
	gl.uniformMatrix4fv(shader.MMatUniform, false, modelMat.elements);
	gl.uniformMatrix4fv(shader.NMatUniform, false, NormMat.elements);
	gl.uniform4fv(shader.uMatAmb, matAmb.elements);
	gl.uniform4fv(shader.uMatDif, matDif.elements);
	gl.uniform4fv(shader.uMatSpec, matSpec.elements);
	
	for(var o = 0; o < model.length; o++) 
		draw(gl, model[o], shader, gl.TRIANGLES);
}
        
// ********************************************************
// ********************************************************
function webGLStart() {

	document.onmouseup 		= handleMouseUp;
	document.onmousemove 	= handleMouseMove;
	
	canvas					= document.getElementById("noMaterial");
	canvas.onmousedown 		= handleMouseDown;
	gl 						= initGL(canvas);
	
	shader 					= initShaders("noMaterial", gl);	
	shader.vPositionAttr 	= gl.getAttribLocation(shader, "aVPosition");		
	shader.vNormalAttr 		= gl.getAttribLocation(shader, "aVNorm");
	shader.MMatUniform 		= gl.getUniformLocation(shader, "uModelMat");
	shader.VMatUniform 		= gl.getUniformLocation(shader, "uViewMat");
	shader.PMatUniform 		= gl.getUniformLocation(shader, "uProjMat");
	shader.NMatUniform 		= gl.getUniformLocation(shader, "uNormMat");
	
	if (shader.vPositionAttr < 0 || shader.vColorAttr < 0 || 
		!shader.MMatUniform || !shader.VMatUniform || !shader.PMatUniform || !shader.NMatUniform ) {
		console.log("Error getAttribLocation"); 
		return;
		}
		
	shader.uCamPos 			= gl.getUniformLocation(shader, "uCamPos");
	shader.uLightPos 		= gl.getUniformLocation(shader, "uLPos");
	shader.uLightColor 		= gl.getUniformLocation(shader, "uLColor");
	shader.uMatAmb 			= gl.getUniformLocation(shader, "uMatAmb");
	shader.uMatDif 			= gl.getUniformLocation(shader, "uMatDif");
	shader.uMatSpec			= gl.getUniformLocation(shader, "uMatSpec");
	
	if (shader.uCamPos < 0	 		|| shader.uLightPos < 0 	|| 
		shader.uLightColor < 0		|| shader.uMatAmb < 0 		|| 
		shader.uMatDif < 0			|| shader.uMatSpec < 0 ) {
		console.log("Error getAttribLocation"); 
		return;
		}
	
	axis = initAxisVertexBuffer(gl);
	if (!axis) {
		console.log('Failed to set the AXIS vertex information');
		return;
		}
	readOBJFile("../modelos/al.obj", gl, 1, true);
	
	var tick = function() {   // Start drawing
		if (g_objDoc != null && g_objDoc.isMTLComplete()) { // OBJ and all MTLs are available
			
			onReadComplete(gl);
			
			g_objDoc = null;
			
			cameraPos.elements[0] 	= 1.30 * g_drawingInfo.BBox.Max.x;
			cameraPos.elements[1] 	= 1.30 * g_drawingInfo.BBox.Max.y;
			cameraPos.elements[2] 	= 1.30 * g_drawingInfo.BBox.Max.z;
			cameraLook.elements[0] 	= g_drawingInfo.BBox.Center.x;
			cameraLook.elements[1] 	= g_drawingInfo.BBox.Center.y;
			cameraLook.elements[2] 	= g_drawingInfo.BBox.Center.z;
			cameraUp.elements[0] 	= 0.0;
			cameraUp.elements[1] 	= 1.0;
			cameraUp.elements[2] 	= 0.0;
			
			lightPos.elements[0]	= 0.0;
			lightPos.elements[1]	= cameraPos.elements[1];
			lightPos.elements[2]	= cameraPos.elements[2];
			}
		if (model.length > 0) 
			drawScene();
		else
			requestAnimationFrame(tick, canvas);
		};	
	tick();
}

    
// ********************************************************
// ********************************************************
function degToRad(degrees) {
	return degrees * Math.PI / 180;
}
    
// ********************************************************
// ********************************************************
function handleMouseDown(event) {
	mouseDown 	= true;
	lastMouseX 	= event.clientX;
	lastMouseY 	= event.clientY;
}
    
// ********************************************************
// ********************************************************
function handleMouseUp(event) {
	mouseDown = false;
}
    
// ********************************************************
// ********************************************************
function handleMouseMove(event) {
	if (!mouseDown)
		return;
	
	var newX 		= event.clientX;
	var newY 		= event.clientY;

	var deltaX 		= newX - lastMouseX
	var newModelRot = new Matrix4();
	
	newModelRot.setIdentity();
	newModelRot.rotate(deltaX / 5, 0.0, 1.0, 0.0);

	var deltaY = newY - lastMouseY;
	newModelRot.rotate(deltaY / 5, 1.0, 0.0, 0.0);

	modelRotMat.multiply(newModelRot);

	lastMouseX = newX
	lastMouseY = newY;
	
	drawScene();
}

