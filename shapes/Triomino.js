function Triomino(descr) {
    for (var property in descr)
        this[property] = descr[property];

    this.LShape = util.coinFlip();

    this.rotations = [0.0, 0.0, 0.0];
    this.rotUpdateBuffers = [0.0, 0.0, 0.0];

    this.translations = [0.0, 0.0];
    this.translUpdateBuffers = [0.0, 0.0];

    this.isDropping = false;
    this.dropLevel = 0.0;

    this.image = this.LShape ? textureImgs[0] : textureImgs[1];

    this.topCoords = [19, 3, 3];
    this.midCoords = [18, 3, 3];
    this.btmCoords = this.LShape ? [18, 4 , 3] : [17, 3, 3];

    this.crntCoords = [this.topCoords, this.midCoords, this.btmCoords];
}

Triomino.prototype.ROT_UPDATE_STEPS = 15;
Triomino.prototype.TRANSL_UPDATE_STEPS = 15;
Triomino.prototype.DROP_UPDATE_STEPS = 60;

Triomino.prototype.build = function() {
     this.cube = new Cube({image : this.image});
};

Triomino.prototype.update = function(du) {
    // Generalize this. Rotation and translation are doing
    // exactly the same thing.


    // Rotation
    for (var i = 0; i < this.rotUpdateBuffers.length; i++) {
        if (rotationUpdate[i][0]) { // increasing
            if (this.rotations[i] < crntCubeRotation[i])
                this.rotations[i] += (90 / this.ROT_UPDATE_STEPS) * du;
            else {
                rotationUpdate[i][0] = false;
                availAxisRot[i] = true;
            }
        }
        else if (rotationUpdate[i][1]) { // decreasing
            if (this.rotations[i] > crntCubeRotation[i])
                this.rotations[i] -= (90 / this.ROT_UPDATE_STEPS) * du;
            else {
                rotationUpdate[i][1] = false;
                availAxisRot[i] = true;
            }
        }
        else // no change    
            this.rotations[i] = crntCubeRotation[i];
    }

    // Translation
    for (var i = 0; i < this.translUpdateBuffers.length; i++) {
        if (translUpdate[i][0]) { // decreasing
            if (this.translations[i] > crntCubeTransl[i])
                this.translations[i] -= (0.4 / this.TRANSL_UPDATE_STEPS) * du;
            else {
                translUpdate[i][0] = false;
                availAxisTransl[i] = true;
            }
        }
        else if (translUpdate[i][1]) { // increasing
            if (this.translations[i] < crntCubeTransl[i])
                this.translations[i] += (0.4 / this.TRANSL_UPDATE_STEPS) * du;
            else {
                translUpdate[i][1] = false;
                availAxisTransl[i] = true;
            }
        }
        else // no change
            this.translations[i] = crntCubeTransl[i];
    }

    if (this.dropLevel > crntDrop) { // drop
        this.dropLevel -= (0.4 / this.DROP_UPDATE_STEPS) * du;
    }
    else { // no change
        this.dropLevel = crntDrop;
        if (this.isDropping)
            crntDrop -= 0.4;
    }

};


Triomino.prototype.updateGridCoords = function() {
    for (var coords of this.crntCoords) {
        var change = translGridChanges[arrowPressIndex];
        for (var i = 0; i < change.length; i++) {
            if (i > 0) {
                if (coords[i] + change[i] >= 0 &&
                    coords[i] + change[i] <= 5) { // Make this prettier if possible.
                    coords[i] += change[i];
                }
                else {
                    return false;
                }
            }
            else
                coords[i] += change[i];
        }
    }
    return true;
};


Triomino.prototype.render = function(mv) {
    var mvStack = [];

    mvStack.push(mv);
        mv = this.drop(mv);
        mv = this.translate(mv);
        mv = this.rotate(mv);
        this.cube.render(mv);
    mv = mvStack.pop();
    mvStack.push(mv);
        mv = this.drop(mv);
        mv = this.translate(mv);
        mv = this.rotate(mv);
        mv = mult(mv, translate(0.0, 0.4, 0.0));
        this.cube.render(mv);
    mv = mvStack.pop();
    mvStack.push(mv);
        mv = this.drop(mv);
        mv = this.translate(mv);
        mv = this.rotate(mv);
        mv = this.LShape ? mult(mv, translate(0.4, 0.0, 0.0)) : 
                    mult(mv, translate(0.0, -0.4, 0.0));
        this.cube.render(mv);
    mv = mvStack.pop();
};

Triomino.prototype.drop = function(mv) {
    mv = mult(mv, translate(0.0, this.dropLevel, 0.0));
    return mv;
};

Triomino.prototype.translate = function(mv) {
    // translate here
    if (!(this.translations[0] === 0 && this.translations[1] === 0))
        mv = mult(mv, translate(this.translations[0], 0.0, this.translations[1]));
    return mv;
};

Triomino.prototype.rotate = function(mv) {
    //this.rotations = crntCubeRotation;
    if (this.rotations[0] !== 0)
        mv = mult(mv, rotate(this.rotations[0], [1, 0, 0]));    // x-axis
    if (this.rotations[1] !== 0)
        mv = mult(mv, rotate(this.rotations[1], [0, 1, 0]));    // y-axis
    if (this.rotations[2] !== 0)
        mv = mult(mv, rotate(this.rotations[2], [0, 0, 1]));    // z-axis
    return mv;
};