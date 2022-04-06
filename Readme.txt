This API for PTS-2 controller in Javascript

In pts.js file in function sendRequest you need to set correct IP-address of PTS-2 controller. 
Authorization in PTS-2 controller should be set to Basic, by defaults the request is sent using HTTP (not HTTPS), so the PTS-2 controller should have following settings on its configuration DIP-switch:
 - DIP-1: ON (HTTP)
 - DIP-2: ON (Basic authentication)
 - DIP-3: OFF (do not format SD flash disk)
 - DIP-4: OFF (do not erase configuration)

This web-pages should be run from web-server due to CORS policy (it will not work in case if you simply open the pages in web browser). Solution was tested on Mozilla Firefox web browser.