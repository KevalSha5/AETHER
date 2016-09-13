window.onload = init;

var droneList = [];
var representation;
var isRunning = false;
var locations = {
  powerLine: 94,
  trash: {
    x: 372.5,
    y: 132.5
  }
};
var ui = {};
var socket;
var socketIsConnected = false;

var droneCollection = {};

function init () {
  connectToServer();
  representation = new Representation('cvs', 500, 500);
  initUI();
  startTimer();
}

function initUI () {
  ui.droneList = document.getElementById('droneList');
  ui.droneAction = document.getElementById('droneAction');
  ui.setAction = document.getElementById('setAction');
  ui.droneTable = document.getElementById('infoTable');
  ui.droneState = {};
  ui.droneCoords = {};

  ui.setAction.addEventListener('click', function (e) {
    e.preventDefault();
    var droneId = ui.droneList.value;
    var action = ui.droneAction.value;
    //update UI
    droneCollection[droneId].setState(action);
    ui.droneState[droneId].innerHTML = action;
  }, false);
}

//--legacy
function startTimer () {
  isRunning = true;
  mainLoop();
}

function mainLoop () {
  //update drones
  for (var drone in droneCollection) {
    droneCollection[drone].update();
    var x = Math.floor(droneCollection[drone].position.x);
    var y = Math.floor(droneCollection[drone].position.y);
    //render coordinates on ui
    ui.droneCoords[drone].innerHTML = (x * 2) + ', ' + (y * 2);
  }
  //create packet and send to server
  sendAllInfo();
  //render drones on map
  representation.renderDrones(droneCollection);
  if (isRunning) {
    setTimeout(mainLoop, 33);
  }
}

function stopTimer () {
  isRunning = false;
}

function sendAllInfo () {
  var packet = {
    type: 'update',
    drones: []
  };
  var dronesInCollection = false;
  for (var drone in droneCollection) {
    dronesInCollection = true;
    packet.drones.push({
      id: drone,
      state: droneCollection[drone].state,
      position: {
        x: droneCollection[drone].position.x * 2,
        y: droneCollection[drone].position.y * 2
      }
    });
  }
  if (socketIsConnected && dronesInCollection) {
    socket.send(JSON.stringify(packet));
  }
}

function updateUiDroneList () {
  //just tear down ui and rebuild on each add and delete
  //not efficient but easier for now
  rebuildDroneTable();
  rebuildDroneCombobox();
}

function rebuildDroneCombobox () {
  ui.droneList.innerHTML = '';

  for (var drone in droneCollection) {
    ui.droneList.add(
      new Option(drone, drone)
    );
  }

}

function rebuildDroneTable () {
  ui.droneTable.innerHTML = '';
  ui.droneState = {};
  ui.droneCoords = {};

  var row = document.createElement('tr');
  var key = document.createElement('th');
  var value = document.createElement('th');
  var coords = document.createElement('th');
  key.appendChild(document.createTextNode('DroneID'));
  value.appendChild(document.createTextNode('DroneState'));
  coords.appendChild(document.createTextNode('Position'));
  row.appendChild(key);
  row.appendChild(value);
  row.appendChild(coords);
  ui.droneTable.appendChild(row);

  for (var drone in droneCollection) {
    row = document.createElement('tr');
    key = document.createElement('td');
    value = document.createElement('td');
    coords = document.createElement('td');
    key.appendChild(document.createTextNode(drone));
    value.appendChild(document.createTextNode('aDroneState'));
    coords.appendChild(document.createTextNode('x, y'));
    row.appendChild(key);
    row.appendChild(value);
    row.appendChild(coords);
    ui.droneTable.appendChild(row);
    ui.droneState[drone] = value;
    ui.droneCoords[drone] = coords;
  }
}

function processPacketIn (msg) {
  switch (msg.type) {
    case 'newDrone':
      //console.log('new drone: ' + msg.droneId);
      //create drone here....
      //createDrone2(msg.droneId);
      droneCollection[msg.droneId] = new Drone(
        msg.droneId,
        Math.floor(500 * Math.random()),
        Math.floor(500 * Math.random()),
        'browse'
      );
      //console.log('droneCollection: ', droneCollection);
      updateUiDroneList();
      break;
    case 'droneLost':
      //console.log('drone lost: ' + msg.droneId);
      delete droneCollection[msg.droneId];
      //console.log('droneCollection', droneCollection);
      updateUiDroneList();
      break;
    default:
      console.log('unkown packet type', msg);
  }
}

function connectToServer() {
  try {
    var socketString = 'ws://' + location.hostname + ':8000';
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