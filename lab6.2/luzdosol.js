var gl			= null;
var canvas		= null;
var shaderTerra		= null;

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

//	REFLECT LIGHT ATTRS
var modelMat	= new Matrix4();
var viewMat	= new Matrix4();
var projMat	= new Matrix4();
var normMat	= new Matrix4();

var lightColor	= new Vector4();
var matAmb	= new Vector4();
var matDif	= new Vector4();
var matSpec	= new Vector4();
var Ns		= 100.0;
var rotEarth	= new Matrix4();
var color	= new Float32Array(3);



function initGL( canvas ) {
	
	// Try to grab the standard context. If it fails, fallback to experimental.
    	gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
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

	shaderTerra 			= initShaders( "terra", gl );

	shaderTerra.aVertexPosition 	= gl.getAttribLocation( shaderTerra, "aVertexPosition" );
	shaderTerra.aVNorm		= gl.getAttribLocation( shaderTerra, "aVNorm" );

	shaderTerra.uModelMat		= gl.getUniformLocation( shaderTerra, "uModelMat" );
	shaderTerra.uViewMat		= gl.getUniformLocation( shaderTerra, "uViewMat" );
	shaderTerra.uProjMat		= gl.getUniformLocation( shaderTerra, "uProjMat" );
	shaderTerra.uNormMat		= gl.getUniformLocation( shaderTerra, "uNormMat" );

	shaderTerra.uCamPos		= gl.getUniformLocation( shaderTerra, "uCamPos" );
	shaderTerra.uLPos		= gl.getUniformLocation( shaderTerra, "uLPos" );
	shaderTerra.uLColor		= gl.getUniformLocation( shaderTerra, "uLColor" );
	shaderTerra.uMatAmb		= gl.getUniformLocation( shaderTerra, "uMatAmb" );
	shaderTerra.uMatDif		= gl.getUniformLocation( shaderTerra, "uMatDif" );
	shaderTerra.uMatSpec		= gl.getUniformLocation( shaderTerra, "uMatSpec" );
	shaderTerra.uExpSpec		= gl.getUniformLocation( shaderTerra, "uExpSpec" );

	if( !shaderTerra ) {
		alert( "Could not initialize shader Terra" );
	}else{
 		if( shaderTerra.aVertexPosition < 0 || shaderTerra.aVNorm < 0 ){
			alert( "ERROR: getAttribLocation shaderTerra" );
		}
 		if( !shaderTerra.uModelMat || !shaderTerra.uProjMat || !shaderTerra.uNormMat
			|| !shaderTerra.uCamPos  || !shaderTerra.uLPos
			|| !shaderTerra.uLColor  || !shaderTerra.uMatSpec 
			|| !shaderTerra.uMatAmb  || !shaderTerra.uMatDif
			|| !shaderTerra.uExpSpec ){
			alert( "ERROR: getUniformLocation shaderTerra" );
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

// 	POG - SEM ESSA CHAMADA A ILUMINACAO NAO ESTA FUNCIONANDO
	workaroundFixBindAttribZeroProblem( );

	gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

	gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight );



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
	
	
	lightPos.elements[0]	= 0.0;
	lightPos.elements[1]	= 0.0;
	lightPos.elements[2]	= 0.0;


	try{
		gl.useProgram( shaderTerra );

		 //Desenha Sol              
		drawSun( );

		//Desenha Terra
		
		drawEarth( );

		//Desenha Lua
		drawMoon( );		
	}catch( err ){
		alert( err );
		console.log( err.description );
	}
 
}

function drawShaderTerra( ){

	gl.uniformMatrix4fv( shaderTerra.uNormMat, false, normMat.elements );
	gl.uniformMatrix4fv( shaderTerra.uModelMat, false, modelMat.elements );	
	gl.uniformMatrix4fv( shaderTerra.uViewMat, false, viewMat.elements );
	gl.uniformMatrix4fv( shaderTerra.uProjMat, false, projMat.elements );

	gl.uniform3fv( shaderTerra.uCamPos, cameraPos.elements );
	gl.uniform4fv( shaderTerra.uLColor, lightColor.elements );
	gl.uniform3fv( shaderTerra.uLPos, lightPos.elements );
	gl.uniform3fv( shaderTerra.uCamPos, cameraPos.elements );
	
	gl.uniform4fv( shaderTerra.uMatSpec, matSpec.elements );
	gl.uniform4fv( shaderTerra.uMatAmb, matAmb.elements );
	gl.uniform4fv( shaderTerra.uMatDif, matDif.elements );
	gl.uniform1f( shaderTerra.uExpSpec, Ns );
	
	for( var o = 0; o < model.length; o++ ){
		draw( model[o], shaderTerra, gl.TRIANGLES );
	}
}

function drawSun( ){

	modelMat.setScale( 0.8, 0.8, 0.8 );
	// Quando remove essa linha a luz some, não sei por que	

	normMat.setIdentity();
	normMat.setInverseOf( modelMat );
	normMat.transpose();

	lightColor.elements[0] = 1.0;
	lightColor.elements[1] = 1.0;
	lightColor.elements[2] = 0.0;
	lightColor.elements[3] = 1.0;

	matAmb.elements[0] = 0.9;
	matAmb.elements[1] = 0.9;
	matAmb.elements[2] = 0.9;
	matAmb.elements[3] = 1.0;

	matDif.elements[0] = 0.8;
	matDif.elements[1] = 0.8;
	matDif.elements[2] = 0.8;
	matDif.elements[3] = 1.0;

	matSpec.elements[0] = 0.0;
	matSpec.elements[1] = 0.0;
	matSpec.elements[2] = 0.0;
	matSpec.elements[3] = 1.0;

	NS	= 100.0;
	
	drawShaderTerra( );
}

function drawEarth( ){


	//Desenha Terra
	modelMat.setIdentity();
	modelMat.scale( 0.4, 0.4, 0.4 );
	modelMat.rotate( RotEarth, 0, 1, 0 );
	modelMat.translate( 2, 0, 0 );

	normMat.setIdentity();
	normMat.setInverseOf( modelMat );
	normMat.transpose();

	lightColor.elements[0] = 0.2;
	lightColor.elements[1] = 0.2;
	lightColor.elements[2] = 0.8;
	lightColor.elements[3] = 1.0;

	matAmb.elements[0] = 0.1;
	matAmb.elements[1] = 0.1;
	matAmb.elements[2] = 0.1;
	matAmb.elements[3] = 1.0;

	matDif.elements[0] = 0.8;
	matDif.elements[1] = 0.8;
	matDif.elements[2] = 0.8;
	matDif.elements[3] = 1.0;

	matSpec.elements[0] = 0.7;
	matSpec.elements[1] = 0.7;
	matSpec.elements[2] = 0.7;
	matSpec.elements[3] = 1.0;

	NS	= 100.0;

	drawShaderTerra( );
}

function drawMoon( ){

	modelMat.rotate( RotMoon, 0, 1, 0 );
	modelMat.translate( 0.6, 0, 0 );
	modelMat.scale( 0.5, 0.5, 0.5 );

	normMat.setIdentity();
	normMat.setInverseOf( modelMat );
	normMat.transpose();

	lightColor.elements[0] = 0.7;
	lightColor.elements[1] = 0.7;
	lightColor.elements[2] = 0.7;
	lightColor.elements[3] = 1.0;

	matAmb.elements[0] = 0.04;
	matAmb.elements[1] = 0.04;
	matAmb.elements[2] = 0.04;
	matAmb.elements[3] = 1.0;

	matDif.elements[0] = 1.0;
	matDif.elements[1] = 1.0;
	matDif.elements[2] = 1.0;
	matDif.elements[3] = 1.0;

	matSpec.elements[0] = 0.1;
	matSpec.elements[1] = 0.1;
	matSpec.elements[2] = 0.1;
	matSpec.elements[3] = 1.0;

	NS	= 100.0;
	
	drawShaderTerra( );
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
	RotEarth += 0.2;
	RotMoon += 1;
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
		gl.enableVertexAttribArray( shader.aVertexPosition );
		gl.vertexAttribPointer( shader.aVertexPosition, 3, gl.FLOAT, false, 0, 0 );
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

// Basically, vertex attrib 0 has to be enabled or else OpenGL 
// will not render where as OpenGL ES 2.0 will. 
// https://www.khronos.org/webgl/public-mailing-list/archives/1005/msg00053.html
function workaroundFixBindAttribZeroProblem(){
	try{
		gl.bindBuffer( gl.ARRAY_BUFFER, model[0].normalBuffer );
		gl.vertexAttribPointer( 0, 3, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( 0 );
        }catch( err ){
                alert( err );
                console.log( err.description );
        }
}

