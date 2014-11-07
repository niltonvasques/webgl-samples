var gl 		= null;
var canvas	= null;
var shaderLuzdoSol 	= null;


// MODEL VARIABLES
var obj_file	= "sphere.obj";

var g_objDoc 		= null;	// The information of OBJ file
var g_drawingInfo 	= null;	// The information for drawing 3D model
var model		= new Array;
var groupModel		= null;

//	PROJECTION ATTRS
var cameraPos 		= new Vector3();
var cameraLook 		= new Vector3();
var cameraUp 		= new Vector3();
var lightPos		= new Vector3();
var FOVy		= 75.0;

//	ANIMATE ATTRS
var RotSun		= 0.0;
var RotMoon		= 0.0;	
var RotEarth 		= 0.0;
var transEarth		= 0.5;
var deltaTrans		= 0.01;



function initGL( canvas ) {
	
	gl = canvas.getContext( "webgl" );
	if( !gl ) {
		alert( "Could not initialize WebGL, sorry :(!" );
		return gl;
	}
	gl.viewportWidth 	= canvas.width;
	gl.viewportHeight 	= canvas.height;
	gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
	gl.enable( gl.DEPTH_TEST );
	
	return gl;
}

function webGLStart( ){
	
	canvas =  document.getElementById( "canvas" );
	gl 	= initGL( canvas );
	
	shaderLuzdoSol = initShaders( "LuzDoSol", gl );
	shaderLuzdoSol.aVertexPosition 	= gl.getAttribLocation( shaderLuzdoSol, "aVertexPosition" );
	shaderLuzdoSol.aVNorm		= gl.getAttribLocation( shaderLuzdoSol, "aVNorm" );
	shaderLuzdoSol.aVertexColor	= gl.getUniformLocation( shaderLuzdoSol, "aVertexColor" );
	shaderLuzdoSol.uModelMat	= gl.getUniformLocation( shaderLuzdoSol, "uModelMat" );
	shaderLuzdoSol.uViewMat		= gl.getUniformLocation( shaderLuzdoSol, "uViewMat" );
	shaderLuzdoSol.uProjMat		= gl.getUniformLocation( shaderLuzdoSol, "uProjMat" );

	if( !shaderLuzdoSol ) {
		alert( "Could not initialize shader LuzDoSol" );
	}else{
 		if( shaderLuzdoSol.aVertexPosition < 0 ){
			alert( "ERROR: getAttribLocation shaderLuzdoSol" );
		}
 		if( !shaderLuzdoSol.aVertexColor || !shaderLuzdoSol.uModelMat
			|| !shaderLuzdoSol.uProjMat ){
			alert( "ERROR: getUniformLocation shaderLuzdoSol" );
		}
	}

	shaderLuzdoSol.uLightPos 	= gl.getUniformLocation( shaderLuzdoSol, "uLightPos" );

	if( !shaderLuzdoSol ){
		if( !shaderLuzdoSol.uLightPos ){
			alert(" ERROR: getUniformLocation ");
		}
	}

	

	
	ajax( obj_file, function( responseText ){
		onReadOBJFile( responseText, obj_file, gl, 1, true );
	});

	var tick = function () {
		if( g_objDoc != null && g_objDoc.isMTLComplete() ) {

			onReadComplete( gl );	

			g_objDoc = null;

			cameraPos.elements[0] 	= 1.0;
			cameraPos.elements[1] 	= 1.0;
			cameraPos.elements[2] 	= 1.0;
			cameraLook.elements[0] 	= 0.0;
			cameraLook.elements[1] 	= 0.0;
			cameraLook.elements[2] 	= 0.0;
			cameraUp.elements[0] 	= 0.0;
			cameraUp.elements[1] 	= 1.0;
			cameraUp.elements[2] 	= 0.0;
		}

		if( model.length > 0 ){
			drawScene( );
			animate( );
		}else{
			requestAnimationFrame( tick, canvas );
		}

	};
	
	tick( );
	}

function drawScene( ) {

	var modelMat	= new Matrix4();
	var viewMat	= new Matrix4();
	var projMat	= new Matrix4();
	var mvpMat	= new Matrix4();
	var rotEarth	= new Matrix4();
	var color	= new Float32Array(3);

	gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

	gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight );

	try{
		gl.useProgram( shaderLuzdoSol );

	}catch( err ){
		alert( err );
		console.log( err.description );
	}

	modelMat.setIdentity();
	viewMat.setIdentity();
	projMat.setIdentity();

	viewMat.setLookAt( 
		cameraPos.elements[0],
		cameraPos.elements[1],
		cameraPos.elements[2],
		cameraLook.elements[0],
		cameraLook.elements[1],
		cameraLook.elements[2],
		cameraUp.elements[0],
		cameraUp.elements[1],
		cameraUp.elements[2],
		
		lightPos.elements[0],
		lightPos.elements[1],
		lightPos.elements[2]
	);

	projMat.setPerspective( FOVy, gl.viewportWidth / gl.viewportHeight, 0.1, 25.0 );
	
	gl.uniform3fv( shaderLuzdoSol.uLightPos, lightPos.elements );

	//Desenha Sol
	modelMat.setScale( 0.8, 0.8, 0.8 );

	color[0] = 1.0;
	color[1] = 1.0;
	color[2] = 0.0;

	drawCosmicBody( modelMat, viewMat, projMat, color );		

	//Desenha Terra
	modelMat.setIdentity();
	modelMat.scale( 0.4, 0.4, 0.4 );
	modelMat.rotate( RotEarth, 0, 1, 0 );
	modelMat.translate( 2, 0, 0 );

	color[0] = 0.2;
	color[1] = 0.2;
	color[2] = 0.8;
	
	drawCosmicBody( modelMat, viewMat, projMat, color );		

	//Desenha Lua
	modelMat.rotate( RotMoon, 0, 1, 0 );
	modelMat.translate( 0.6, 0, 0 );
	modelMat.scale( 0.5, 0.5, 0.5 );

	color[0] = 0.5;
	color[1] = 0.5;
	color[2] = 0.5;
	
	drawCosmicBody( modelMat, viewMat, projMat, color );		
		
}

function drawCosmicBody( model, view, proj, color ){
	gl.uniformMatrix4fv( shaderLuzdoSol.uModelMat, false, model.elements );	
	gl.uniformMatrix4fv( shaderLuzdoSol.uViewMat, false, view.elements );
	gl.uniformMatrix4fv( shaderLuzdoSol.uProjMat, false, proj.elements );

	gl.uniform3fv( shaderLuzdoSol.aVertexColor, color );

	for( var o = 0; o < model.length; o++ ){
		draw( model[o], shaderLuzdoSol, gl.TRIANGLES );
	}
	
}


// ********************************************************
// ********************************************************
function animate() {
	requestAnimationFrame(animate, canvas);
	transEarth += deltaTrans;
	if (transEarth > 1.9)
		deltaTrans *= -1.0;
	else
		if (transEarth < 0.5)
			deltaTrans *= -1.0; 
	RotEarth += 2;
	RotMoon += 5;
	drawScene(); 
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

function onReadComplete ( gl ) {
	var groupModel = null;

	g_drawingInfo	= g_objDoc.getDrawingInfo();
	
	for( var o = 0; o < g_drawingInfo.numObjects; o++ ){
			
		groupModel = new Object();
			
		groupModel.vertexBuffer = gl.createBuffer();
		if( groupModel.vertexBuffer ){
			gl.bindBuffer( gl.ARRAY_BUFFER, groupModel.vertexBuffer );
			gl.bufferData( gl.ARRAY_BUFFER, g_drawingInfo.vertices[o], gl.STATIC_DRAW );
		}else{
			alert( "ERROR: Can't create vertexBuffer" );
		}
		
		groupModel.colorBuffer = null;

		groupModel.indexBuffer = gl.createBuffer();

		if( groupModel.indexBuffer ){
			gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, groupModel.indexBuffer );
			gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, g_drawingInfo.indices[o], gl.STATIC_DRAW );
		}else{
			alert( "ERROR: Can't create indexBuffer " );
		}

		groupModel.normalBuffer = gl.createBuffer( );
		if( groupModel.normalBuffer ){
			gl.bindBuffer( gl.ARRAY_BUFFER, groupModel.normalBuffer );
			gl.bufferData( gl.ARRAY_BUFFER, g_drawingInfo.normals[o], gl.STATIC_DRAW );
		}else{
			alert( "ERROR: Can't create normal buffer " );
		}
		
		groupModel.numObjects = g_drawingInfo.indices[o].length;
		model.push( groupModel );
	}
		
}


// ********************************************************
// ********************************************************
function draw( o, shader, primitive ){
	if( o.vertexBuffer != null ){
		gl.bindBuffer( gl.ARRAY_BUFFER, o.vertexBuffer );
		gl.vertexAttribPointer( shader.aVertexPosition, 3, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( shader.aVertexPosition );
	}else{
		alert( "o.vertxBuffer == null" );
		return;
	}
	
	gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, o.indexBuffer );
	gl.drawElements( primitive, o.numObjects, gl.UNSIGNED_SHORT, 0 );
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
