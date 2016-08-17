# AETHER
Drone Controller Simulation

YOU WILL NEED:


    - A web server (something like apache, tomcat, or IIS)
    - A WebGL compatible browser such as Chrome or Firefox
    - Java (JRE 1.7 or higher)
    
TO RUN THE PROJECT:


    1. Place the Aether folder inside your web server
        (In apache tomcat, you can place this folder in the webapps directory)
        
    2. Start the webserver
    
    3. Start the Java Server
        a. The Java webserver is in the Aether/javaServer/ folder
        b. Either double click on server.jar or use the command line to start the server.jar
            (To run using the command line, use command: 'java -jar server.jar')
            
    4. Open the the dmsController from a browser
        If running apache and using port 8080, the url would be something like: 
        http://localhost:8080/Aether/webClients/dmsController/index.html
        
    5. Open the dmsDrone from another browser window
        If running apache and using port 8080, the url would be something like: 
        http://localhost:8080/Aether/webClients/dmsDrone/index.html
   
THINGS TO NOTE:


    - the dmsController and dmsDrone MUST be run on a webserver
    - there can only be one dmsController active at any given time,
      opening a new dmsController elsewhere will override the active dmsController
    - the dmsController and server uses ports 8000 & 8001, so these ports must be open
      if you're wanting to access the dmsDrone from another machine.
    - if you open the dmsDrone in the same browser window as your dmsController,
      the dmsDrone will experience lag due to the fact that scripts running
      on the dmsController will be sent to the background. You can avoid this by
      opening the dmsDrone in another browser window.
      
TROUBLESHOOTING


    - Try turning off your firewall temporarily
    - Try restarting your browser
    - If console shows "socket status:  closed", it may mean your java server isn't running
    
-----------------------
OTHER INFO:


To Build the Java Server:


    -compile the Server.java in Aether/javaServer/code/ by linking to the two libraries
    -execute the Server by also linking the two libraries
    
    in linux, the commands will be something like:
    
    javac Server.java -cp ../libs/Java-WebSocket-1.3.0.jar:../libs/json-simple-1.1.1.jar
    java Server -cp ../libs/Java-WebSocket-1.3.0.jar:../libs/json-simple-1.1.1.jar
    




Libraries:
Java-WebSockets: https://github.com/TooTallNate/Java-WebSocket
        -a java library for websockets


JSON.simple: https://code.google.com/p/json-simple/
        -a java library for JSON
        
three.js: http://threejs.org/
        -a js library for WebGL
