/// <reference path = "../lib/babylon.d.ts"/>

class Game
{
    private static instance: Game;

    private engine: BABYLON.Engine;
    public assets: Array<BABYLON.AbstractMesh>;
    public scene: BABYLON.Scene;
    public canvas: HTMLCanvasElement;

    public player:Player;
    public enemies: Array<Enemy>;

    private enemyXRange = 10;

    private playerSpeed = 0.1;

    public static SELF : number = 0;
    public static CLONE : number = 1;
    public static INSTANCE : number = 2;

    private GROUND_WIDTH = 30;
    private GROUND_HEIGHT = 500;

    private shadowGenerator;

    static getInstance()
    {
        return Game.instance;
    }

    constructor(canvasElement:string)
    {
        if (!Game.instance)
        {
            Game.instance = this;
        }

        this.canvas = <HTMLCanvasElement>document.getElementById(canvasElement);
        this.engine = new BABYLON.Engine(this.canvas, true);
        this.engine.enableOfflineSupport = false;

        this.assets = [];

        this.scene = null;

        this.enemies = [];

        window.addEventListener("resize", () => {
            this.engine.resize();
        });

        this.initScene();
    }

    private initScene()
    {
        this.scene = new BABYLON.Scene(this.engine);
        this.scene.clearColor = BABYLON.Color3.FromInts(0, 163, 136);
        this.scene.fogMode = BABYLON.Scene.FOGMODE_EXP2;
        this.scene.fogDensity = 0.02;
        this.scene.fogColor = new BABYLON.Color3(0.8, 0.83, 0.8);
        this.scene.collisionsEnabled = true;
        
        let camera = new BABYLON.ArcRotateCamera('FollowCam', 0, 0, 0, new BABYLON.Vector3(0, 0, 0), this.scene);
        camera.attachControl(this.engine.getRenderingCanvas());
        camera.setPosition(new BABYLON.Vector3(0, 30, -30));
        //camera.keysUp.push(87); // "w"
	    //camera.keysDown.push(83); // "s"
	    //camera.keysLeft.push(65); // "a"
	    //camera.keysRight.push(68); // "d"
        camera.wheelPrecision *= 10;
        /*
        let camera = new BABYLON.FollowCamera("FollowCam", BABYLON.Vector3.Zero(), this.scene);
        //camera.lockedTarget = myMeshObject;
        camera.radius = 20;
        camera.heightOffset = 30;
        camera.rotationOffset = 180;
        camera.cameraAcceleration = 0.05;
        camera.maxCameraSpeed = 20;
        //camera.position = new BABYLON.Vector3(5, 0, 0);
        */
        let light = new BABYLON.DirectionalLight('dirLight', new BABYLON.Vector3(-1, -2, 1), this.scene);
        //light.intensity = 1.25;
        light.specular = BABYLON.Color3.Black();
        light.position = new BABYLON.Vector3(-50, 50, 10);

        // var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), this.scene);
        // light.intensity = 0.7;

    	var lightSphere = BABYLON.Mesh.CreateSphere("sphere", 10, 2, this.scene);
    	lightSphere.position = light.position;
    	lightSphere.material = new BABYLON.StandardMaterial("light", this.scene);
    	(lightSphere.material as BABYLON.StandardMaterial).emissiveColor = new BABYLON.Color3(1, 1, 0);

        this.shadowGenerator = new BABYLON.ShadowGenerator(512, light);
        this.shadowGenerator.setDarkness(0.5);
    	this.shadowGenerator.usePoissonSampling = true;
    	this.shadowGenerator.useBlurExponentialShadowMap = true;
    	this.shadowGenerator.blurBoxOffset = 3.0;
    	this.shadowGenerator.bias = 0.00001;

        let loader = new Preloader(this);
        loader.callback = this.run.bind(this);
        loader.loadAssets();

        /*
        //Depth of field effect
        let lensEffect = new BABYLON.LensRenderingPipeline('lens', {
    		edge_blur: 1.0,
    		chromatic_aberration: 1.0,
    		distortion: 1.0,
    		dof_focus_distance: 50
    	}, this.scene, 1.0);

        this.scene.postProcessRenderPipelineManager.attachCamerasToRenderPipeline('lens', camera);
        */
    }

    private run()
    {
        this.scene.executeWhenReady(() => {

            // Remove loader
            var loader = <HTMLElement> document.querySelector("#splashscreen");
            loader.style.display = "none";

            this._init();

            this.engine.runRenderLoop(() => {
                this.scene.render();

                this.player.move();

                for (let i = 0; i < this.enemies.length; i++)
                {
                    if(BABYLON.Vector3.Distance(this.enemies[i].parentMesh.position, this.player.parentMesh.position) < 15)
                    {
                        this.enemies[i].parentMesh.lookAt(this.player.parentMesh.position);
                        this.enemies[i].canShoot = true;
                    }
                    else
                    {
                        this.enemies[i].canShoot = false;
                    }

                    this.enemies[i].move();
                }
            });

            this._runGame();
        });
    }

    private _init ()
    {
        this.scene.debugLayer.show();
        this.showAxis(15);
        this.prepWorld();

        window.addEventListener("keydown", this.onKeyDown.bind(this));
        window.addEventListener("keyup", this.onKeyUp.bind(this));
    }

    private prepWorld(assetToUse:Array<BABYLON.Mesh> = null)
    {
        let ground = BABYLON.Mesh.CreateGround("ground", this.GROUND_WIDTH, this.GROUND_HEIGHT, 2, this.scene);
        ground.receiveShadows = true;
        ground.position.z = this.GROUND_HEIGHT/2 - 20;
        ground.checkCollisions = true;

        this.player = new Player(this.scene, this.createAsset('Body', Game.SELF, 'Soldier'));
        this.shadowGenerator.getShadowMap().renderList.push(this.player.mesh);
        (this.scene.getCameraByID('FollowCam') as BABYLON.FollowCamera).lockedTarget = this.player.parentMesh;

        for (let i = 0; i < 10; i++)
        {
            let enemy = new Enemy(this.scene)
            this.enemies.push(enemy);
            enemy.parentMesh.name = "enemy" + i;
            enemy.parentMesh.id = Utilities.GUID();
            enemy.parentMesh.position.z = Math.random() * 150;
            enemy.parentMesh.position.x = Math.round(Math.random()) > 0.5 ? this.enemyXRange:-this.enemyXRange;
            this.shadowGenerator.getShadowMap().renderList.push(enemy.mesh);
        }

        for (let j = 0; j < 10; j++)
        {
            let rock = this.createAsset('rock0' + Math.round(Math.random() * 2), Game.INSTANCE, 'test' + j);
            rock.scaling = new BABYLON.Vector3(6, 6, 6);
            rock.position.x = 9;
            rock.position.z = j * 10;
            rock.ellipsoid = new BABYLON.Vector3(10, 10, 10);
            rock.checkCollisions = true;
            this.shadowGenerator.getShadowMap().renderList.push(rock);
        }
    }

    public createAsset(name:string, mode:number = Game.SELF, newName:string = '') : BABYLON.Mesh
    {
        let mesh : BABYLON.Mesh = <BABYLON.Mesh> this.scene.getMeshByName(name);

        let res = null;
        switch (mode)
        {
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
    }

    private _runGame()
    {

    }

    private onKeyDown(evt:KeyboardEvent)
    {
        if (evt.keyCode == 87)
        {
            //W
            this.player.moveForward = true;
            this.player.moveBackward = false;
        }

        if (evt.keyCode == 65)
        {
            //A
            this.player.moveLeft = true;
            this.player.moveRight = false;
        }

        if (evt.keyCode == 83)
        {
            //S
            this.player.moveForward = false;
            this.player.moveBackward = true;
        }

        if (evt.keyCode == 68)
        {
            //D
            this.player.moveRight = true;
            this.player.moveLeft = false;
        }

        if (evt.keyCode == 37)
        {
            //Left
            this.player.rotateLeft = true;
            this.player.rotateRight = false;
        }

        if (evt.keyCode == 39)
        {
            //Right
            this.player.rotateLeft = false;
            this.player.rotateRight = true;
        }

        if (evt.keyCode == 38)
        {
            //Up
            //this.player.shoot();
        }

        if (evt.keyCode == 40)
        {
            //Down
            //this.player.throwGrenade();
        }
    }

    private onKeyUp(evt:KeyboardEvent)
    {
        if (evt.keyCode == 87 || evt.keyCode == 83)
        {
            //W
            this.player.moveForward = false;
            this.player.moveBackward = false;
        }

        if (evt.keyCode == 65 || evt.keyCode == 68)
        {
            //A or D
            this.player.moveLeft = false;
            this.player.moveRight = false;
        }

        if (evt.keyCode == 37 || evt.keyCode == 39)
        {
            //Left or Right
            this.player.rotateLeft = false;
            this.player.rotateRight = false;
        }

        if (evt.keyCode == 38)
        {
            //Up
            this.player.shoot();
        }

        if (evt.keyCode == 40)
        {
            //Down
            this.player.throwGrenade();
        }
    }

    public disposeEnemy(enemyID:string)
    {
        for(let i = 0; i < this.enemies.length; i++)
        {
            if(this.enemies[i].parentMesh.id == enemyID)
            {
                let enemy = this.enemies.splice(i, 1);
                (enemy[0].parentMesh as BABYLON.Mesh).dispose();
                enemy = null;
            }
        }
    }

    private showAxis(size)
    {
        var axisX = BABYLON.Mesh.CreateLines("axisX", [
            BABYLON.Vector3.Zero(), new BABYLON.Vector3(size, 0, 0), new BABYLON.Vector3(size * 0.95, 0.05 * size, 0),
            new BABYLON.Vector3(size, 0, 0), new BABYLON.Vector3(size * 0.95, -0.05 * size, 0)
            ], this.scene);
        axisX.color = new BABYLON.Color3(1, 0, 0);

        var xChar = this.makeTextPlane("X", "red", size / 10);
        xChar.position = new BABYLON.Vector3(0.9 * size, -0.05 * size, 0);

        var axisY = BABYLON.Mesh.CreateLines("axisY", [
            BABYLON.Vector3.Zero(), new BABYLON.Vector3(0, size, 0), new BABYLON.Vector3( -0.05 * size, size * 0.95, 0),
            new BABYLON.Vector3(0, size, 0), new BABYLON.Vector3( 0.05 * size, size * 0.95, 0)
        ], this.scene);
        axisY.color = new BABYLON.Color3(0, 1, 0);

        var yChar = this.makeTextPlane("Y", "green", size / 10);
        yChar.position = new BABYLON.Vector3(0, 0.9 * size, -0.05 * size);

        var axisZ = BABYLON.Mesh.CreateLines("axisZ", [
            BABYLON.Vector3.Zero(), new BABYLON.Vector3(0, 0, size), new BABYLON.Vector3( 0 , -0.05 * size, size * 0.95),
            new BABYLON.Vector3(0, 0, size), new BABYLON.Vector3( 0, 0.05 * size, size * 0.95)
        ], this.scene);
        axisZ.color = new BABYLON.Color3(0, 0, 1);

        var zChar = this.makeTextPlane("Z", "blue", size / 10);
        zChar.position = new BABYLON.Vector3(0, 0.05 * size, 0.9 * size);
    }

    private makeTextPlane(text, color, size)
    {
        var dynamicTexture = new BABYLON.DynamicTexture("DynamicTexture", 50, this.scene, true);
        dynamicTexture.hasAlpha = true;
        dynamicTexture.drawText(text, 5, 40, "bold 36px Arial", color , "transparent", true);

        var plane = BABYLON.MeshBuilder.CreatePlane("TextPlane", {size: size}, this.scene);
        plane.material = new BABYLON.StandardMaterial("TextPlaneMaterial", this.scene);
        plane.material.backFaceCulling = false;
        (plane.material as BABYLON.StandardMaterial).specularColor = new BABYLON.Color3(0, 0, 0);
        (plane.material as BABYLON.StandardMaterial).diffuseTexture = dynamicTexture;
        return plane;
    }
}

window.addEventListener("DOMContentLoaded", () => {
    new Game('renderCanvas');
});
