var Grenade = (function () {
    function Grenade(scene, parent, direction) {
        this.id = '';
        this.limit = 150;
        this.speed = 1;
        this.damage = 10;
        this.points = [];
        this.pointPlotter = 0;
        this.sceneRef = scene;
        this.parentMesh = parent.parentMesh;
        this.entityDirection = direction;
        this.parent = parent;
        this.mesh = BABYLON.MeshBuilder.CreateSphere('grenade', { segments: 3, diameterX: 0.25, diameterY: 0.25, diameterZ: 0.5 }, scene);
        this.mesh.position = this.parentMesh.getAbsolutePosition().clone();
        this.mesh.position.y = 1;
        this.mesh.material = new BABYLON.StandardMaterial('texture1', scene);
        this.mesh.material.diffuseColor = new BABYLON.Color3(3, 0, 0);
        for (var i = 0; i < this.limit + 1; i++) {
            if (this.entityDirection == "left") {
                this.points.push(new BABYLON.Vector3(this.parent.parentMesh.position.x - i / 15, 8 * Math.sin(i * Math.PI / this.limit), this.parent.parentMesh.position.z + i / 20));
            }
            else if (this.entityDirection == "right") {
                this.points.push(new BABYLON.Vector3(this.parent.parentMesh.position.x + i / 15, 8 * Math.sin(i * Math.PI / this.limit), this.parent.parentMesh.position.z + i / 20));
            }
            else if (this.entityDirection == "straight") {
                this.points.push(new BABYLON.Vector3(this.parent.parentMesh.position.x, 10 * Math.sin(i * Math.PI / this.limit), this.parent.parentMesh.position.z + i / 10));
            }
        }
    }
    Grenade.prototype.update = function () {
        this.mesh.rotation.x += 0.1;
        this.mesh.rotation.y += 0.2;
        this.mesh.rotation.z += 0.1;
        if (this.pointPlotter < this.points.length - 1) {
            this.pointPlotter++;
            this.mesh.position.x = this.points[this.pointPlotter].x;
            this.mesh.position.y = this.points[this.pointPlotter].y;
            this.mesh.position.z = this.points[this.pointPlotter].z;
        }
        else {
            this.parent.disposeGrenadeWithID(this.id);
        }
    };
    return Grenade;
}());
