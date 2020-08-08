var EnginePickup = function(id, x, y, type, amount, respawnTime){
	if (respawnTime > -1){
		x-=1;
		y-=1;
		x *= 75;
		y *= 75;
	}
	
	var self = {
		id:id,
		x:x,
		y:y,
		type:type,
		amount:amount,
		width:0,
		height:0,
		respawnTime: respawnTime, //Initialize this as -1 if the pickup is a non-respawning "one time drop" like from a fallen player
		respawnTimer: 0,
	}		
	if (self.type == 1){
		self.width = 41;
		self.height = 41;
	}
	else if (self.type == 2){
		self.width = 41;
		self.height = 41;
	}
	else if (self.type == 3){
		self.width = 67;
		self.height = 25;
	}
	else if (self.type == 4){
		self.width = 61;
		self.height = 32;
	}
	else if (self.type == 5){
		self.width = 41;
		self.height = 56;
	}
	else if (self.type == 6){
		self.width = 0;
		self.height = 0;
	}

	if (respawnTime > -1){
		self.x += (75/2) - self.width/2;
		self.y += (75/2) - self.height/2;
	}	
	EnginePickup.list[self.id] = self;
	updatePickupList.push(self);
}//End Pickup Function
EnginePickup.list = [];

var pickupPickup = function(player, pickupId){

	if (EnginePickup.list[pickupId].type == 1){ //MD
		if (player.health < 100){
			player.health += EnginePickup.list[pickupId].amount;
			if (player.health > 100){
				player.health = 100;
			}
			updatePlayerList.push({id:player.id,property:"health",value:player.health});											
			SOCKET_LIST[player.id].emit('sfx', "sfxHealthPackGrab");
			removePickup(pickupId);
		}
		else {
			return;
		}
	}
	else if (EnginePickup.list[pickupId].type == 2){ //DP
		if (player.holdingBag == false && player.weapon == 1){
			if (player.reloading > 0){
				player.reloading = 0;
				updatePlayerList.push({id:player.id,property:"reloading",value:player.reloading});				
			}
			player.weapon = 2;
			updatePlayerList.push({id:player.id,property:"weapon",value:player.weapon});	
		}
		else {
			SOCKET_LIST[player.id].emit('sfx', "sfxDPEquip");
		}
		if (player.DPClip <= 0 && player.DPAmmo <= 0){
			if (EnginePickup.list[pickupId].amount <= DPClipSize){
				player.DPClip += EnginePickup.list[pickupId].amount;				
			}
			else {
				player.DPClip += DPClipSize;
				player.DPAmmo += EnginePickup.list[pickupId].amount - DPClipSize;
				if (player.DPAmmo > maxDPAmmo){player.DPAmmo = maxDPAmmo;}
			}
			updatePlayerList.push({id:player.id,property:"DPClip",value:player.DPClip});								
			updatePlayerList.push({id:player.id,property:"DPAmmo",value:player.DPAmmo});								
		}
		else {
			player.DPAmmo += EnginePickup.list[pickupId].amount;
			if (player.DPAmmo > maxDPAmmo){player.DPAmmo = maxDPAmmo;}
			updatePlayerList.push({id:player.id,property:"DPAmmo",value:player.DPAmmo});								
		}	
		removePickup(pickupId);		
	}
	else if (EnginePickup.list[pickupId].type == 3){ //MG
		if (player.holdingBag == false && player.weapon == 1){
			if (player.reloading > 0){
				player.reloading = 0;
				updatePlayerList.push({id:player.id,property:"reloading",value:player.reloading});				
			}
			player.weapon = 3;
			updatePlayerList.push({id:player.id,property:"weapon",value:player.weapon});	
		}
		else {
			SOCKET_LIST[player.id].emit('sfx', "sfxMGEquip");
		}
		if (player.MGClip <= 0 && player.MGAmmo <= 0){
			if (EnginePickup.list[pickupId].amount <= MGClipSize){
				player.MGClip += EnginePickup.list[pickupId].amount;				
			}
			else {
				player.MGClip += MGClipSize;
				player.MGAmmo += EnginePickup.list[pickupId].amount - MGClipSize;
				if (player.MGAmmo > maxMGAmmo){player.MGAmmo = maxMGAmmo;}
			}
			updatePlayerList.push({id:player.id,property:"MGClip",value:player.MGClip});								
			updatePlayerList.push({id:player.id,property:"MGAmmo",value:player.MGAmmo});								
		}
		else {
			player.MGAmmo += EnginePickup.list[pickupId].amount;
			if (player.MGAmmo > maxMGAmmo){player.MGAmmo = maxMGAmmo;}
			updatePlayerList.push({id:player.id,property:"MGAmmo",value:player.MGAmmo});								
		}	
		removePickup(pickupId);		
	}
	else if (EnginePickup.list[pickupId].type == 4){ //SG
		if (player.holdingBag == false && player.weapon == 1){
			if (player.reloading > 0){
				player.reloading = 0;
				updatePlayerList.push({id:player.id,property:"reloading",value:player.reloading});				
			}
			player.weapon = 4;
			updatePlayerList.push({id:player.id,property:"weapon",value:player.weapon});	
		}
		else { //because the sfx will already trigger automatically clientside if switching weapons to SG
			SOCKET_LIST[player.id].emit('sfx', "sfxSGEquip");
		}
		if (player.SGClip <= 0 && player.SGAmmo <= 0){
			if (EnginePickup.list[pickupId].amount <= SGClipSize){
				player.SGClip += EnginePickup.list[pickupId].amount;				
			}
			else {
				player.SGClip += SGClipSize;
				player.SGAmmo += EnginePickup.list[pickupId].amount - SGClipSize;
				if (player.SGAmmo > maxSGAmmo){player.SGAmmo = maxSGAmmo;}
			}
			updatePlayerList.push({id:player.id,property:"SGClip",value:player.SGClip});								
			updatePlayerList.push({id:player.id,property:"SGAmmo",value:player.SGAmmo});								
		}
		else {
			player.SGAmmo += EnginePickup.list[pickupId].amount;
			if (player.SGAmmo > maxSGAmmo){player.SGAmmo = maxSGAmmo;}
			updatePlayerList.push({id:player.id,property:"SGAmmo",value:player.SGAmmo});								
		}		
		removePickup(pickupId);		
	}
	else if (EnginePickup.list[pickupId].type == 5 && player.health <= 100){ //BA
		player.health = 100 + EnginePickup.list[pickupId].amount;
		if (player.health > playerMaxHealth){
			player.health = playerMaxHealth;
		}
		updatePlayerList.push({id:player.id,property:"health",value:player.health});											
		SOCKET_LIST[player.id].emit('sfx', "sfxBagGrab");
		removePickup(pickupId);
	}
	
	
}

var removePickup = function(pickupId){
	if (EnginePickup.list[pickupId].respawnTime == -1){
		delete EnginePickup.list[pickupId];
	}
	else {
		EnginePickup.list[pickupId].respawnTimer = EnginePickup.list[pickupId].respawnTime;
	}
	updatePickupList.push(pickupId);
}

var getPickupList = function(){
	var pickupList = [];
	for (var p in EnginePickup.list){
		pickupList.push(EnginePickup.list[p]);
	}
    return pickupList;
}

var getPickupById = function(id){
    return EnginePickup.list[id];
}

var createPickup = function(id, x, y, type, amount, respawn){
	EnginePickup(id, x, y, type, amount, respawn);
}

var clearPickupList = function(){
	EnginePickup.list = [];
}

var clockTick = function(){
	for (var i in EnginePickup.list){
		if (EnginePickup.list[i].respawnTime > -1 && gameOver == false){				
			if (EnginePickup.list[i].respawnTimer > 0){
				EnginePickup.list[i].respawnTimer--;
				updatePickupList.push(EnginePickup.list[i]);
			} else if (EnginePickup.list[i].respawnTimer < 0){EnginePickup.list[i].respawnTimer = 0;} //Ignore this. This should never be triggered.
		}
	}	
}

var checkForPickup = function(player){
	for (var i in EnginePickup.list){
		if (player.health > 0 && player.x > EnginePickup.list[i].x - 30 && player.x < EnginePickup.list[i].x + EnginePickup.list[i].width + 30 && player.y > EnginePickup.list[i].y - 30 && player.y < EnginePickup.list[i].y + EnginePickup.list[i].height + 30 && EnginePickup.list[i].respawnTimer == 0){
			pickupPickup(player, EnginePickup.list[i].id);
		}
	}			
}

if(typeof exports == 'undefined'){
}
else {
	module.exports.pickupPickup = pickupPickup;
	module.exports.getPickupList = getPickupList;
	module.exports.getPickupById = getPickupById;
	module.exports.createPickup = createPickup;
	module.exports.clearPickupList = clearPickupList;
	module.exports.clockTick = clockTick;
	module.exports.checkForPickup = checkForPickup;
}