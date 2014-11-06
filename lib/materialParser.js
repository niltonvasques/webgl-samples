    
// ********************************************************
// ********************************************************
// Analyze the material file
function onReadMTLFile(fileString) {
	
	var curentMaterial;
	
	var lines = fileString.split('\n');  // Break up into lines and store them as array
	lines.push(null);           // Append null
	var index = 0;              // Initialize index of line
	
	// Parse line by line
	var line;      // A string in the line to be parsed
	var curentMaterialName = ""; // Material name
	var sp = new StringParser();  // Create StringParser
	
	while ((line = lines[index++]) != null) {
		sp.init(line);                  // init StringParser
		var command = sp.getWord();     // Get command
		if (command == null)	 
			continue;  // check null command
		
		switch(command) {
			case '#'		:	break;    // Skip comments
				
			case 'newmtl'	: 	curentMaterialName 	= mtl.parseNewmtl(sp); // Get name
								currentMaterial 	= new Material(curentMaterialName);
								mtl.materials.push(currentMaterial);
								break; 
								
			case 'Kd'		:   if (curentMaterialName == "") {
									break;
									} 
								var kd = mtl.parseRGBA(sp);
								currentMaterial.setKd(kd);
								break; 
								
			case 'Ks'		:   if (curentMaterialName == "") {
									break;
									} 
								var ks = mtl.parseRGBA(sp);
								currentMaterial.setKs(ks);
								break; 
								
			case 'Ka'		:   if (curentMaterialName == "") {
									break;
									} 
								var ka = mtl.parseRGBA(sp);
								currentMaterial.setKa(ka);
								break; 
								
			case 'Ns'		:   if (curentMaterialName == "") {
									break;
									} 
								var ns = sp.getFloat();
								currentMaterial.setNs(ns);
								break; 
								
			case 'map_Kd'	:   if (curentMaterialName == "") {
									break;
									} // Go to the next line because of Error
								var mk = sp.getWord();
								currentMaterial.setMapKd(mk);
								break; // Go to the next line
			}
		}
	mtl.complete = true;
	return mtl;
}
    
//------------------------------------------------------------------------------
// MTLDoc Object
//------------------------------------------------------------------------------
var MTLDoc = function() {
  this.complete = false; // MTL is configured correctly
  this.materials = new Array(0);
}
    
// ********************************************************
// ********************************************************
MTLDoc.prototype.parseNewmtl = function(sp) {
  return sp.getWord();         // Get name
}
    
// ********************************************************
// ********************************************************
MTLDoc.prototype.parseRGBA = function(sp, name) {
  var r = sp.getFloat();
  var g = sp.getFloat();
  var b = sp.getFloat();
  var a = 1.0;
  return (new Color(r, g, b, a));
}

//------------------------------------------------------------------------------
// Material Object
//------------------------------------------------------------------------------
var Material = function(name) {
  this.name 	= name;
  this.Ka 		= new Color(0.2, 0.2, 0.2, 0.0);
  this.Kd 		= new Color(1.0, 1.0, 1.0, 0.0);
  this.Ks 		= new Color(0.0, 0.0, 0.0, 0.0);
  this.Ns 		= 0.0;
  this.mapKd 	= "";
}
    
// ********************************************************
// ********************************************************
Material.prototype.setKa = function(ka) {
  this.Ka.r = ka.r;         
  this.Ka.g = ka.g;         
  this.Ka.b = ka.b;         
  this.Ka.a = ka.a;         
}
    
// ********************************************************
// ********************************************************
Material.prototype.setKd = function(kd) {
  this.Kd.r = kd.r;         
  this.Kd.g = kd.g;         
  this.Kd.b = kd.b;         
  this.Kd.a = kd.a;         
}
    
// ********************************************************
// ********************************************************
Material.prototype.setKs = function(ks) {
  this.Ks.r = ks.r;         
  this.Ks.g = ks.g;         
  this.Ks.b = ks.b;         
  this.Ks.a = ks.a;         
}
    
// ********************************************************
// ********************************************************
Material.prototype.setNs = function(ns) {
  this.Ns = ns;         
}
    
// ********************************************************
// ********************************************************
Material.prototype.setMapKd = function(m) {
  this.mapKd = m;         
}

