/////////////////////////////////////////////////////////////////
// ??
/////////////////////////////////////////////////////////////////

function Brick(descr) {
    // descr must include:
    //     image
    //     y, x, z grid index

    for(var property in descr)
        this[property] = descr[property];

    var gs = grid.gridSize;

    this.translations = [
        this.x * gs,
        this.y * gs,
        this.z * gs
    ];
}

function Bricks(descr) {
    for(var property in descr)
        this[property] = descr[property];

    this.allBricks = [];

    this.levelsWithCubes = [];
}

Bricks.prototype.cube = new Cube(
        {
            vert : [
                vec3(-1.4, -7.4, -1.0),
                vec3(-1.4, -7.0, -1.0),
                vec3(-1.0, -7.0, -1.0),
                vec3(-1.0, -7.4, -1.0),
                vec3(-1.4, -7.4, -1.4),
                vec3(-1.4, -7.0, -1.4),
                vec3(-1.0, -7.0, -1.4),
                vec3(-1.0, -7.4, -1.4)
            ]
        }
    );

Bricks.prototype.build = function() {
    this.blob = new Array(20);
    for (var i = 0; i < this.blob.length; i++) {
        this.blob[i] = new Array(6);
        for (var j = 0; j < this.blob[i].length; j++) {
            this.blob[i][j] = new Array(6);
        }
    }
};

Bricks.prototype.render = function(mv) {
    var mvStack = [];
    for (var brick of this.allBricks) {
        mvStack.push(mv);
            mv = mult(mv, translate(brick.translations));
            this.cube.image = brick.tex;
            this.cube.render(mv);
        mv = mvStack.pop();
    }
};

// input can be 3 indices or 3 arrays each with 3 indices
Bricks.prototype.add = function (y,x,z,tex) {
    if ( typeof y === "number" ) {
        var c1 = new Brick(
            {
                y : y,
                x : x,
                z : z,
                tex : tex
            }
        );
        this.allBricks.push(c1);

        this.blob[y][x][z] = c1;
    } else {
        // assume three arrays each with 3 indices
        this.add(y[0], y[1], y[2], tex);
        this.add(x[0], x[1], x[2], tex);
        this.add(z[0], z[1], z[2], tex);
    }
};

// input can be 3 indices or 3 arrays each with 3 indices
Bricks.prototype.check = function (y,x,z) {
    if ( typeof y === "number" ) {
        // num, num, num
        if (this.blob[y] && this.blob[y][x] && this.blob[y][x][z])
            return true;
        else 
            return false;
    } else if ( x && z ) {
        // array, array, array
        var a = this.check(y[0], y[1], y[2]), 
            b = this.check(x[0], x[1], x[2]), 
            c = this.check(z[0], z[1], z[2]);

        return a || b || c;
    } else {
        // array
        return this.check(y[0], y[1], y[2]);
    }
};

Bricks.prototype.levelFull = function(level) {
    for (var j = 0; j < this.blob[level].length; j++) {
        for (var k = 0; k < this.blob[level][j].length; k++) {
            if (!this.blob[level][j][k]) return false;
        }
    }
    return true;
};

Bricks.prototype.update = function() {
    for (lvl of this.levelsWithCubes) {
        if (this.levelFull(lvl)) 
            console.log(lvl + " level full");
    }
};
