var canvas			= null;
var shaderPlanets	= null;
var shaderAxis		= null;
var model			= new Array;
var axis			= null;
var gl				= null;
var RotSun			= 0.0;
var RotMoon			= 0.0;
var RotEarth		= 0.0;
var transEarth		= 0.5;
var deltaTrans		= 0.01;

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
	
		groupModel.colorBuffer = null;

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

	// X Axis
	// V0
	vPos.push(0.0);
	vPos.push(0.0);
	vPos.push(0.0);
	vColor.push(1.0);
	vColor.push(0.0);
	vColor.push(0.0);
	vColor.push(1.0);
	// V1
	vPos.push(1.0);
	vPos.push(0.0);
	vPos.push(0.0);
	vColor.push(1.0);
	vColor.push(0.0);
	vColor.push(0.0);
	vColor.push(1.0);

	// Y Axis
	// V0
	vPos.push(0.0);
	vPos.push(0.0);
	vPos.push(0.0);
	vColor.push(0.0);
	vColor.push(1.0);
	vColor.push(0.0);
	vColor.push(1.0);
	// V2
	vPos.push(0.0);
	vPos.push(1.0);
	vPos.push(0.0);
	vColor.push(0.0);
	vColor.push(1.0);
	vColor.push(0.0);
	vColor.push(1.0);

	// Z Axis
	// V0
	vPos.push(0.0);
	vPos.push(0.0);
	vPos.push(0.0);
	vColor.push(0.0);
	vColor.push(0.0);
	vColor.push(1.0);
	vColor.push(1.0);
	// V3
	vPos.push(0.0);
	vPos.push(0.0);
	vPos.push(1.0);
	vColor.push(0.0);
	vColor.push(0.0);
	vColor.push(1.0);
	vColor.push(1.0);
	
	axis.vertexBuffer = gl.createBuffer();
	if (axis.vertexBuffer) {		
		gl.bindBuffer(gl.ARRAY_BUFFER, axis.vertexBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vPos), gl.STATIC_DRAW);
		}
	else
		alert("ERROR: can not create vertexBuffer");
	
	axis.colorBuffer = gl.createBuffer();
	if (axis.colorBuffer) {		
		gl.bindBuffer(gl.ARRAY_BUFFER, axis.colorBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vColor), gl.STATIC_DRAW);
		}
	else
		alert("ERROR: can not create colorBuffer");

	axis.numItems = vPos.length/3.0;
	
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
	else {
		alert("o.vertexBuffer == null");
		return;
		}

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, o.indexBuffer);

	gl.drawElements(primitive, o.numObjects, gl.UNSIGNED_SHORT, 0);
}


// ********************************************************
// ********************************************************
function drawAxis(o, shaderProgram) {

	if (o.vertexBuffer != null) {
		gl.bindBuffer(gl.ARRAY_BUFFER, o.vertexBuffer);
		gl.vertexAttribPointer(shaderProgram.vPositionAttr, 3, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(shaderProgram.vPositionAttr);  
		}
	else {
		alert("o.vertexBuffer == null");
		return;
		}

	if (o.colorBuffer != null) {
		gl.bindBuffer(gl.ARRAY_BUFFER, o.colorBuffer);
		gl.vertexAttribPointer(shaderProgram.vColorAttr, 4, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(shaderProgram.vColorAttr);
		}
	else {
		alert("o.colorBuffer == null");
  		return;
		}

	gl.drawArrays(gl.LINES, 0, o.numItems);
}

// ********************************************************
// ********************************************************
function drawScene() {

var modelMat 	= new Matrix4();
var color 		= new Float32Array(3);

	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
	
    try {
    	gl.useProgram(shaderAxis);
		}
	catch(err){
        alert(err);
        console.error(err.description);
    	}
    	
    // Desenha Eixos Coordenados
    	
	modelMat.setIdentity();
	gl.uniformMatrix4fv(shaderAxis.uModelMat, false, modelMat.elements);

	drawAxis(axis, shaderAxis);

    try {
    	gl.useProgram(shaderPlanets);
		}
	catch(err){
        alert(err);
        console.error(err.description);
    	}
    	
   // Desenha Sol
    	
	modelMat.setScale(0.5, 0.5, 0.5);
	gl.uniformMatrix4fv(shaderPlanets.uModelMat, false, modelMat.elements);
	
	color[0] = 1.0; color[1] = 1.0; color[2] = 0.0;
	gl.uniform3fv(shaderPlanets.uColor, color);
	
	for(var o = 0; o < model.length; o++) 
		draw(model[o], shaderPlanets, gl.TRIANGLES);
	
    // Desenha Terra
	modelMat.setIdentity();

	modelMat.setScale(0.3, 0.3, 0.3);
 	modelMat.rotate(RotEarth, 0, 1, 0);
	modelMat.translate(2, 0.0, 0.0);

	gl.uniformMatrix4fv(shaderPlanets.uModelMat, false, modelMat.elements);
	color[0] = 0.2; color[1] = 0.2; color[2] = 0.8;
	gl.uniform3fv(shaderPlanets.uColor, color);
	
	for(var o = 0; o < model.length; o++) 
		draw(model[o], shaderPlanets, gl.TRIANGLES);
	
    // Desenha Lua
	
	modelMat.rotate(RotMoon, 0, 1, 0);
	modelMat.translate(0.9, 0.0, 0.0);
	modelMat.scale(0.5, 0.5, 0.5);

	gl.uniformMatrix4fv(shaderPlanets.uModelMat, false, modelMat.elements);
	color[0] = 0.5; color[1] = 0.5; color[2] = 0.5;
	gl.uniform3fv(shaderPlanets.uColor, color);
	
	for(var o = 0; o < model.length; o++) 
		draw(model[o], shaderPlanets, gl.TRIANGLES);

}
    
// ********************************************************
// ********************************************************
function webGLStart() {

	canvas 	= document.getElementById("Planets");
	gl 		= initGL(canvas);
	
	shaderPlanets 					= initShaders("Planets", gl);	
	shaderPlanets.vPositionAttr 	= gl.getAttribLocation(shaderPlanets, "aVertexPosition");		
	shaderPlanets.uColor 			= gl.getUniformLocation(shaderPlanets, "uColor");
	shaderPlanets.uModelMat 		= gl.getUniformLocation(shaderPlanets, "uModelMat");
	
	if (shaderPlanets.vPositionAttr < 0 || shaderPlanets.uColor  < 0 || !shaderPlanets.uModelMat) {
		console.log("Error getAttribLocation shaderPlanets"); 
		return;
		}
		
	shaderAxis 					= initShaders("Axis", gl);	
	shaderAxis.vPositionAttr 	= gl.getAttribLocation(shaderAxis, "aVertexPosition");		
	shaderAxis.vColorAttr		= gl.getAttribLocation(shaderAxis, "aVertexColor");
	shaderAxis.uModelMat 		= gl.getUniformLocation(shaderAxis, "uModelMat");
	
	if (shaderAxis.vPositionAttr < 0 || shaderAxis.vColorAttr < 0 || !shaderAxis.uModelMat) {
		console.log("Error getAttribLocation shaderAxis"); 
		return;
		}
		
	axis = initAxisVertexBuffer(gl);
	if (!axis) {
		console.log('Failed to set the AXIS vertex information');
		return;
		}
		
	readOBJFile("sphere.obj", gl, 1, true);
	
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
			GlobalScale	= 1.0 /	Math.max(	Math.abs(g_drawingInfo.BBox.Max.x - g_drawingInfo.BBox.Min.x),
											Math.abs(g_drawingInfo.BBox.Max.y - g_drawingInfo.BBox.Min.y),
											Math.abs(g_drawingInfo.BBox.Max.z - g_drawingInfo.BBox.Min.z));
			}
		if (model.length > 0) {
			//drawScene();
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
	
	//transEarth += deltaTrans;
	if (transEarth > 0.9)
		deltaTrans *= -1.0;
	else
		if (transEarth < 0.5)
			deltaTrans *= -1.0; 

	RotEarth += 1;
	RotMoon += 5;
	drawScene(); 
}
	

