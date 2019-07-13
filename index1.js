//Load HTTP module
var http = require("http");
var magic;
var fs = require('fs');
var path = require('path');

//Create HTTP server and listen on port 8000 for requests
http.createServer(function (request, response) {

   // Set the response HTTP header with HTTP status and Content type
   response.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
   response.end(`<div id="selectholder" name="selectorHolder" style=" width: 100%; position: fixed; left: 12px; top: 16px; max-width: 340px; z-index:11;"></div>
		<fc-focused-dashboard id="dash"	style="position: absolute; top: 0; right: 0; left: 0; bottom: -10px; border: 8px silver solid;" class="layout horizontal block">
				<fc-drag-toolbar id="ddrtoolbar" data-btn="dragtarget" draggable resizable class="layout horizontal center flex block">
				</fc-drag-toolbar>
				<div class="container lamemenubutton"  id="lameMenuButton" data-btn="fromTop">
				  		<div data-btn="fromTop" class="bar1"></div>
				  		<div data-btn="fromTop" class="bar2"></div>
				  		<div data-btn="fromTop" class="bar3"></div>
				</div>
				<section style="" class="rowoneicon">&#x2699; </section>	
				<fc-drawer id="leftdrawer" class="container vertical layout block flex leftdrawer" style="position: absolute; overflow-x: hidden;">
					<fc-header class="top leftdrawer layout vertical flex left-justified">
						<fc-row class="layout horizontal flex left-justified leftdrawer" style="margin: 12px 0;  z-index: inherit;">
							<a>
							<img style="top: 40px; left: 4px; box-shadow: 0 0 0 0 white; max-height: 80px;  z-index:1; width: 240px; display: block; position: absolute;" class="layout block vertical leftdrawer" src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/301628/FC_frontpage_logo.png">
							</a>
						</fc-row>
					</fc-header>
				</fc-drawer>
		     	<div id="columnholder" class="vertical layout block verticalcolumn">
					<fc-header class="top layout horizontal flex center center-justified fc-header" id="header">	
						<fc-row class="layout horizontal flex center" style=" width: 57%; margin: 12px;margin-left: 120px; max-width: 448px;">
				 			<fc-flexbox class="vertical layout flex-2 center-justified">
					 			<a style="position: absolute; margin 22px;">
						 			<img data-btn="getCurrentFromFirepad" class="focusedball" height="40px" width="40px" src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/301628/ball.png">
					 			</a>
							 </fc-flexbox>
						</fc-row>
					</fc-header>
					<fc-container id="dashboard" class="main">
				  	</fc-container>
				 	<fc-header class="bottom"  id="footer">
					</fc-header>
				</div>
				<fc-drawer id="rightdrawer" class="vertical layout block rightDrawer">
				</fc-drawer>
		</fc-focused-dashboard>
		<fc-console-menu-1 class="flex dashboardHelperMenu">
			</fc-console-menu-1>
		<fc-console-menu-1>
		</fc-console-menu-1> 
		<div id="dropdownMenuGeneral1" style="position: fixed; max-height: 529px; width: 22vw; min-height: 380px; height: 100%; border: 3px solid silver; z-index: 6; overflow-y:scroll;display: flex; flex-flow: column; align-self: stretch; align-content: center; justify-content: space-between; overflow-x:hidden; background: #efefef;" class="vertical layout flex self-stretch" data-prefix="xrq_" hidden>
		</div>
		<script src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/301628/passageTemplateStrings.js"></script>		
		<script src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/301628/helperLibrary.js"></script>	
		<script type="text/javascript" src="https://cdn.firebase.com/js/client/2.3.2/firebase.js"></script>
		<script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.10.0/codemirror.js"></script>
		<script src="https://cdn.firebase.com/libs/firepad/1.3.0/firepad.min.js"></script>
		<script src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/301628/dictionary_data.js"></script>
		<script id="finalscript" src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/301628/dashboard_copy.js">	
		</script>`);
}).listen(8080);

// Print URL for accessing server
console.log('Server running at http://127.0.0.1:8000/');