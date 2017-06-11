var five = require("johnny-five");
    var EtherPortClient = require("etherport-client").EtherPortClient;

var board = new five.Board({
    port: new EtherPortClient({
        host: "192.168.1.20",
        port: 3030
    }),
    timeout: 1e5
});

board.on("ready", function() {
	var state = 1;
    setInterval(function () {
        this.digitalWrite(2, (state ^= 1));
    }.bind(this), 500);
    
	var leftWheel = new five.Motor({
		pins: {
			pwm: 0,
			dir: 4
		},
		invertPWM: true
	});

	var rightWheel = new five.Motor({
			pins: {
				pwm: 13,
				dir: 12
			},
			invertPWM: true
		});

	 var speed = 255;

  function reverse() {
    leftWheel.rev(speed);
    rightWheel.rev(speed);
  }

  function forward() {
    leftWheel.fwd(speed);
    rightWheel.fwd(speed);
  }

  function stop() {
    leftWheel.stop();
    rightWheel.stop();
  }

  function left() {
    leftWheel.rev(speed);
    rightWheel.fwd(speed);
  }

  function right() {
    leftWheel.fwd(speed);
    rightWheel.rev(speed);
  }

  function exit() {
    leftWheel.rev(0);
    rightWheel.rev(0);
    setTimeout(process.exit, 1000);
  }

  var keyMap = {
    'up': forward,
    'down': reverse,
    'left': left,
    'right': right,
    'space': stop,
    'q': exit
  };

  var stdin = process.stdin;
  stdin.setRawMode(true);
  stdin.resume();

  stdin.on("keypress", function(chunk, key) {
      if (!key || !keyMap[key.name]) return;      

      keyMap[key.name]();
  });

 });