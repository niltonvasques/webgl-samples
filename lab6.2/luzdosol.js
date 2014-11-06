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
var FOVy		= 75.0;


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
	shaderLuzdoSol.vPositionAttr = gl.getAttribLocation( shaderLuzdoSol, "aVertexPosition" );
	shaderLuzdoSol.vColor	= gl.getUniformLocation( shaderLuzdoSol, "aVertexColor" );

	if( !shaderLuzdoSol ) {
		alert( "Could not initialize shader LuzDoSol" );
	}else{
 		if( shaderLuzdoSol.vPositionAttr < 0 || shaderLuzdoSol.vColor < 0 ){
			alert( "ERROR: getAttribLocation shaderLuzdoSol" );
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
		cameraUp.elements[2]
	);

	projMat.setPerspective( FOVy, gl.viewportWidth / gl.viewportHeight, 0.1, 25.0 );

	modelMat.setScale( 0.8, 0.8, 0.8 );
	mvpMat.set( projMat ).multiply( viewMat ).multiply( modelMat );
	
	//Desenha Sol
	color[0] = 1.0;
	color[1] = 1.0;
	color[2] = 0.0;

	gl.uniform3fv( shaderLuzdoSol.vColor, color );
	
	for( var o = 0; o < model.length; o++ ){
		draw( model[o], shaderLuzdoSol, gl.TRIANGLES );
	}
	
		
		
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
		
		groupModel.numObjects = g_drawingInfo.indices[o].length;
		model.push( groupModel );
	}
		
}


// ********************************************************
// ********************************************************
function draw( o, shader, primitive ){
	if( o.vertexBuffer != null ){
		gl.bindBuffer( gl.ARRAY_BUFFER, o.vertexBuffer );
		gl.vertexAttribPointer( shader.vPositionAttr, 3, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( shader.vPositionAttr );
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
