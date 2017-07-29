const five = require("johnny-five");
const EtherPortClient = require("etherport-client").EtherPortClient;
const XboxController = require('xbox-controller');
const controller = new XboxController;
const _ = require('lodash');
const scale = require('scale-number-range');

const bot = new five.Board({
    port: new EtherPortClient({
        host: "192.168.2.xxx", // Put your individual IP address here.
        port: 3030
    }),
    timeout: 1e5
});

// Set the speed of the motors (0 - 255)
let leftSpeed = 0;
let rightSpeed = 0;

bot.on("ready", function () {

    // The following code will blink the LED on the WeMos board to indicate that the code is working.
    let state = 1;
    setInterval(function () {
        this.digitalWrite(2, (state ^= 1));
    }.bind(this), 500);


    // Use Johnny-Five to create an instance of the left motor.
    const leftWheel = new five.Motor({
        pins: {
            pwm: 0,
            dir: 4
        },
        invertPWM: true
    });

    // Use Johnny-Five to create an instance of the right motor
    const rightWheel = new five.Motor({
        pins: {
            pwm: 13,
            dir: 12
        },
        invertPWM: true
    });


    // The scale function converts the xbox joystick 'y' position to an appropriate motor speed value.
    // Motor speed values go from 0 - 255, but really the motor only starts moving at around 128.
    // https://github.com/nickpoorman/scale-number-range

    function getFwdSpeed(y) {
        // convert 'y' values from 0 to -32768 to 'speed' values from 128 to 255
        return scale(y, 0, -32768, 128, 255);
    }

    function getRevSpeed(y) {
        // convert 'y' values from 0 to 32768 to 'speed' values from 128 to 255
        return scale(y, 0, 32768, 128, 255);
    }

    // This function takes data from the left joystick and moves the left wheel of the bot
    const leftMove = _.throttle(function(data) {
        // take the 'y' value from the joystick
        let y = data.y;

        // If the 'y' value is greater than 10, move the bot forward.
        if ( y > 10 ) {
            leftWheel.fwd(getRevSpeed(y));
        }
        // If the 'y' value is less than -10, move the bot backward.
        else if ( y < -10 ) {
            leftWheel.rev(getFwdSpeed(y));
        }
        // The middle joystick position is on or around a 'y' value of 128. That should stop the wheel.
        else {
            leftWheel.stop();
        }

    }, 40);

    // When the left joystick moves, it will emit an event called 'left:move'.
    // Whenever that happens, we'll call the 'leftMove' function.
    controller.on('left:move', leftMove);


    // The right stick works pretty much the same as the left.
    const rightMove = _.throttle(function(data) {
        let y = data.y;
        if ( y > 10 ) {
            rightWheel.fwd(getRevSpeed(y));
        }
        else if ( y < -10 ) {
            rightWheel.rev(getFwdSpeed(y));
        }
        else {
            rightWheel.fwd(0);
        }
    });

    controller.on('right:move', rightMove);
});
