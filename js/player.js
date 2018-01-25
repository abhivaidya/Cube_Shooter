var Player = (function () {
    function Player(scene, mesh) {
        this.bullets = [];
        this.grenades = [];
        this.speed = new BABYLON.Vector3(0, 0, 0.05);
        this.moveLeft = false;
        this.moveRight = false;
        this.moveForward = false;
        this.moveBackward = false;
        this.rotateLeft = false;
        this.rotateRight = false;
        this.parentMesh = BABYLON.MeshBuilder.CreateBox("parentMesh", { width: 1, height: 5, depth: 1 }, scene);
        this.parentMesh.name = "player";
        this.parentMesh.checkCollisions = true;
        this.parentMesh.ellipsoid = new BABYLON.Vector3(10, 10, 10);
        this.sceneRef = scene;
        var faceColors = new Array(6);
        faceColors[0] = new BABYLON.Color4(1, 0, 0, 1);
        faceColors[1] = new BABYLON.Color4(0, 1, 0, 1);
        var options = {
            width: 1,
            height: 2,
            depth: 1,
            faceColors: faceColors
        };
        this.mesh = mesh;
        this.mesh.parent = this.parentMesh;
        this.mesh.scaling = new BABYLON.Vector3(0.3, 0.3, 0.3);
    }
    Player.prototype.move = function () {
        var nextspeed = BABYLON.Vector3.Zero();
        var v = 0.1;
        if (this.moveRight) {
            nextspeed.x = v;
        }
        if (this.moveLeft) {
            nextspeed.x = -v;
        }
        if (this.moveForward) {
            nextspeed.z = v;
        }
        if (this.moveBackward) {
            nextspeed.z = -v;
        }
        this.speed = BABYLON.Vector3.Lerp(this.speed, nextspeed, 0.1);
        this.parentMesh.moveWithCollisions(this.speed);
        if (this.rotateLeft) {
            this.mesh.rotation.y = -Math.PI / 4;
        }
        else if (this.rotateRight) {
            this.mesh.rotation.y = Math.PI / 4;
        }
        else {
            this.mesh.rotation.y = 0;
        }
        for (var i = 0; i < this.bullets.length; i++) {
            if (!this.bullets[i] || this.bullets[i] == undefined)
                continue;
            this.bullets[i].update();
        }
        for (var j = 0; j < this.grenades.length; j++) {
            if (!this.grenades[j] || this.grenades[j] == undefined)
                continue;
            this.grenades[j].update();
        }
    };
    Player.prototype.shoot = function () {
        var bulletId = this.bullets.length + 1;
        if (this.rotateLeft) {
            this.bullets[bulletId] = new Bullet(this.sceneRef, this, "left");
        }
        else if (this.rotateRight) {
            this.bullets[bulletId] = new Bullet(this.sceneRef, this, "right");
        }
        else {
            this.bullets[bulletId] = new Bullet(this.sceneRef, this, "straight");
        }
        this.bullets[bulletId].id = Utilities.GUID();
    };
    Player.prototype.throwGrenade = function () {
        var grenadeId = this.grenades.length + 1;
        if (this.rotateLeft) {
            this.grenades[grenadeId] = new Grenade(this.sceneRef, this, "left");
        }
        else if (this.rotateRight) {
            this.grenades[grenadeId] = new Grenade(this.sceneRef, this, "right");
        }
        else {
            this.grenades[grenadeId] = new Grenade(this.sceneRef, this, "straight");
        }
        this.grenades[grenadeId].id = Utilities.GUID();
    };
    Player.prototype.disposeBulletWithID = function (id) {
        for (var i = 0; i < this.bullets.length; i++) {
            if (!this.bullets[i] || this.bullets[i] == undefined)
                continue;
            if (this.bullets[i].id == id) {
                var bullet = this.bullets.splice(i, 1);
                bullet[0].mesh.dispose();
                bullet = null;
            }
        }
    };
    Player.prototype.disposeGrenadeWithID = function (id) {
        for (var i = 0; i < this.grenades.length; i++) {
            if (!this.grenades[i] || this.grenades[i] == undefined)
                continue;
            if (this.grenades[i].id == id) {
                var grenade = this.grenades.splice(i, 1);
                grenade[0].mesh.dispose();
                grenade = null;
            }
        }
    };
    return Player;
}());
