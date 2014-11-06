// OBJViewer.js (c) 2012 matsuda and itami

    
//------------------------------------------------------------------------------
// Point Object
//------------------------------------------------------------------------------
var Point = function(x, y, z) {
  this.x 	= x;
  this.y 	= y;
  this.z	= z;
}

//------------------------------------------------------------------------------
// BBOx Object
//------------------------------------------------------------------------------
var BBox = function(xm, ym, zm, xM, yM, zM, cx, cy, cz) {
	this.Min 		= new Point(xm, ym, zm);
	this.Max 		= new Point(xM, yM, zM);
	this.Center	= new Point(cx, cy, cz);
}

//------------------------------------------------------------------------------
// Vertex Object
//------------------------------------------------------------------------------
var Vertex = function(x, y, z) {
  this.x = x;
  this.y = y;
  this.z = z;
}

//------------------------------------------------------------------------------
// Normal Object
//------------------------------------------------------------------------------
var Normal = function(x, y, z) {
  this.x = x;
  this.y = y;
  this.z = z;
}

//------------------------------------------------------------------------------
// Texture Coordenates Object
//------------------------------------------------------------------------------
var TextCoord = function(u, v) {
  this.u = u;
  this.v = v;
}

//------------------------------------------------------------------------------
// Color Object
//------------------------------------------------------------------------------
var Color = function(r, g, b, a) {
  this.r = r;
  this.g = g;
  this.b = b;
  this.a = a;
}

//------------------------------------------------------------------------------
// OBJObject Object
//------------------------------------------------------------------------------
var OBJObject = function(name) {
  this.name 	= name;
  this.groups 	= new Array(0);
}
    
// ********************************************************
// ********************************************************
// Find object by name
OBJObject.prototype.findGroup = function(name) {
var strName = name.trim();
	for(var i = 0; i < this.groups.length; i++) {
		if (this.groups[i].name != null) {
			var strMatName = this.groups[i].name.trim();
			if(strMatName == strName) {
				return(this.groups[i])
				}
			}
		}
	return(null);
}

//------------------------------------------------------------------------------
// Group Object
//------------------------------------------------------------------------------
var Group = function(name) {
  this.name 		= name;
  this.materialName	= "";
  this.faces 		= new Array(0);
  this.numIndices	= 0;
}
    
// ********************************************************
// ********************************************************
Group.prototype.addFace = function(face) {
  this.faces.push(face);
  this.numIndices += face.numIndices;
}
    
// ********************************************************
// ********************************************************
Group.prototype.addMaterial = function(materialName) {
	this.materialName = materialName;
	
	if(materialName == null)  
		this.materialName = "";
}

//------------------------------------------------------------------------------
// Face Object
//------------------------------------------------------------------------------
var Face = function() {
	this.vIndices = new Array(0);
	this.nIndices = new Array(0);
	this.tIndices = new Array(0);
}

//------------------------------------------------------------------------------
// DrawInfo Object
//------------------------------------------------------------------------------
var DrawingInfo = function(vertices, colors, normals, textCoord, indices, materials, tangent, binormal, BBox, mtlLib) {
  this.vertices 		= vertices;
  this.colors 			= colors;
  this.normals 			= normals;
  this.indices 			= indices;
  this.textCoords 		= textCoord;
  this.tangentTSpace 	= tangent;
  this.binormalTSpace 	= binormal;
  this.materials		= materials;
  this.BBox 			= BBox;
  this.numObjects		= vertices.length;
  this.mtl				= mtlLib;

}

//------------------------------------------------------------------------------
// Constructor
var StringParser = function(str) {
  this.str;   // Store the string specified by the argument
  this.index; // Position in the string to be processed
  this.init(str);
}
    
// ********************************************************
// ********************************************************
// Initialize StringParser object
StringParser.prototype.init = function(str){
  this.str = str;
  this.index = 0;
}
    
// ********************************************************
// ********************************************************
// Skip delimiters
StringParser.prototype.skipDelimiters = function()  {
  for(var i = this.index, len = this.str.length; i < len; i++){
    var c = this.str.charAt(i);
    // Skip TAB, Space, '(', ')
    if (c == '\t'|| c == ' ' || c == '(' || c == ')' || c == '"') continue;
    break;
  }
  this.index = i;
}
    
// ********************************************************
// ********************************************************
// Skip to the next word
StringParser.prototype.skipToNextWord = function() {
  this.skipDelimiters();
  var n = getWordLength(this.str, this.index);
  this.index += (n + 1);
}
    
// ********************************************************
// ********************************************************
// Get word
StringParser.prototype.getWord = function() {
	this.skipDelimiters();
	
	var n = getWordLength(this.str, this.index);

	if (n == 0) 
		return null;
	
	var word = this.str.substr(this.index, n);
	this.index += (n + 1);

	return word;
}
    
// ********************************************************
// ********************************************************
// Get integer
StringParser.prototype.getInt = function() {
	var word = this.getWord();
	
	if (word == null) 
		return 0;
	
  return parseInt(word);
}
    
// ********************************************************
// ********************************************************
// Get floating number
StringParser.prototype.getFloat = function() {
	var word = this.getWord();
	
	return parseFloat(word);
}

//------------------------------------------------------------------------------
// OBJParser
//------------------------------------------------------------------------------

// OBJDoc object
// Constructor
var OBJDoc = function(fileName) {
	this.fileName 		= fileName;
	this.mtlLib			= new Array(0);	// Initialize the property for MTL
	this.objects 		= new Array(0);	// Initialize the property for Object
	this.vertices 		= new Array(0);	// Initialize the property for Vertex
	this.normals 		= new Array(0);	// Initialize the property for Normal
	this.textureCoords 	= new Array(0);	// Initialize the property for Texture Coordenates
	this.numIndGrps		= 0;
}

var mtl;
    
// ********************************************************
// ********************************************************
// Parsing the OBJ file
OBJDoc.prototype.parse = function(fileString, scale, reverse) {

var index = 0;    // Initialize index of line
	
var currentObject 			= null;
var currentGroup 			= null;
var currentMaterialName 	= "";
var currentGroupName 		= "";
var currentObjName 			= "";
var numDefaultGrp			= 0;

// Parse line by line
var line;         // A string in the line to be parsed
var sp = new StringParser();  // Create StringParser

var lines = fileString.split('\n');  // Break up into lines and store them as array

	lines.push(null); // Append null

	while ((line = lines[index++]) != null) {
		sp.init(line);                  // init StringParser
		var command = sp.getWord();     // Get command
		if(command == null)	 continue;  // check null command
		
		switch(command) {
			case '#'		:	break;  // Skip comments
			case 'mtllib'	:   // Read Material chunk
								var path = this.parseMtllib(sp, this.fileName);
								var request = new XMLHttpRequest();
								mtl = new MTLDoc();   // Create MTL instance
								this.mtlLib.push(mtl);
								request.onreadystatechange = function() {
								if (request.readyState == 4) {
									if (request.status != 404) {
										onReadMTLFile(request.responseText);
										mtl.complete = true;
										}
									}
								}
								request.open('GET', path, true);  // Create a request to acquire the file
								request.send();                   // Send the request
								break; // Go to the next line
								
			case 'o'		:   // Read Object name
								var object = this.parseObjectName(sp);
								this.objects.push(object);
								currentObject = object;
								break; // Go to the next line
			case 'v'		:   // Read vertex
								var vertex = this.parseVertex(sp, scale);
								this.vertices.push(vertex); 
								break; // Go to the next line
			case 'vn'		:   // Read normal
								var normal = this.parseNormal(sp);
								this.normals.push(normal); 
								break; // Go to the next line
			case 'vt'		:   // Read texture coords
								var cText = this.parseTexture(sp);
								this.textureCoords.push(cText); 
								break; // Go to the next line
			case 'usemtl'	: // Read Material name
								materialName = this.parseUsemtl(sp);
								if (currentGroup != null)
									currentGroup.materialName = materialName;
								currentMaterialName = materialName;
								break; // Go to the next line
			case 'f'		: // Read face
								if (currentGroup == null) {
									console.log("face without group !!");
									break;
									}
								var faces = this.parseFace(sp, this.vertices, reverse);
								for (i = 0 ; i < faces.length ; i++) 
									currentGroup.addFace(faces[i]);
								break; // Go to the next line
			case 'g'		:   // Read group
								if (currentObject == null) {
									currentObject = new OBJObject("default");
									this.objects.push(currentObject);
									}								
								var groupName = this.parseGroupName(sp);
								if (groupName == null)
									groupName = "default"+numDefaultGrp++;
								
								currentGroup = currentObject.findGroup(groupName);
								
								if (currentGroup == null) 
									currentGroup = new Group(groupName);
								if (currentMaterialName)
									currentGroup.materialName = currentMaterialName;
								
								currentObject.groups.push(currentGroup);
								break; // Go to the next line
			case 'group'		:   // Read group
								if (currentObject == null) {
									currentObject = new OBJObject("default");
									this.objects.push(currentObject);
									}								
								var groupName = this.parseGroupName(sp);

								if (groupName == null) {
									console.log("ERROR: group not found");
									break;
									}
								currentGroup = currentObject.findGroup(groupName);
								if (currentGroup == null) {
									console.log("ERROR: groupOBJ not found");
									break;
									}
								if (currentMaterialName)
									currentGroup.materialName = currentMaterialName;
								break; // Go to the next line
			}
		}

	for (o=0 ; o < this.objects.length ; o++) 
		for (g=0 ; g < this.objects[o].groups.length ; g++) {
			if (this.objects[o].groups[g].numIndices > 65536) 
				console.log("WARNING: GROUP MaxIndex (" + this.objects[o].groups[g].numIndices + ") > Uint16Array max !!");
			this.numIndGrps += this.objects[o].groups[g].numIndices;
			}

	return true;
}
    
// ********************************************************
// ********************************************************
OBJDoc.prototype.parseMtllib = function(sp, fileName) {
// Get directory path
var i = fileName.lastIndexOf("/");
var dirPath = "";

	if(i > 0) 
		dirPath = fileName.substr(0, i+1);
	
	return dirPath + sp.getWord();   // Get path
}
  
// ********************************************************
// ********************************************************
OBJDoc.prototype.parseObjectName = function(sp) {
var name = sp.getWord();

	return (new OBJObject(name));
}
     
// ********************************************************
// ********************************************************
OBJDoc.prototype.parseGroupName = function(sp) {
	return sp.getWord();
}
    
// ********************************************************
// ********************************************************
OBJDoc.prototype.parseVertex = function(sp, scale) {
var x = sp.getFloat() * scale;
var y = sp.getFloat() * scale;
var z = sp.getFloat() * scale;

	return (new Vertex(x, y, z));
}
    
// ********************************************************
// ********************************************************
OBJDoc.prototype.parseNormal = function(sp) {
var x = sp.getFloat();
var y = sp.getFloat();
var z = sp.getFloat();

	return (new Normal(x, y, z));
}
    
// ********************************************************
// ********************************************************
OBJDoc.prototype.parseTexture = function(sp) {
var u = sp.getFloat();
var v = sp.getFloat();

	return (new TextCoord(u, v));
}
    
// ********************************************************
// ********************************************************
OBJDoc.prototype.parseUsemtl = function(sp) {
	return sp.getWord();
}
    
// ********************************************************
// ********************************************************
OBJDoc.prototype.parseFace = function(sp, vertices, reverse) {  
var faces = new Array();

var face = new Face();

var endWord = false;
// get indices

	for(;;){
		var word = sp.getWord();
		
		if ((word == null) || (word.charCodeAt(0) == 13))
			break;
		
		var subWords = word.split("/");
		
		if (subWords.length >= 1) {
			var vi = parseInt(subWords[0]) - 1;
			face.vIndices.push(vi);
			}
			
		if ( (subWords.length >= 2) && (subWords[1] != '') ){
			var ti = parseInt(subWords[1]) - 1;
			if (ti != null) {
				face.tIndices.push(ti);
				}
			}
		else
			face.tIndices.push(-1);
		
		if (subWords.length >= 3) {
			var ni = parseInt(subWords[2]) - 1;
			face.nIndices.push(ni);
			}
		else
			face.nIndices.push(-1);
	}

var n = face.vIndices.length - 2;

	for(var i = 0 ; i < n ; i++) {
		var f = new Face();
		f.vIndices.push(face.vIndices[0]);
		f.vIndices.push(face.vIndices[i+1]);
		f.vIndices.push(face.vIndices[i+2]);
		
		f.nIndices.push(face.nIndices[0]);
		f.nIndices.push(face.nIndices[i+1]);
		f.nIndices.push(face.nIndices[i+2]);
		
		f.tIndices.push(face.tIndices[0]);
		f.tIndices.push(face.tIndices[i+1]);
		f.tIndices.push(face.tIndices[i+2]);
		
		var v0 =	[	vertices[face.vIndices[0]].x,
						vertices[face.vIndices[0]].y,
						vertices[face.vIndices[0]].z
					];
		var v1 = 	[	vertices[face.vIndices[i+1]].x,
						vertices[face.vIndices[i+1]].y,
						vertices[face.vIndices[i+1]].z
					];
		var v2 = 	[	vertices[face.vIndices[i+2]].x,
						vertices[face.vIndices[i+2]].y,
						vertices[face.vIndices[i+2]].z
					];
		
		var normal = calcNormal(v0, v1, v2);
		
		if(normal == null)          
			normal = [0.0, 1.0, 0.0];
		
		if(reverse) {
			normal[0] = -normal[0];
			normal[1] = -normal[1];
			normal[2] = -normal[2];
			}
		f.normal = new Normal(normal[0], normal[1], normal[2]);
		f.numIndices = f.vIndices.length;
		faces.push(f);
		}
	return faces;
}
    
// ********************************************************
// ********************************************************
// Check Materials
OBJDoc.prototype.isMTLComplete = function() {
	
	if (this.mtlLib.length == 0) 
		return true;
	
	for(var i = 0; i < this.mtlLib.length; i++)
		if(!this.mtlLib[i].complete) 
			return false;

	return true;
}
    
// ********************************************************
// ********************************************************
// Find object by name
OBJDoc.prototype.findObject = function(name) {
var strName = name.trim();
	for(var i = 0; i < this.objects.length; i++) {
		if (this.objects[i].name != null) {
			var strMatName = this.objects[i].name.trim();
			if(strMatName == strName) {
				return(this.objects[i])
				}
			}
		}
	return(null);
}
    
// ********************************************************
// ********************************************************
// Find color by material name
OBJDoc.prototype.findMaterial = function(name) {

	if (!this.isMTLComplete()) 
		return;
	
	if (name == null) 
		return null;
		
	var strName = name.trim();
	
	for(var i = 0; i < this.mtlLib.length; i++) {
		for(var j = 0; j < this.mtlLib[i].materials.length; j++) {
			var strMatName = this.mtlLib[i].materials[j].name.trim();
			if(strMatName == strName) {
				return(this.mtlLib[i].materials[j])
				}
			}
		}
	return new Material("default");
}
    
// ********************************************************
// ********************************************************
// Find color by material name
OBJDoc.prototype.findMaterialInd = function(name) {

	if (!this.isMTLComplete()) 
		return;
	
	if (name == null) 
		return null;
		
	var strName = name.trim();
	
	for(var i = 0; i < this.mtlLib.length; i++) {
		for(var j = 0; j < this.mtlLib[i].materials.length; j++) {
			var strMatName = this.mtlLib[i].materials[j].name.trim();
			if(strMatName == strName) {
				return(j)
				}
			}
		}
	return (-1);
}

// ********************************************************
// ********************************************************
OBJDoc.prototype.updateBBox = function(v, BB) {
		
		if (v.x > BB.Max.x)
			BB.Max.x = v.x;
		else
			if (v.x < BB.Min.x)
				BB.Min.x = v.x;
			
		if (v.y > BB.Max.y)
			BB.Max.y = v.y;
		else
			if (v.y < BB.Min.y)
				BB.Min.y = v.y;
			
		if (v.z > BB.Max.z)
			BB.Max.z = v.z;
		else
			if (v.z < BB.Min.z)
				BB.Min.z = v.z;
}

// ********************************************************
// ********************************************************
OBJDoc.prototype.genTangentSpace = function(i, normals, vTangent, vBinormal) {
	
var w = new Vector3(0.0, 0.0, 0.0);
var u = new Vector3(0.0, 0.0, 0.0);
var v = new Vector3(0.0, 0.0, 0.0);
var b = new Vector3(1.0, 1.0, 1.0);

	b.normalize();
	
	w.elements[0] 	= normals[i+0];
	w.elements[1] 	= normals[i+1];
	w.elements[2] 	= normals[i+2];
	
	w.normalize();

//	u = w cross b
	u.elements[0] 	= w.elements[1]* b.elements[2] - b.elements[1]* w.elements[2];
	u.elements[1] 	= w.elements[2]* b.elements[0] - b.elements[2]* w.elements[0];
	u.elements[2] 	= w.elements[0]* b.elements[1] - b.elements[0]* w.elements[1];

	u.normalize();

//	v = u cross w
	v.elements[0] 	= u.elements[1]* w.elements[2] - w.elements[1]* u.elements[2];
	v.elements[1] 	= u.elements[2]* w.elements[0] - w.elements[2]* u.elements[0];
	v.elements[2] 	= u.elements[0]* w.elements[1] - w.elements[0]* u.elements[1];
	v.normalize();

	vTangent[i * 3 + 0] 	= u.elements[0];
	vTangent[i * 3 + 1] 	= u.elements[1];
	vTangent[i * 3 + 2] 	= u.elements[2];
	
	vBinormal[i * 3 + 0] 	= v.elements[0];
	vBinormal[i * 3 + 1]	= v.elements[1];
	vBinormal[i * 3 + 2] 	= v.elements[2];
	
}

// ********************************************************
// ********************************************************
OBJDoc.prototype.genNormalPerVertex = function(normalPerVertex, vValency) {

	for(var o = 0; o < this.objects.length; o++) {
		var obj = this.objects[o];
	
		for(var g = 0; g < obj.groups.length; g++) {			
			for(var f = 0; f < obj.groups[g].faces.length; f++) {			
				var face = obj.groups[g].faces[f];
				var n = face.normal;
				for(var i = 0; i < face.vIndices.length; i++) {
					var vIdx = face.vIndices[i];
					normalPerVertex[vIdx * 3 + 0] += n.x;
					normalPerVertex[vIdx * 3 + 1] += n.y;
					normalPerVertex[vIdx * 3 + 2] += n.z;
					vValency[vIdx]++;
					}
				}
			}
		}
	for (i = 0 ; i < vValency.length ; i++) {
		normalPerVertex[i * 3 + 0] /= vValency[i];
		normalPerVertex[i * 3 + 1] /= vValency[i];
		normalPerVertex[i * 3 + 2] /= vValency[i];
		}
}

    
// ********************************************************
// ********************************************************
//------------------------------------------------------------------------------
// Retrieve the information for drawing 3D model
OBJDoc.prototype.getDrawingInfo = function() {
	
var aVertices	= new Array();
var aNormal		= new Array();
var aColor		= new Array();
var aTextures	= new Array();
var aIndices	= new Array();
var aMaterials	= new Array();
var aTangent	= new Array();
var aBinormal	= new Array();
var hasNormals;



// Build Bounding Box

var BB = new BBox(	this.vertices[0].x, this.vertices[0].y, this.vertices[0].z,
					this.vertices[0].x, this.vertices[0].y, this.vertices[0].z,
					0.0, 0.0, 0.0);

var vTangent 	= new Float32Array(3);;
var vBinormal 	= new Float32Array(3);;

var normalPerVertex;
var vValency;
	
	if (this.normals.length == 0) {
		normalPerVertex	= new Float32Array(this.vertices.length * 3);
		vValency		= new Array(this.vertices.length);
		hasNormals 		= false;
		}
	else 
		hasNormals = true;
	
	for(var i = 0; i < this.vertices.length; i++) {
		
		var v = this.vertices[i];
		
		this.updateBBox(v, BB);
		
		if (!hasNormals) {
			normalPerVertex[i * 3 + 0] 	= 
			normalPerVertex[i * 3 + 1] 	=
			normalPerVertex[i * 3 + 2] 	= 0.0;
			vValency[i] 				= 0;
			}
		}
		
	BB.Center.x = (BB.Min.x + BB.Max.x) / 2.0;
	BB.Center.y = (BB.Min.y + BB.Max.y) / 2.0;
	BB.Center.z = (BB.Min.z + BB.Max.z) / 2.0;
	
	if (!hasNormals) 	
		this.genNormalPerVertex(normalPerVertex, vValency);
		
	for (o=0 ; o < this.objects.length ; o++) {
		for(var g = 0; g < this.objects[o].groups.length; g++) {
		
			var vertices	= new Float32Array(this.objects[o].groups[g].numIndices * 3);
			var colors		= new Float32Array(this.objects[o].groups[g].numIndices * 4);
			var normals		= new Float32Array(this.objects[o].groups[g].numIndices * 3);
			var textCoord	= new Float32Array(this.objects[o].groups[g].numIndices * 2);
			var indices		= new Uint16Array( this.objects[o].groups[g].numIndices);
			var tangent		= new Float32Array(this.objects[o].groups[g].numIndices * 3);
			var binormal	= new Float32Array(this.objects[o].groups[g].numIndices * 3);
			
			var newIndex = 0;
	
			var grp = this.objects[o].groups[g];
			var matGrp = this.findMaterialInd(grp.materialName);
			
			if (matGrp == -1) 			
				console.log("ERROR:Group material not found => ." + grp.materialName + ".");
			else 
				aMaterials.push(matGrp);
				
	
			for(var f = 0; f < grp.faces.length; f++) {			
				var face = grp.faces[f];
				var n;
				var tc;
	
				for(var i = 0; i < face.vIndices.length; i++) {				
					indices[newIndex] = newIndex;
					
					var vIdx = face.vIndices[i];
					
					if ( (vIdx < 0) || (vIdx > this.vertices.length) )
						console.log("WARNING: vIdx = " + vIdx);
					
					var v = this.vertices[vIdx];
					vertices[newIndex * 3 + 0] = v.x;
					vertices[newIndex * 3 + 1] = v.y;
					vertices[newIndex * 3 + 2] = v.z;

					if (matGrp != -1) {			
						colors[newIndex * 4 + 0] = this.mtlLib[0].materials[matGrp].Kd.r;
						colors[newIndex * 4 + 1] = this.mtlLib[0].materials[matGrp].Kd.g;
						colors[newIndex * 4 + 2] = this.mtlLib[0].materials[matGrp].Kd.b;
						colors[newIndex * 4 + 3] = this.mtlLib[0].materials[matGrp].Kd.a;
						}
					else {
						colors[newIndex * 4 + 0] = 
						colors[newIndex * 4 + 1] = 
						colors[newIndex * 4 + 2] = 0.8
						colors[newIndex * 4 + 3] = 1.0;
						}
						
					var nIdx = face.nIndices[i];			
					if ( (nIdx != -1) && ( this.normals[nIdx] != null) ) {
						n = this.normals[nIdx];
						normals[newIndex * 3 + 0] = n.x;
						normals[newIndex * 3 + 1] = n.y;
						normals[newIndex * 3 + 2] = n.z;
						}
					else {
						normals[newIndex * 3 + 0] = normalPerVertex[vIdx * 3 + 0];
						normals[newIndex * 3 + 1] = normalPerVertex[vIdx * 3 + 1];
						normals[newIndex * 3 + 2] = normalPerVertex[vIdx * 3 + 2];
						}
					
					var tIdx = face.tIndices[i];			
					if (tIdx != -1) 
						tc = this.textureCoords[tIdx];
					else
						tc = new TextCoord 	(	(v.x - BB.Min.x) / (BB.Max.x - BB.Min.x),
												(v.y - BB.Min.y) / (BB.Max.y - BB.Min.y)
											);
					textCoord[newIndex * 2 + 0] = tc.u;
					textCoord[newIndex * 2 + 1] = (1.0 - tc.v);
										
					this.genTangentSpace(newIndex, normals, tangent, binormal);
/*
					tangent[newIndex * 3 + 0] = vTangent[vIdx * 3 + 0];
					tangent[newIndex * 3 + 1] = vTangent[vIdx * 3 + 1];
					tangent[newIndex * 3 + 2] = vTangent[vIdx * 3 + 2];
					
					binormal[newIndex * 3 + 0] = vBinormal[vIdx * 3 + 0];
					binormal[newIndex * 3 + 1] = vBinormal[vIdx * 3 + 1];
					binormal[newIndex * 3 + 2] = vBinormal[vIdx * 3 + 2];
*/	
					newIndex++;
					}
				}
			aVertices.push(vertices);
			aColor.push(colors);
			aNormal.push(normals);
			aTextures.push(textCoord);
			aIndices.push(indices);
			aTangent.push(tangent);
			aBinormal.push(binormal);
			}
		}
	
	return new DrawingInfo(aVertices, aColor, aNormal, aTextures, aIndices, aMaterials, aTangent, aBinormal, BB, this.mtlLib);
}
    
// ********************************************************
// ********************************************************
// Get the length of word
function getWordLength(str, start) {
  var n = 0;
  for(var i = start, len = str.length; i < len; i++){
    var c = str.charAt(i);
    if (c == '\t'|| c == ' ' || c == '(' || c == ')' || c == '"') 
	break;
  }
  return i - start;
}

//------------------------------------------------------------------------------
// Common function
//------------------------------------------------------------------------------
function calcNormal(p0, p1, p2) {
  // v0: a vector from p1 to p0, v1; a vector from p1 to p2
  var v0 = new Float32Array(3);
  var v1 = new Float32Array(3);
  for (var i = 0; i < 3; i++){
    v0[i] = p0[i] - p1[i];
    v1[i] = p2[i] - p1[i];
  }

  // The cross product of v0 and v1
  var c = new Float32Array(3);
  c[0] = v0[1] * v1[2] - v0[2] * v1[1];
  c[1] = v0[2] * v1[0] - v0[0] * v1[2];
  c[2] = v0[0] * v1[1] - v0[1] * v1[0];

  // Normalize the result
  var v = new Vector3(c);
  v.normalize();
  return v.elements;
}
