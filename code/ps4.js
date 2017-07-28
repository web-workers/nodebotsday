const five = require("johnny-five");
const EtherPortClient = require("etherport-client").EtherPortClient;
const dualShock = require('dualshock-controller');
const _ = require('lodash');
const scale = require('scale-number-range');


const bot = new five.Board({
    port: new EtherPortClient({
        host: "192.168.2.158", // Put your individual IP address here.
        port: 3030
    }),
    timeout: 1e5
});

// Set up an object representing the Dualshock controller.
// https://github.com/rdepena/node-dualshock-controller
const controller = dualShock({
    config: "dualshock4-generic-driver",
    analogStickSmoothing : true
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


    // The scale function converts the PS4 joystick 'y' position to an appropriate motor speed value.
    // Motor speed values go from 0 - 255, but really the motor only starts moving at around 128.
    // https://github.com/nickpoorman/scale-number-range

    function getFwdSpeed(y) {
        // convert 'y' values from 90 to 0 to 'speed' values from 128 to 255
        return scale(y, 90, 0, 128, 255);
    }

    function getRevSpeed(y) {
        // convert 'y' values from 166 to 255 to 'speed' values from 128 to 255
        return scale(y, 166, 255, 128, 255);
    }

    // This function takes data from the left joystick and moves the left wheel of the bot
    const leftMove = _.throttle(function(data) {

        // take the 'y' value from the joystick
        let y = data.y;

        // If the 'y' value is greater than 166, move the bot forward.
        if ( y > 166 ) {
            leftWheel.fwd(getRevSpeed(y));
        }
        // If the 'y' value is less than 90, move the bot forward.
        else if ( y < 90 ) {
            leftWheel.rev(getFwdSpeed(y));
        }
        // The middle joystick position is on or around a 'y' value of 128. That should stop the wheel.
        else {
            leftWheel.stop();
        }

        console.log(`left: ${leftSpeed}, right: ${rightSpeed}`);

    }, 40);

    // When the left joystick moves, it will emit an event called 'left:move'.
    // Whenever that happens, we'll call the 'leftMove' function.
    controller.on('left:move', leftMove);


    // The right stick works pretty much the same as the left.
    const rightMove = _.throttle(function(data) {
        let y = data.y;
        if ( y > 166 ) {
            rightWheel.fwd(getRevSpeed(y));
        }
        else if ( y < 90 ) {
            rightWheel.rev(getFwdSpeed(y));
        }
        else {
            rightWheel.stop();
        }
        console.log(`left: ${leftSpeed}, right: ${rightSpeed}`);
    });

    controller.on('right:move', rightMove);

});