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
    this.clearLevel(level);
    return true;

};

Bricks.prototype.levelEmpty = function(level) {
    for (var j = 0; j < this.blob[level].length; j++) {
        for (var k = 0; k < this.blob[level][j].length; k++) {
            if (this.blob[level][j][k]) return false;
        }
    }
    return true;
};

Bricks.prototype.update = function(du) {
    for (lvl of this.levelsWithCubes) {
        if (this.levelFull(lvl)) 
            break;
    }
    this.maybeBumpDownBricks(du);
};

var bumpDownBricks = false;
var bricksToBump = [];
var bricksToReallyAdd = [];
var dumpTime = 120;

Bricks.prototype.BUMP_DOWN_STEPS = 60;

Bricks.prototype.maybeBumpDownBricks = function(du) {
    if (bumpDownBricks) {
        if (dumpTime > 0) { // bump down the current ones in steps
            for (var br of bricksToBump) {
                br.translations[1] -= (0.4 / this.BUMP_DOWN_STEPS) * du;
                dumpTime -= du;
            }       
        }
        else { // when these steps are finished, delete the old ones 
               // and insert new bricks with the y index 1 lower.
            dumpTime = 60;
            bumpDownBricks = false;
            for (var i = 0; i < bricksToBump.length; i++) {
                var index = this.allBricks.indexOf(bricksToBump[i]);
                this.allBricks.splice(index, 1);
            }
            for (var i = 0; i < bricksToReallyAdd.length; i++) {
                var aBrick = bricksToReallyAdd[i];
                if (this.blob[aBrick.y][aBrick.x][aBrick.z] &&
                    !util.brickAlreadyThere(this.allBricks, aBrick))
                    this.allBricks.push(aBrick);
            }
            bricksToBump = [];
            bricksToReallyAdd = [];
        }
    }
    this.updateLevelsWithCubes();
};

Bricks.prototype.clearLevel = function(level) {
    score += 36;
    document.getElementById("scoreText").innerHTML = score;

    // Empty the full level of the blob thing.
    for (var j = 0; j < this.blob[level].length; j++) {
        for (var k = 0; k < this.blob[level][j].length; k++) {
            this.blob[level][j][k] = undefined;
        }
    }

    // Make sure the bricks aren't rendered.
    for (var i = 0; i < this.allBricks.length; i++) {
        var aBrick = this.allBricks[i];
        if (aBrick.y === level) {
            this.allBricks.splice(i,1);
            i--;
        }
    }

    // Then make all the bricks of higher levels drop down by one.
    for (var i = 0; i < this.levelsWithCubes.length; i++) {
        var aLevel = this.levelsWithCubes[i];
        if (aLevel > level && aLevel > 0) {
            // Drop all the bricks in the blob down by one.
            for (var j = 0; j < this.blob[aLevel].length; j++) {
                for (var k = 0; k < this.blob[aLevel][j].length; k++) {
                    if (this.blob[aLevel][j][k]) {
                        this.blob[aLevel-1][j][k] = new Brick({
                            y : this.blob[aLevel][j][k].y - 1,
                            x : this.blob[aLevel][j][k].x,
                            z : this.blob[aLevel][j][k].z,
                            tex : this.blob[aLevel][j][k].tex
                        });
                        this.blob[aLevel][j][k] = undefined;
                    }
                }
            }   
            // Drop all the bricks from higher levels that are being
            // rendered down by one.
            for (var j = 0; j < this.allBricks.length; j++) {
                var aBrick = this.allBricks[j];
                if (aBrick.y === aLevel) {
                    bumpDownBricks = true;
                    if (!util.brickAlreadyThere(bricksToBump, aBrick))
                        bricksToBump.push(aBrick);
                    var tmpBrick = aBrick;
                    var newBrick = new Brick({
                            x : tmpBrick.x,
                            y : tmpBrick.y - 1,
                            z : tmpBrick.z,
                            tex : tmpBrick.tex
                        });
                    if (!util.brickAlreadyThere(bricksToReallyAdd, newBrick))
                        bricksToReallyAdd.push(newBrick);
                }
            }
        }
    }
};

Bricks.prototype.updateLevelsWithCubes = function() {
    this.levelsWithCubes = [];
    for (var lvl = 0; lvl < 20; lvl++)
        if (!this.levelEmpty(lvl))
            this.levelsWithCubes.push(lvl);
};