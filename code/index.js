// Import the Johnny Five library.
var five = require("johnny-five");

// Import the EtherPortClien library. 
var EtherPortClient = require("etherport-client").EtherPortClient;


// Use Johnny Five to create a new instance of a 'bot' using the EtherPortClient
// to communicate between your computer and the NodeBot
var bot = new five.Board({
    port: new EtherPortClient({
        host: "192.168.2.125", // Put your individual IP address here.
        port: 3030
    }),
    timeout: 1e5
});

bot.on("ready", function () {

    // The following code will blink the LED on the WeMos board to indicate that the code is working.
    var state = 1;
    setInterval(function () {
        this.digitalWrite(2, (state ^= 1));
    }.bind(this), 500);


    // Use Johnny-Five to create an instance of the left motor.
    var leftWheel = new five.Motor({
        pins: {
            pwm: 0,
            dir: 4
        },
        invertPWM: true
    });

    // Use Johnny-Five to create an instance of the right motor
    var rightWheel = new five.Motor({
        pins: {
            pwm: 13,
            dir: 12
        },
        invertPWM: true
    });

    // Set the speed of the motors (0 - 255)
    var speed = 255;

    // A function to move the bot in reverse
    function reverse() {
        leftWheel.rev(speed);
        rightWheel.rev(speed);
    }

    // A function to move the bot forward
    function forward() {
        leftWheel.fwd(speed);
        rightWheel.fwd(speed);
    }

    // A function to stop the bot (by stopping both motors)
    function stop() {
        leftWheel.stop();
        rightWheel.stop();
    }

    // A function to turn the bot to the left.
    function left() {
        leftWheel.rev(speed);
        rightWheel.fwd(speed);
    }

    // A function to turn the bot to the right.
    function right() {
        leftWheel.fwd(speed);
        rightWheel.rev(speed);
    }

    // A function to stop the bot and close Johnny-Five.
    function exit() {
        // Set each motor's speed to 0.
        leftWheel.rev(0);
        rightWheel.rev(0);

        // Wait 1 second (1000ms) and exit the program.
        setTimeout(process.exit, 1000);
    }

    // Associate the name of the keys on the keyboard to different functions.
    var keyMap = {
        'up': forward,
        'down': reverse,
        'left': left,
        'right': right,
        'space': stop,
        'q': exit
    };

    // Set up the keyboard in Node.js
    var stdin = process.stdin;
    stdin.setRawMode(true);
    stdin.resume();

    // Listen for keypresses on the keyboard
    stdin.on("keypress", function (chunk, key) {

        //  If a key is not pressed, or a key is pressed that is not in our keyMap, do nothing.
        if (!key || !keyMap[key.name]) {
            return;
        }

        // Otherwise call the function associated with the pressed key on the keyboard.
        keyMap[key.name]();
    });

});
