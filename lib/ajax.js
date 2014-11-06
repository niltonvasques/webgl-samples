// ********************************************************
// ********************************************************
// Read a file
function ajax( url, callbackdone ) {
	var request = new XMLHttpRequest();
	
	request.onreadystatechange = function() {
		if (request.readyState === 4 && request.status !== 404) 
			if( callbackdone ) {
				callbackdone( request.responseText );
			}
		}
	request.open('GET', url, true); // Create a request to acquire the file
	request.send();                      // Send the request
}

