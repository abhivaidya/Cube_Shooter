var Game = (function () {
    function Game(canvasElement) {
        var _this = this;
        this.enemyXRange = 10;
        this.playerSpeed = 0.1;
        this.GROUND_WIDTH = 30;
        this.GROUND_HEIGHT = 500;
        if (!Game.instance) {
            Game.instance = this;
        }
        this.canvas = document.getElementById(canvasElement);
        this.engine = new BABYLON.Engine(this.canvas, true);
        this.engine.enableOfflineSupport = false;
        this.assets = [];
        this.scene = null;
        this.enemies = [];
        window.addEventListener("resize", function () {
            _this.engine.resize();
        });
        this.initScene();
    }
    Game.getInstance = function () {
        return Game.instance;
    };
    Game.prototype.initScene = function () {
        this.scene = new BABYLON.Scene(this.engine);
        this.scene.clearColor = BABYLON.Color3.FromInts(0, 163, 136);
        this.scene.fogMode = BABYLON.Scene.FOGMODE_EXP2;
        this.scene.fogDensity = 0.02;
        this.scene.fogColor = new BABYLON.Color3(0.8, 0.83, 0.8);
        this.scene.collisionsEnabled = true;
        var camera = new BABYLON.ArcRotateCamera('FollowCam', 0, 0, 0, new BABYLON.Vector3(0, 0, 0), this.scene);
        camera.attachControl(this.engine.getRenderingCanvas());
        camera.setPosition(new BABYLON.Vector3(0, 30, -30));
        camera.wheelPrecision *= 10;
        var light = new BABYLON.DirectionalLight('dirLight', new BABYLON.Vector3(-1, -2, 1), this.scene);
        light.specular = BABYLON.Color3.Black();
        light.position = new BABYLON.Vector3(-50, 50, 10);
        var lightSphere = BABYLON.Mesh.CreateSphere("sphere", 10, 2, this.scene);
        lightSphere.position = light.position;
        lightSphere.material = new BABYLON.StandardMaterial("light", this.scene);
        lightSphere.material.emissiveColor = new BABYLON.Color3(1, 1, 0);
        this.shadowGenerator = new BABYLON.ShadowGenerator(512, light);
        this.shadowGenerator.setDarkness(0.5);
        this.shadowGenerator.usePoissonSampling = true;
        this.shadowGenerator.useBlurExponentialShadowMap = true;
        this.shadowGenerator.blurBoxOffset = 3.0;
        this.shadowGenerator.bias = 0.00001;
        var loader = new Preloader(this);
        loader.callback = this.run.bind(this);
        loader.loadAssets();
    };
    Game.prototype.run = function () {
        var _this = this;
        this.scene.executeWhenReady(function () {
            var loader = document.querySelector("#splashscreen");
            loader.style.display = "none";
            _this._init();
            _this.engine.runRenderLoop(function () {
                _this.scene.render();
                _this.player.move();
                for (var i = 0; i < _this.enemies.length; i++) {
                    if (BABYLON.Vector3.Distance(_this.enemies[i].parentMesh.position, _this.player.parentMesh.position) < 15) {
                        _this.enemies[i].parentMesh.lookAt(_this.player.parentMesh.position);
                        _this.enemies[i].canShoot = true;
                    }
                    else {
                        _this.enemies[i].canShoot = false;
                    }
                    _this.enemies[i].move();
                }
            });
            _this._runGame();
        });
    };
    Game.prototype._init = function () {
        this.scene.debugLayer.show();
        this.showAxis(15);
        this.prepWorld();
        window.addEventListener("keydown", this.onKeyDown.bind(this));
        window.addEventListener("keyup", this.onKeyUp.bind(this));
    };
    Game.prototype.prepWorld = function (assetToUse) {
        if (assetToUse === void 0) { assetToUse = null; }
        var ground = BABYLON.Mesh.CreateGround("ground", this.GROUND_WIDTH, this.GROUND_HEIGHT, 2, this.scene);
        ground.receiveShadows = true;
        ground.position.z = this.GROUND_HEIGHT / 2 - 20;
        ground.checkCollisions = true;
        this.player = new Player(this.scene, this.createAsset('Body', Game.SELF, 'Soldier'));
        this.shadowGenerator.getShadowMap().renderList.push(this.player.mesh);
        this.scene.getCameraByID('FollowCam').lockedTarget = this.player.parentMesh;
        for (var i = 0; i < 10; i++) {
            var enemy = new Enemy(this.scene);
            this.enemies.push(enemy);
            enemy.parentMesh.name = "enemy" + i;
            enemy.parentMesh.id = Utilities.GUID();
            enemy.parentMesh.position.z = Math.random() * 150;
            enemy.parentMesh.position.x = Math.round(Math.random()) > 0.5 ? this.enemyXRange : -this.enemyXRange;
            this.shadowGenerator.getShadowMap().renderList.push(enemy.mesh);
        }
        for (var j = 0; j < 10; j++) {
            var rock = this.createAsset('rock0' + Math.round(Math.random() * 2), Game.INSTANCE, 'test' + j);
            rock.scaling = new BABYLON.Vector3(6, 6, 6);
            rock.position.x = 9;
            rock.position.z = j * 10;
            rock.ellipsoid = new BABYLON.Vector3(10, 10, 10);
            rock.checkCollisions = true;
            this.shadowGenerator.getShadowMap().renderList.push(rock);
        }
    };
    Game.prototype.createAsset = function (name, mode, newName) {
        if (mode === void 0) { mode = Game.SELF; }
        if (newName === void 0) { newName = ''; }
        var mesh = this.scene.getMeshByName(name);
        var res = null;
        switch (mode) {
            case Game.SELF:
                res = mesh;
                mesh.setEnabled(true);
                break;
            case Game.CLONE:
                res = mesh.clone(newName);
                break;
            case Game.INSTANCE:
                res = mesh.createInstance(newName);
                break;
        }
        return res;
    };
    Game.prototype._runGame = function () {
    };
    Game.prototype.onKeyDown = function (evt) {
        if (evt.keyCode == 87) {
            this.player.moveForward = true;
            this.player.moveBackward = false;
        }
        if (evt.keyCode == 65) {
            this.player.moveLeft = true;
            this.player.moveRight = false;
        }
        if (evt.keyCode == 83) {
            this.player.moveForward = false;
            this.player.moveBackward = true;
        }
        if (evt.keyCode == 68) {
            this.player.moveRight = true;
            this.player.moveLeft = false;
        }
        if (evt.keyCode == 37) {
            this.player.rotateLeft = true;
            this.player.rotateRight = false;
        }
        if (evt.keyCode == 39) {
            this.player.rotateLeft = false;
            this.player.rotateRight = true;
        }
        if (evt.keyCode == 38) {
        }
        if (evt.keyCode == 40) {
        }
    };
    Game.prototype.onKeyUp = function (evt) {
        if (evt.keyCode == 87 || evt.keyCode == 83) {
            this.player.moveForward = false;
            this.player.moveBackward = false;
        }
        if (evt.keyCode == 65 || evt.keyCode == 68) {
            this.player.moveLeft = false;
            this.player.moveRight = false;
        }
        if (evt.keyCode == 37 || evt.keyCode == 39) {
            this.player.rotateLeft = false;
            this.player.rotateRight = false;
        }
        if (evt.keyCode == 38) {
            this.player.shoot();
        }
        if (evt.keyCode == 40) {
            this.player.throwGrenade();
        }
    };
    Game.prototype.disposeEnemy = function (enemyID) {
        for (var i = 0; i < this.enemies.length; i++) {
            if (this.enemies[i].parentMesh.id == enemyID) {
                var enemy = this.enemies.splice(i, 1);
                enemy[0].parentMesh.dispose();
                enemy = null;
            }
        }
    };
    Game.prototype.showAxis = function (size) {
        var axisX = BABYLON.Mesh.CreateLines("axisX", [
            BABYLON.Vector3.Zero(), new BABYLON.Vector3(size, 0, 0), new BABYLON.Vector3(size * 0.95, 0.05 * size, 0),
            new BABYLON.Vector3(size, 0, 0), new BABYLON.Vector3(size * 0.95, -0.05 * size, 0)
        ], this.scene);
        axisX.color = new BABYLON.Color3(1, 0, 0);
        var xChar = this.makeTextPlane("X", "red", size / 10);
        xChar.position = new BABYLON.Vector3(0.9 * size, -0.05 * size, 0);
        var axisY = BABYLON.Mesh.CreateLines("axisY", [
            BABYLON.Vector3.Zero(), new BABYLON.Vector3(0, size, 0), new BABYLON.Vector3(-0.05 * size, size * 0.95, 0),
            new BABYLON.Vector3(0, size, 0), new BABYLON.Vector3(0.05 * size, size * 0.95, 0)
        ], this.scene);
        axisY.color = new BABYLON.Color3(0, 1, 0);
        var yChar = this.makeTextPlane("Y", "green", size / 10);
        yChar.position = new BABYLON.Vector3(0, 0.9 * size, -0.05 * size);
        var axisZ = BABYLON.Mesh.CreateLines("axisZ", [
            BABYLON.Vector3.Zero(), new BABYLON.Vector3(0, 0, size), new BABYLON.Vector3(0, -0.05 * size, size * 0.95),
            new BABYLON.Vector3(0, 0, size), new BABYLON.Vector3(0, 0.05 * size, size * 0.95)
        ], this.scene);
        axisZ.color = new BABYLON.Color3(0, 0, 1);
        var zChar = this.makeTextPlane("Z", "blue", size / 10);
        zChar.position = new BABYLON.Vector3(0, 0.05 * size, 0.9 * size);
    };
    Game.prototype.makeTextPlane = function (text, color, size) {
        var dynamicTexture = new BABYLON.DynamicTexture("DynamicTexture", 50, this.scene, true);
        dynamicTexture.hasAlpha = true;
        dynamicTexture.drawText(text, 5, 40, "bold 36px Arial", color, "transparent", true);
        var plane = BABYLON.MeshBuilder.CreatePlane("TextPlane", { size: size }, this.scene);
        plane.material = new BABYLON.StandardMaterial("TextPlaneMaterial", this.scene);
        plane.material.backFaceCulling = false;
        plane.material.specularColor = new BABYLON.Color3(0, 0, 0);
        plane.material.diffuseTexture = dynamicTexture;
        return plane;
    };
    return Game;
}());
Game.SELF = 0;
Game.CLONE = 1;
Game.INSTANCE = 2;
window.addEventListener("DOMContentLoaded", function () {
    new Game('renderCanvas');
});
