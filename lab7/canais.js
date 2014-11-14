var canvas 		= null;
var gl			= null;
var shader		= null;
var baseImage	= null;
var texture		= null;

// ********************************************************
// ********************************************************
function initGL(canvas) {
	
	var gl = canvas.getContext("webgl");
	if (!gl) {
		return (null);
		}
	
	gl.viewportWidth 	= canvas.width;
	gl.viewportHeight 	= canvas.height;
	
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	
	return gl;
}

// ********************************************************
// ********************************************************
function initBaseImage() {
	
var baseImage = new Object(); 
var vPos = new Array;
var vTex = new Array;

	vPos.push(-1.0); 	// V0
	vPos.push(-1.0);
	vPos.push( 0.0);
	vPos.push( 1.0);	// V1
	vPos.push(-1.0);
	vPos.push( 0.0);
	vPos.push( 1.0);	// V2
	vPos.push( 1.0);
	vPos.push( 0.0);
	vPos.push(-1.0); 	// V0
	vPos.push(-1.0);
	vPos.push( 0.0);
	vPos.push( 1.0);	// V2
	vPos.push( 1.0);
	vPos.push( 0.0);
	vPos.push(-1.0);	// V3
	vPos.push( 1.0);
	vPos.push( 0.0);
			
	vTex.push( 0.0); 	// V0
	vTex.push( 0.0);
	vTex.push( 1.0);	// V1
	vTex.push( 0.0);
	vTex.push( 1.0);	// V2
	vTex.push( 1.0);
	vTex.push( 0.0); 	// V0
	vTex.push( 0.0);
	vTex.push( 1.0);	// V2
	vTex.push( 1.0);
	vTex.push( 0.0);	// V3
	vTex.push( 1.0);
		
	baseImage.vertexBuffer = gl.createBuffer();
	if (baseImage.vertexBuffer) {		
		gl.bindBuffer(gl.ARRAY_BUFFER, baseImage.vertexBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vPos), gl.STATIC_DRAW);
		}
	else
		alert("ERROR: can not create vertexBuffer");
	
	baseImage.textureBuffer = gl.createBuffer();
	if (baseImage.textureBuffer) {		
		gl.bindBuffer(gl.ARRAY_BUFFER, baseImage.textureBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vTex), gl.STATIC_DRAW);
		}
	else
		alert("ERROR: can not create textureBuffer");

	baseImage.numItems = vPos.length/3.0;
	
	return baseImage;
}

// ********************************************************
// ********************************************************
function drawScene(o, channel) {

	switch( channel ){

		case 0: {
			gl.viewport(0, 0, 500, 500);
			break;
		}	
		case 1: {
			gl.viewport(500, 0, 500, 500);
			break;
		}	
		case 2: {
			gl.viewport(0, 500, 500, 500);
			break;
		}	
		case 3: {
			gl.viewport(500, 500, 500, 500);
			break;
		}	
	}
	
    try {
    	gl.useProgram(shader);
		}
	catch(err){
        alert(err);
        console.error(err.description);
    	}
    	
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, texture);

	gl.uniform1i(shader.uSampler, 0);
	gl.uniform1i(shader.uChannel, channel);
		
	if (o.vertexBuffer != null) {
		gl.bindBuffer(gl.ARRAY_BUFFER, o.vertexBuffer);
		gl.vertexAttribPointer(shader.vPositionAttr, 3, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(shader.vPositionAttr);  
		}
	else {
		alert("o.vertexBuffer == null");
		return;
		}

	if (o.textureBuffer != null) {
		gl.bindBuffer(gl.ARRAY_BUFFER, o.textureBuffer);
		gl.vertexAttribPointer(shader.vTexAttr, 2, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(shader.vTexAttr);
		}
	else {
		alert("o.textureBuffer == null");
  		return;
		}
   	
	gl.drawArrays(gl.TRIANGLES, 0, o.numItems);
}

// ********************************************************
// ********************************************************
function initTexture() {

	texture = gl.createTexture();
	
	var image = new Image();
	image.onload = function(){
		var canvas 			= document.getElementById("imagem");
		var text 			= document.getElementById("output");
		text.innerHTML 		= 	"Imagem :" + image.src + 
								"<br/> Dimensao = " + image.height +
								" <i>x</i> " + image.width;		
		
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
	    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.bindTexture(gl.TEXTURE_2D, null);

		gl.clear(gl.COLOR_BUFFER_BIT);
		drawScene(baseImage, 0);
		drawScene(baseImage, 1);
		drawScene(baseImage, 2);
		drawScene(baseImage, 3);
		}
	image.src = "../images/lena.png";
}

// ********************************************************
// ********************************************************
function webGLStart() {

	canvas 	= document.getElementById("imagem");
	gl 		= initGL(canvas);
	
	if (!gl) { 
		alert("Could not initialise WebGL, sorry :-(");
		return;
		}
		
	shader = initShaders("shader", gl);
	if (shader == null) {
		alert("Erro na inicilizacao do shader!!");
		return;
		}

	shader.vPositionAttr 	= gl.getAttribLocation(shaderProgram, "aVertexPosition");
	shader.vTexAttr 		= gl.getAttribLocation(shaderProgram, "aVertexTexture");
	shader.uSampler	 		= gl.getUniformLocation(shader, "uSampler");
	shader.uChannel	 		= gl.getUniformLocation(shader, "uChannel");

	if ( 	(shader.vPositionAttr < 0) ||
			(shader.vTexAttr < 0) ||
			(shader.uSampler < 0) ) {
		alert("Shader attribute ou uniform nao localizado!");
		return;
		}
	baseImage = initBaseImage();
	if (baseImage == null) {
		alert("Erro na inicilizacao de baseImage!!");
		return;
		}
	initTexture();
}


