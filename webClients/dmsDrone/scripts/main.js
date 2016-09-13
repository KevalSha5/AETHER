window.onload = init;

var socketIsConnected = false;
var socket;
var ui = {};
var drone = {
  id: null,
  state: null,
  position: {
    x: null,
    y: null
  }
};

function init () {
  connectToServer();
  initUI();
  startWorld();
}

function initUI () {
  ui.droneId = document.getElementById('droneId');
  ui.droneState = document.getElementById('droneState');
  ui.droneCoords = document.getElementById('droneCoords');
}

function renderInfo () {
  ui.droneId.innerHTML = 'droneId: ' + drone.id;
  ui.droneState.innerHTML = 'droneState: ' + drone.state;
  ui.droneCoords.innerHTML = 'coordinates: ' + 
    drone.position.x + ', ' + drone.position.y;
}

function processPacketIn (msg) {
  switch (msg.type) {
    case 'setId':
      drone.id = msg.id;
      drone.state = msg.state;
      drone.position.x = msg.xPos;
      drone.position.y = msg.yPos;
      renderInfo();
      break;
    case 'update':
      //iterate through entire drone list
      //update this drone info
      for (var i = 0; i < msg.drones.length; i++) {
        if (msg.drones[i].id == drone.id) {
          //---this is data for THIS drone---//
          drone.state = msg.drones[i].state;
          drone.position.x = round(msg.drones[i].position.x, 2);
          drone.position.y = round(msg.drones[i].position.y, 2);
          renderInfo();
    
          updateDrone(drone.position.x, drone.position.y, drone.state); //send droneInfo to WebGL renderer
        }
        else {
          //---this is data about another drone---//
          //render in TRHEE.JS all drones that are not this drone
        }
      }
      break;
    default:
      console.log('unkown packet type');
      break;
  }
}

function round (value, numDecimals) {
  var multiplier = Math.pow(10, numDecimals);
  value = Math.floor(value * multiplier);
  return value / multiplier;
}

function connectToServer() {
  try {
    var socketString = 'ws://' + location.hostname + ':8001';
    socket = new WebSocket(socketString);
    socket.onopen = function(){
      console.log('socket status: ', 'connected');
      socketIsConnected = true;
    }
    socket.onclose = function(){
      console.log('socket status: ', 'closed');
    }
    socket.onmessage = function(msg){
      //console.log(msg.data);
      processPacketIn(JSON.parse(msg.data));
    }
  } catch(err) {
    console.log('websocket connection err: ', err);
  }
}
