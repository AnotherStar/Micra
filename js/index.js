/* jshint quotmark: false, unused: vars */
/* global cordova, bluetoothSerial, listButton, connectButton, sendButton, disconnectButton */
/* global chatform, deviceList, message, messages, statusMessage, chat, connection */
'use strict';

var bluetoothSerial = cordova.require('bluetoothSerial');

var app = {
    initialize: function() {
        this.bind();
        listButton.style.display = "none";
    },
    bind: function() {
        document.addEventListener('deviceready', this.deviceready, false);
    },
    deviceready: function() {
        var success = function() {
            message.value = "";
            messages.value += ("Us: " + text);
            messages.scrollTop = messages.scrollHeight;
        };

        connectButton.ontouchstart = app.connect;
        listButton.ontouchstart = app.list;
        sendButton.ontouchstart = app.sendData;
        chatform.onsubmit = app.sendData;
        disconnectButton.ontouchstart = app.disconnect;
        sensor_3.ontouchstart = bluetoothSerial.write("sensor_3" + "\n");
        // listen for messages
        //bluetoothSerial.subscribe("\n", app.onmessage, app.generateFailureFunction("Subscribe Failed"));
        bluetoothSerial.subscribe("\n", function(message){
        	message = message.replace("\n",'');
        	message = message.split(';');
        	
        	for(var i = 0; i < message.length; i++){
	        	message[i] = parseFloat(message[i]);
        	}

        	$('#input_1').text(message[0]);
        	$('#input_2').text(message[1]);
        	$('#input_3').text(message[2]);
        	$('#sensor').css('opacity', message[2]/670);
        	$('#sensor_2').css('opacity', message[1]);

        	dash.sensorTacho(message[2]);
        });
       
        // get a list of peers
        setTimeout(app.list, 2000);
    },
    list: function(event) {
        deviceList.firstChild.innerHTML = "Discovering...";
        app.setStatus("Looking for Bluetooth Devices...");
        bluetoothSerial.list(app.ondevicelist, app.generateFailureFunction("List Failed"));
    },
    connect: function() {
        var device = deviceList[deviceList.selectedIndex].value;
        app.disable(connectButton);
        app.setStatus("Connecting...");
        console.log("Requesting connection to " + device);
        bluetoothSerial.connect(device, app.onconnect, app.ondisconnect);
    },
    disconnect: function(event) {
        if (event) {
            event.preventDefault();
        }
        app.setStatus("Disconnecting...");
        bluetoothSerial.disconnect(app.ondisconnect);
    },
    sendData: function(event) {
        event.preventDefault();
        var text = message.value + "\n";
        var success = function() {
            message.value = "";
            messages.value += ("Us: " + text);
            messages.scrollTop = messages.scrollHeight;
        };

        //alert(text);
        bluetoothSerial.write(text, success);
        return false;
    },
    ondevicelist: function(devices) {
        var option;
        // remove existing devices
        deviceList.innerHTML = "";
        app.setStatus("");
        devices.forEach(function(device) {
            option = document.createElement('option');
            if (device.hasOwnProperty("uuid")) {
                option.value = device.uuid;
            } else if (device.hasOwnProperty("address")) {
                option.value = device.address;
            } else {
                option.value = "ERROR " + JSON.stringify(device);
            }
            option.innerHTML = device.name;
            deviceList.appendChild(option);
        });
        if (devices.length === 0) {
            option = document.createElement('option');
            option.innerHTML = "No Bluetooth Devices";
            deviceList.appendChild(option);
            if (cordova.platformId === "ios") { // BLE
                app.setStatus("No Bluetooth Peripherals Discovered.");
            } else { // Android
                app.setStatus("Please Pair a Bluetooth Device.");
            }
            app.disable(connectButton);
            listButton.style.display = "";
        } else {
            app.enable(connectButton);
            listButton.style.display = "none";
            app.setStatus("Found " + devices.length + " device" + (devices.length === 1 ? "." : "s."));
        }
    },
    onconnect: function() {
        app.setStatus("Connected");
        showPart(3);
    },
    ondisconnect: function(reason) {
        var details = "";
        if (reason) {
            details += ": " + JSON.stringify(reason);
        }
        app.enable(connectButton);
        app.setStatus("Disconnected");
        showPart(2);
    },
    onmessage: function(message) {
    	alert('1 ' + message);
    	sensor = message.split('#');
    	alert('2 ' + typeof sensor);
    	alert('3 ' + sensor);
		for (var i = 1; i< sensor.length; i++) {
			alert('4 ' + sensor[i]);
		};
        messages.value += ">" + message;
        messages.scrollTop = messages.scrollHeight;
    },
    setStatus: function(message) { // setStatus
        console.log(message);
        window.clearTimeout(app.statusTimeout);
        statusMessage.innerHTML = message;
        statusMessage.className = 'fadein';
        // automatically clear the status with a timer
        app.statusTimeout = setTimeout(function() {
            statusMessage.className = 'fadeout';
        }, 5000);
    },
    enable: function(button) {
        button.className = button.className.replace(/\bis-disabled\b/g, '');
    },
    disable: function(button) {
        if (!button.className.match(/is-disabled/)) {
            button.className += " is-disabled";
        }
    },
    generateFailureFunction: function(message) {
        var func = function(reason) { // some failure callbacks pass a reason
            var details = "";
            if (reason) {
                details += ": " + JSON.stringify(reason);
            }
            app.setStatus(message + details);
        };
        return func;
    }
};

function sendCommand(command){
	alert('command: ' + command);
	bluetoothSerial.write(command, success);
	alert(typeof bluetoothSerial.write(command, success));
}