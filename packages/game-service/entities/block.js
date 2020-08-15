var block = {};

var EngineBlock = function(x, y, width, height, type){	
	x *= 75;
	y *= 75;
	width *= 75;
	height *= 75;

	var self = {
		id:Math.random(),
		x:x,
		y:y,
		width:width,
		height:height,
		type:type,
	}		

	self.hit = function(shootingDir, distance, shooter, targetDistance){
		if (shooter.weapon != 4){
			var shotData = {};
			shotData.id = shooter.id;
			shotData.spark = false;
			shotData.shootingDir = shootingDir;
			if (!self.team){shotData.spark = true;}
			if (shootingDir % 2 == 0){
				shotData.distance = distance * 1.42 - 42;
			}
			else {
				shotData.distance = distance - 42;
			}
			if (shotData.distance < 0){shotData.distance = 1;}	
			for(var i in SOCKET_LIST){
				SOCKET_LIST[i].emit('shootUpdate',shotData);
			}
		}
	}
	EngineBlock.list[self.id] = self;
}//End Block Function
EngineBlock.list = [];

var getBlockList = function(){
	var blockList = [];
	for (var b in EngineBlock.list){
		blockList.push(EngineBlock.list[b]);
	}
    return blockList;
}

var getBlockById = function(id){
    return EngineBlock.list[id];
}

var createBlock = function(x, y, width, height, type){
	EngineBlock(x, y, width, height, type);
}

var clearBlockList = function(){
	EngineBlock.list = [];
}

var isSafeCoords = function(potentialX, potentialY){
	for (var i in EngineBlock.list){
		if (potentialX >= EngineBlock.list[i].x && potentialX <= EngineBlock.list[i].x + EngineBlock.list[i].width && potentialY >= EngineBlock.list[i].y && potentialY <= EngineBlock.list[i].y + EngineBlock.list[i].height){																		
			return false;
		}					
	}
	return true;
}

if(typeof exports == 'undefined'){
	block.getBlockList = getBlockList;
	block.getBlockById = getBlockById;
	block.createBlock = createBlock;
	block.clearBlockList = clearBlockList;
	block.isSafeCoords = isSafeCoords;
}
else {
	module.exports.getBlockList = getBlockList;
	module.exports.getBlockById = getBlockById;
	module.exports.createBlock = createBlock;
	module.exports.clearBlockList = clearBlockList;
	module.exports.isSafeCoords = isSafeCoords;
}