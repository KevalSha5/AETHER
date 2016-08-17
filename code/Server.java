import java.net.InetSocketAddress;
import java.util.HashMap;
import java.util.concurrent.atomic.AtomicInteger;

import org.java_websocket.WebSocket;
import org.java_websocket.handshake.ClientHandshake;
import org.java_websocket.server.WebSocketServer;
import org.json.simple.JSONObject;


public class Server {
	
	private WebSocketServer dmsControlServer;
	private WebSocketServer dmsDroneServer;
	private AtomicInteger droneIdCnt = new AtomicInteger(0);
	private HashMap<WebSocket, Integer> droneConnections = new HashMap<WebSocket, Integer>();
	private WebSocket controllerConnection = null;
	
	public Server(){
		try {
			dmsControlServer = new ControlServer(8000);
			dmsControlServer.start();
			dmsDroneServer = new DroneServer(8001);
			dmsDroneServer.start();
		} catch (Exception e) {
			System.out.println("Could not start web socket server");
			e.printStackTrace();
			System.out.println("exiting now");
			System.exit(0);
		}
	}
	
	public void sendMessageToController (JSONObject msg) {
		if (controllerConnection != null && controllerConnection.isOpen()) {
			controllerConnection.send(msg.toJSONString());
		}
	}
	
	public void sendToAllDrones (String msg) {
		for(WebSocket socket : droneConnections.keySet()) {
			try {
				socket.send(msg);
			} catch (Exception e) {
				e.printStackTrace();
			}
		}
	}
	
	private class ControlServer extends WebSocketServer{
		
		public ControlServer(int port){
			super(new InetSocketAddress(port));
		}

		@Override
		public void onClose(WebSocket conn, int code, String reason, boolean remote) {
			System.out.println("ControlServer Connection Closed: IP address: " + conn.getRemoteSocketAddress().getAddress().getHostAddress() + 
					", code: " + code + ", reason: " + reason +  
					", remote val: " + remote + " connection.toString: " + conn.toString());
			controllerConnection = null;
		}

		@Override
		public void onError(WebSocket conn, Exception e) {
			System.out.println("ControlServer error from IP address: " + conn.getRemoteSocketAddress().getAddress().getHostAddress()  + " connection.toString: " + conn.toString() + "\n");
			e.printStackTrace();
		}

		@Override
		public void onMessage(WebSocket conn, String message) {
			//System.out.println("ControlServer message from controller client: \n\t" + message);
			//--spray all drones with data--//
			sendToAllDrones(message);
		}

		@Override
		public void onOpen(WebSocket conn, ClientHandshake handshake) {
			System.out.println("ControlServer Connection Opened: IP address: " + conn.getRemoteSocketAddress().getAddress().getHostAddress() + " connection.toString: " + conn.toString());
			controllerConnection = conn;
		}
	}
	
	private class DroneServer extends WebSocketServer{
		
		public DroneServer(int port){
			super(new InetSocketAddress(port));
		}

		@Override
		public void onClose(WebSocket conn, int code, String reason, boolean remote) {
			System.out.println("DroneServer Connection Closed: IP address: " + conn.getRemoteSocketAddress().getAddress().getHostAddress() + 
					", code: " + code + ", reason: " + reason +  
					", remote val: " + remote + " connection.toString: " + conn.toString());
			
			Integer id = droneConnections.get(conn);
			droneConnections.remove(conn);
			//update dms controller
			JSONObject controllerMsgObj = new JSONObject();
			controllerMsgObj.put("type", "droneLost");
			controllerMsgObj.put("droneId", id);
			sendMessageToController(controllerMsgObj);
		}

		@Override
		public void onError(WebSocket conn, Exception e) {
			System.out.println("DroneServer error from IP address: " + conn.getRemoteSocketAddress().getAddress().getHostAddress()  + " connection.toString: " + conn.toString() + "\n");
			e.printStackTrace();
		}

		@Override
		public void onMessage(WebSocket conn, String message) {
			//processJson(message);
			//int id = droneConnections.get(conn);
			//System.out.println("DroneServer message from clientId: " + id + " message: " + message);
		}

		@Override
		public void onOpen(WebSocket conn, ClientHandshake handshake) {
			System.out.println("DroneServer Connection Opened: IP address: " + conn.getRemoteSocketAddress().getAddress().getHostAddress() + " connection.toString: " + conn.toString());
			
			//new drone connection ... so give it a unique int id
			//add to app-layer collection
			Integer id = droneIdCnt.getAndIncrement();
			System.out.println("new id: " + id);
			droneConnections.put(conn, id);
			//tell it its name
			JSONObject msgObj = new JSONObject();
			msgObj.put("type", "setId");
			msgObj.put("id", id);
			msgObj.put("state", "browse");
			msgObj.put("xPos", 0);
			msgObj.put("yPos", 0);
			conn.send(msgObj.toJSONString());
			
			//update dmsController
			JSONObject controllerMsgObj = new JSONObject();
			controllerMsgObj.put("type", "newDrone");
			controllerMsgObj.put("droneId", id);
			sendMessageToController(controllerMsgObj);
		}
	}
	
	public static void main (String[] args) {
		new Server();
	}

}