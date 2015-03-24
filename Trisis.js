// Globals
var canvas, gl, program, texture;

var movement = false;
var spinX = 0;
var spinY = 0;
var origX;
var origY;

var zDist = 10.0;

var proLoc, mvLoc;

var vPosition, vTexCoord;

var textureImgs = [];

var triomino; // global, for now.
var grid;
var bricks;

var crntCubeRotation = [0, 0, 0];
var rotationUpdate = [[false, false], [false, false], [false, false]];

var crntCubeTransl = [0.0, 0.0];
var translUpdate = [[false, false], [false, false]];

var translDecisions = translDec.ver0;


var availAxisTransl = [true, true],     // [x, z]
    availAxisRot = [true, true, true];

var crntDrop = 0.0;

var crntCoords;

var translGridChanges = translCh.ver0;

var updateGridCoords = false;

// 0 = down, 1 = right, 2 = up, 3 = left
var arrowPressIndex;


var keys = [];

// Setup the necessities
var setup = function() {
    canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {alert("WebGL isn't available");}

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.18, 0.18, 0.18, 1.0);

    gl.enable(gl.DEPTH_TEST);

    // Test cube
    triomino = new Triomino();
    triomino.build();
    triomino.cube.loadToGPU();

    grid = new Grid();
    grid.build();
    grid.loadToGPU();

    bricks = new Bricks();
    bricks.build();

    // Regular shape init
    /*
    bricks.add(19, 3, 3);
    bricks.add(18, 3, 3);
    bricks.add(17, 3, 3);
    */

    // L shape init
    /*
    bricks.add(19, 3, 3);
    bricks.add(18, 3, 3);
    bricks.add(18, 4, 3);
    */  

    //bricks.add(18,0,0);
    //bricks.add(19, 2, 2);
    //bricks.add(19, 5, 1);
    // bricks.add(19, 4, 4);
    // bricks.add(18, 1, 1);
    // bricks.add(18, 5, 5);

    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.enableVertexAttribArray( vPosition );

    vTexCoord = gl.getAttribLocation( program, "vTexCoord" );
    gl.enableVertexAttribArray( vTexCoord );

    proLoc = gl.getUniformLocation(program, "projection");
    mvLoc = gl.getUniformLocation(program, "modelview");

    var proj = perspective(50.0, 1.0, 0.2, 100.0);
    gl.uniformMatrix4fv(proLoc, false, flatten(proj));

    addEventListeners();
};

var loadTextures = function() {
    textureImgs.push(document.getElementById("circuitBoard-blue"));
    textureImgs.push(document.getElementById("circuitBoard-red"));
    textureImgs.push(document.getElementById("circuitBoard-green"));
    textureImgs.push(document.getElementById("grid-black"));
};

///////////////////////////////////
var updateSimulation = function(du) {
    // update
    triomino.update(du);

    checkKeyInputs();
};

var renderSimulation = function() {
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var mv = lookAt( vec3(0.0, 0.0, zDist), vec3(0.0, 0.0, 0.0), vec3(0.0, 1.0, 0.0) );
    mv = mult( mv, rotate( parseFloat(spinX), [1, 0, 0] ) );
    mv = mult( mv, rotate( parseFloat(spinY), [0, 1, 0] ) );
    
    triomino.render(mv);
    grid.render(mv);
    bricks.render(mv);
};

// Start the game
window.onload = function init() {
    loadTextures();
    setup();
    main.init();
};