(function() {
    let isPaused = true;  // Start the simulation in a paused state
    let isStarted = false;  // Flag to check if the simulation has started
    let intervalId = null;  // Variable to hold the interval ID for the simulation loop

    // Variables to store initial values for reset
    let initialM1, initialM2, initialX1, initialY1, initialX2, initialY2, initialV1x, initialV1y, initialV2x, initialV2y;
    let p1, p2, cm, arrow1, arrow2;  // Store the spheres, center of mass, and arrows globally
    let m1, m2, v1x, v1y, v2x, v2y;  // Global variables for the masses and velocities

    async function __main__() {
        "use strict";

        // Adjust the scene settings to ensure both spheres are visible
        var scene = canvas({center: vec(0, 0, 0), background: color.black});
        scene.width = 640;
        scene.height = 400;
        scene.range = 30;  // Adjusted the range to ensure spheres are visible

        scene.userzoom = false;
        scene.userspin = false;

        // Create the spheres initially without starting the simulation
        p1 = sphere({pos: vec(0, 0, 0), radius: 2, color: vec(0, 1, 0)});  // Sphere 1
        p2 = sphere({pos: vec(0, 0, 0), radius: 2, color: vec(1, 0, 1)});  // Sphere 2

        // Create a small sphere to represent the center of mass and place it slightly in front (z = 2)
        cm = sphere({pos: vec(0, 0, 2), radius: 0.5, color: vec(1, 1, 0)});  // Make the center of mass smaller

        // Create arrows to represent velocity vectors of each sphere
        arrow1 = arrow({pos: p1.pos, axis: vec(1, 0, 0), color: vec(0, 1, 0), shaftwidth: 0.5});
        arrow2 = arrow({pos: p2.pos, axis: vec(1, 0, 0), color: vec(1, 0, 1), shaftwidth: 0.5});

        // Function to calculate and update the center of mass position
        function updateCenterOfMass() {
            let xcm = (m1 * p1.pos.x + m2 * p2.pos.x) / (m1 + m2);
            let ycm = (m1 * p1.pos.y + m2 * p2.pos.y) / (m1 + m2);
            cm.pos = vec(xcm, ycm, 2);  // Update the position of the center of mass sphere and ensure z = 2 (in front)
        }

        // Function to handle collision testing and updating velocities
        function cTest() {
            let dx = p1.pos.x - p2.pos.x;
            let dy = p1.pos.y - p2.pos.y;
            let dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 4) {  // Adjusted for radius of spheres
                let theta = Math.atan2(dy, dx);
                let cosTheta = Math.cos(theta);
                let sinTheta = Math.sin(theta);

                let vx1Prime = v1x * cosTheta + v1y * sinTheta;
                let vx2Prime = v2x * cosTheta + v2y * sinTheta;
                let vy1Prime = v1y * cosTheta - v1x * sinTheta;
                let vy2Prime = v2y * cosTheta - v2x * sinTheta;

                let p = m1 * vx1Prime + m2 * vx2Prime;
                let v = vx1Prime - vx2Prime;
                let v2f = (p + m1 * v) / (m1 + m2);
                let v1f = v2f - vx1Prime + vx2Prime;

                vx1Prime = v1f;
                vx2Prime = v2f;

                v1x = vx1Prime * cosTheta - vy1Prime * sinTheta;
                v2x = vx2Prime * cosTheta - vy2Prime * sinTheta;
                v1y = vy1Prime * cosTheta + vx1Prime * sinTheta;
                v2y = vy2Prime * cosTheta + vx2Prime * sinTheta;

                p1.pos.x = p2.pos.x + cosTheta * 4;
                p1.pos.y = p2.pos.y + sinTheta * 4;

                // Update the final velocities in the readonly fields
                $('#u1x').val(v1x);
                $('#u1y').val(v1y);
                $('#u2x').val(v2x);
                $('#u2y').val(v2y);
            }
        }

        // Function to move the objects according to velocity
        function moveObjects() {
            if (!isPaused && isStarted) {  // Only move objects if not paused and simulation is started
                cTest();
                p1.pos.x += v1x * 0.01;
                p1.pos.y += v1y * 0.01;
                p2.pos.x += v2x * 0.01;
                p2.pos.y += v2y * 0.01;
                updateCenterOfMass();  // Update the center of mass each time objects move

                // Calculate the speed (magnitude of velocity) for each ball
                let speed1 = Math.sqrt(v1x * v1x + v1y * v1y);  // Speed of ball 1
                let speed2 = Math.sqrt(v2x * v2x + v2y * v2y);  // Speed of ball 2

                // Update the position and direction of velocity arrows
                arrow1.pos = p1.pos;  // Set arrow position to the sphere's position
                arrow1.axis = vec(v1x, v1y, 0).norm().multiply(speed1);  // Set arrow direction and length proportional to speed

                arrow2.pos = p2.pos;
                arrow2.axis = vec(v2x, v2y, 0).norm().multiply(speed2);
            }

            // Check the checkbox state to show or hide the center of mass
            if ($('#toggleCenterOfMass').is(':checked')) {
                cm.visible = true;
            } else {
                cm.visible = false;
            }

            // Check the checkbox state to show or hide velocity vectors
            if ($('#toggleVelocityVectors').is(':checked')) {
                arrow1.visible = true;
                arrow2.visible = true;
            } else {
                arrow1.visible = false;
                arrow2.visible = false;
            }
        }

        // Reset function
        $('#resetSimulation').on('click', function() {
            location.reload();  // Reload the page to reset everything
        });


        // Set up a timed loop for the simulation
        intervalId = setInterval(() => {
            moveObjects();
        }, 30);  // 30 milliseconds per frame, roughly 33 FPS
    }

    // Initialize the simulation on page load (paused and not started)
    $(function() {
        window.__context = { glowscript_container: $("#glowscript").removeAttr("id") };
        __main__();

        // Start the simulation on button click
        $('#startSimulation').on('click', function() {
            // Get input values for mass, position, and velocity right before starting the simulation
            m1 = parseFloat($('#massA').val());
            m2 = parseFloat($('#massB').val());
            let x1 = parseFloat($('#x1').val());
            let y1 = parseFloat($('#y1').val());
            let x2 = parseFloat($('#x2').val());
            let y2 = parseFloat($('#y2').val());
            v1x = parseFloat($('#v1x').val());
            v1y = parseFloat($('#v1y').val());
            v2x = parseFloat($('#v2x').val());
            v2y = parseFloat($('#v2y').val());

            // Set the initial positions and velocities when starting
            p1.pos = vec(x1, y1, 0);
            p2.pos = vec(x2, y2, 0);

            // Initialize arrows based on velocities and speed
            let speed1 = Math.sqrt(v1x * v1x + v1y * v1y);
            let speed2 = Math.sqrt(v2x * v2x + v2y * v2y);
            arrow1.pos = p1.pos;
            arrow1.axis = vec(v1x, v1y, 0).norm().multiply(speed1);  // Set arrow direction based on velocity and speed
            arrow2.pos = p2.pos;
            arrow2.axis = vec(v2x, v2y, 0).norm().multiply(speed2);

            // Save the initial values for resetting later
            initialM1 = m1;
            initialM2 = m2;
            initialX1 = x1;
            initialY1 = y1;
            initialX2 = x2;
            initialY2 = y2;
            initialV1x = v1x;
            initialV1y = v1y;
            initialV2x = v2x;
            initialV2y = v2y;

            isStarted = true;
            isPaused = false;
            $(this).hide();
            $('#pauseResumeSimulation').show();
        });

        // Pause and resume simulation on button click
        $('#pauseResumeSimulation').on('click', function() {
            isPaused = !isPaused;  // Toggle the pause state
            $(this).text(isPaused ? 'Resume Simulation' : 'Pause Simulation');  // Change button text
        });

        // Reset simulation on button click
        $('#resetSimulation').on('click', function() {
            resetSimulation();  // Call the reset function
        });
    });
})();
