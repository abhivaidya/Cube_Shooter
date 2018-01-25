class Grenade
{
    public id = '';

    private parentMesh;
    private parent;

    public mesh:BABYLON.Mesh;

    private sceneRef:BABYLON.Scene;

    private entityDirection;
    private newVec;

    private limit = 150;
    private speed = 1;
    private damage = 10;

    private points = [];

    private pointPlotter = 0;

    constructor(scene:BABYLON.Scene, parent:any, direction:string)
    {
        this.sceneRef = scene;
        this.parentMesh = parent.parentMesh;
        this.entityDirection = direction;
        this.parent = parent;

        this.mesh = BABYLON.MeshBuilder.CreateSphere('grenade', {segments:3, diameterX:0.25, diameterY:0.25, diameterZ:0.5}, scene);
		this.mesh.position = this.parentMesh.getAbsolutePosition().clone();
		this.mesh.position.y = 1;

        this.mesh.material = new BABYLON.StandardMaterial('texture1', scene);
		(this.mesh.material as BABYLON.StandardMaterial).diffuseColor = new BABYLON.Color3(3, 0, 0);

        for (var i = 0; i < this.limit + 1; i++)
        {
            if(this.entityDirection == "left")
            {
                this.points.push( new BABYLON.Vector3(this.parent.parentMesh.position.x - i/15, 8 * Math.sin(i * Math.PI/this.limit), this.parent.parentMesh.position.z + i/20));
            }
            else if(this.entityDirection == "right")
            {
                this.points.push( new BABYLON.Vector3(this.parent.parentMesh.position.x + i/15, 8 * Math.sin(i * Math.PI/this.limit), this.parent.parentMesh.position.z + i/20));
            }
            else if(this.entityDirection == "straight")
            {
                this.points.push( new BABYLON.Vector3(this.parent.parentMesh.position.x, 10 * Math.sin(i * Math.PI/this.limit), this.parent.parentMesh.position.z + i/10));
            }
        }

        //var track = BABYLON.MeshBuilder.CreateLines('track', {points: this.points}, scene);
        //track.color = new BABYLON.Color3(0, 0, 0);
    }

    update()
    {
        this.mesh.rotation.x += 0.1;
        this.mesh.rotation.y += 0.2;
        this.mesh.rotation.z += 0.1;

        if(this.pointPlotter < this.points.length - 1)
        {
            this.pointPlotter++;

            this.mesh.position.x = this.points[this.pointPlotter].x;
            this.mesh.position.y = this.points[this.pointPlotter].y;
            this.mesh.position.z = this.points[this.pointPlotter].z;
        }
        else
        {
            this.parent.disposeGrenadeWithID(this.id);
        }
    }
}
