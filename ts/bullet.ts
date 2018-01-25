class Bullet
{
    public id = '';

    private parent;

    public mesh:BABYLON.Mesh;

    private sceneRef:BABYLON.Scene;

    private entityDirection;
    private newVec;

    private limit = 50;
    private speed = 1;
    private damage = 10;

    constructor(scene:BABYLON.Scene, parent:any, direction:string)
    {
        this.sceneRef = scene;
        this.entityDirection = direction;
        this.parent = parent;

        this.mesh = BABYLON.Mesh.CreateSphere('bullet', 3, 0.5, scene);
		this.mesh.position = this.parent.parentMesh.getAbsolutePosition().clone();
		this.mesh.position.y = 1;

        this.mesh.material = new BABYLON.StandardMaterial('texture1', scene);
		(this.mesh.material as BABYLON.StandardMaterial).diffuseColor = new BABYLON.Color3(3, 2, 0);

        if(this.entityDirection == "left")
        {
            this.newVec = new BABYLON.Vector3(this.parent.parentMesh.position.x - this.limit, this.parent.parentMesh.position.y, this.parent.parentMesh.position.z + this.limit);
        }
        else if(this.entityDirection == "right")
        {
            this.newVec = new BABYLON.Vector3(this.parent.parentMesh.position.x + this.limit, this.parent.parentMesh.position.y, this.parent.parentMesh.position.z + this.limit);
        }
        else if(this.entityDirection == "straight")
        {
            if(this.parent instanceof Player)
            {
                this.newVec = new BABYLON.Vector3(this.parent.parentMesh.position.x, this.parent.parentMesh.position.y, this.parent.parentMesh.position.z + this.limit);
            }
            else if(this.parent instanceof Enemy)
            {
                if(this.parent.parentMesh.position.x < Game.getInstance().player.parentMesh.position.x)
                {
                    //Enemy is to the left of the player
                    this.newVec = new BABYLON.Vector3(Game.getInstance().player.parentMesh.position.x, Game.getInstance().player.parentMesh.position.y, Game.getInstance().player.parentMesh.position.z);
                }
                else if(this.parent.parentMesh.position.x > Game.getInstance().player.parentMesh.position.x)
                {
                    //Enemy is to the right of the player
                    this.newVec = new BABYLON.Vector3(Game.getInstance().player.parentMesh.position.x, Game.getInstance().player.parentMesh.position.y, Game.getInstance().player.parentMesh.position.z);
                }
            }
        }
    }

    update ()
    {
        if (!this.facePoint(this.mesh, this.newVec))
        {
        	this.moveToTarget(this.mesh, this.newVec);
        }

        if(this.parent.parentMesh.name == "player")
        {
            for (var j = 0; j < Game.getInstance().enemies.length; j++)
            {
                if(this.mesh.intersectsMesh(Game.getInstance().enemies[j].mesh, false))
                {
                    (this.parent as Player).disposeBulletWithID(this.id);

                    Game.getInstance().enemies[j].reduceHealth(this.damage);
                }
            }
        }
        else if(this.parent.parentMesh.name == "enemy")
        {

        }
    }

    facePoint(rotatingObject, pointToRotateTo)
    {
		var direction = pointToRotateTo.subtract(rotatingObject.position);

		var v1 = new BABYLON.Vector3(0, 0, 1);
		var v2 = direction;

		var angle = Math.acos(BABYLON.Vector3.Dot(v1, v2.normalize()));

		if (direction.x < 0)
            angle = angle * -1;

		var angleDegrees = Math.round(angle * 180/Math.PI);
		var playerRotationDegress = Math.round(rotatingObject.rotation.y * 180/Math.PI);

		var deltaDegrees = playerRotationDegress - angleDegrees;

		if(deltaDegrees > 180)
        {
			deltaDegrees = deltaDegrees - 360;
		}
        else if(deltaDegrees < -180)
        {
			deltaDegrees = deltaDegrees + 360;
		}

		if (Math.abs(deltaDegrees) > 3)
        {
			var rotationSpeed = Math.round(Math.abs(deltaDegrees) / 2);

			if (deltaDegrees > 0)
            {
				rotatingObject.rotation.y -= rotationSpeed * Math.PI / 180;
				if (rotatingObject.rotation.y < -Math.PI)
                {
					rotatingObject.rotation.y = Math.PI;
				}
			}

			if (deltaDegrees < 0)
            {
				rotatingObject.rotation.y += rotationSpeed * Math.PI / 180;
				if (rotatingObject.rotation.y > Math.PI)
                {
					rotatingObject.rotation.y = -Math.PI;
				}
			}

			return true;
		}
        else
        {
            return false;
		}
	}

    moveToTarget(objectToMove, pointToMoveTo)
    {
		var moveVector = pointToMoveTo.subtract(objectToMove.position);

		if(moveVector.length() > 1)
        {
			moveVector = moveVector.normalize();
			moveVector = moveVector.scale(this.speed);
            objectToMove.position.addInPlace(moveVector);
		}
        else
        {
            this.parent.disposeBulletWithID(this.id);
		}
	}
}
