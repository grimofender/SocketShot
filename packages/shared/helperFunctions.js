

var removeCognitoSubFromArray = function(incomingUsers, cognitoSub){
	var updatedIncomingUsers = [];
	
	for (var u = 0; u < incomingUsers.length; u++){
		if (typeof incomingUsers[u].cognitoSub != 'undefined' && incomingUsers[u].cognitoSub != cognitoSub){
			updatedIncomingUsers.push(incomingUsers[u]);
		}
	}
	
	return updatedIncomingUsers;
}

var getSocketIdFromCognitoSub = function(cognitoSub){
	for(var s in SOCKET_LIST){
		if (SOCKET_LIST[s].cognitoSub == cognitoSub){
			return 	SOCKET_LIST[s].id;
		}
	}	
	return false;
}

var getCurrentPlayersFromUsers = function(users){
	var players = [];
	
	if (typeof users === "undefined"){
		return players;
	}
	
	for (var u = 0; u < users.length; u++){
		if (users[u].team){
			players.push(users[u]);
		}
	}
	return players;
}

var removeIndexesFromArray = function(array, indexes){
	for (var i = indexes.length-1; i >= 0; i--){
		array.splice(indexes[i],1);
	}
	return array;
}

var comparePartySize = function(a,b) { //order
  if (a.partySize < b.partySize)
    return 1;
  if (a.partySize > b.partySize)
    return -1;
  return 0;
}

var comparePartySizeAsc = function(a,b) { //order
  if (a.partySize > b.partySize)
    return 1;
  if (a.partySize < b.partySize)
    return -1;
  return 0;
}

var compareCurrentPlayerSize = function(a,b) { //order
	var aCurrentPlayers = getCurrentPlayersFromUsers(a.currentUsers).length;
	var bCurrentPlayers = getCurrentPlayersFromUsers(b.currentUsers).length;
	
	var aPort = a.url.substring(a.url.length - 4);
	var bPort = b.url.substring(b.url.length - 4);
	
	
  if (aCurrentPlayers < bCurrentPlayers)
    return 1;
  else if (aCurrentPlayers > bCurrentPlayers)
    return -1;
  else if (aPort < bPort)
    return -1;
  else if (aPort > bPort)
    return 1;
  else
	return 0;
}

var numberWithCommas = function(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

var getProgressBarPercentage = function(value, floor, ceiling){
	value -= floor;
	ceiling -= floor;	
	return Math.round((value/ceiling) * 1000) / 1000;
}

var getFullRankName = function(rank){
	switch(rank) {
		case "bronze1":
			return "Bronze I";
		case "bronze2":
			return "Bronze II";
		case "bronze3":
			return "Bronze III";
		case "silver1":
			return "Silver I";
		case "silver2":
			return "Silver II";
		case "silver3":
			return "Silver III";
		case "gold1":
			return "Gold I";
		case "gold2":
			return "Gold II";
		case "gold3":
			return "Gold III";
		case "diamond":
			return "Diamond";
		case "diamond2":
			return "Super Diamond";
		default:
			return "Bronze I";
	}
}



var checkIfBlocking = function(object, pointA, pointB){
	//intersect with top side of block?
	if (line_intersects(pointA.x, pointA.y, pointB.x, pointB.y, object.x, object.y, (object.x + object.width), object.y)){
		return true;
	}
	//intersect with bottom side of block?
	else if (line_intersects(pointA.x, pointA.y, pointB.x, pointB.y, object.x, (object.y + object.height), (object.x + object.width), (object.y + object.height))){
		return true;
	}
	//intersect with left side of block?
	else if (line_intersects(pointA.x, pointA.y, pointB.x, pointB.y, object.x, object.y, object.x, (object.y + object.height))){
		return true;
	}
	//intersect with right side of block?
	else if (line_intersects(pointA.x, pointA.y, pointB.x, pointB.y, (object.x + object.width), object.y, (object.x + object.width), (object.y + object.height))){
		return true;
	}
	//intersect with mid x axis of block? //for glitch where SG shoots through blocks if shooter & target are both up against block
	if (line_intersects(pointA.x, pointA.y, pointB.x, pointB.y, object.x, (object.y + object.height/2), (object.x + object.width), (object.y + object.height/2))){
		return true;
	}
	//intersect with mid y axis of block? //for glitch where SG shoots through blocks if shooter & target are both up against block
	else if (line_intersects(pointA.x, pointA.y, pointB.x, pointB.y, (object.x + object.width/2), object.y, (object.x + object.width/2), (object.y + object.height))){
		return true;
	}
	return false;
}

var line_intersects = function(p0_x, p0_y, p1_x, p1_y, p2_x, p2_y, p3_x, p3_y) {

    var s1_x, s1_y, s2_x, s2_y;
    s1_x = p1_x - p0_x;
    s1_y = p1_y - p0_y;
    s2_x = p3_x - p2_x;
    s2_y = p3_y - p2_y;

    var s, t;
    s = (-s1_y * (p0_x - p2_x) + s1_x * (p0_y - p2_y)) / (-s2_x * s1_y + s1_x * s2_y);
    t = ( s2_x * (p0_y - p2_y) - s2_y * (p0_x - p2_x)) / (-s2_x * s1_y + s1_x * s2_y);

    if (s > 0 && s < 1 && t > 0 && t < 1)
    {
        return true;
    }
	
    return false; // No collision
}

var isNumBetween = function(numBetween, num1, num2){
	if (num1 <= numBetween && numBetween <= num2){
		return true;
	}
	else if (num1 >= numBetween && numBetween >= num2){
		return true;
	}
	return false
}

var randomInt = function(min,max)
{
    return Math.floor(Math.random()*(max-min+1)+min);
}

var getDistance = function(entity1, entity2){
	var dx1 = entity1.x - entity2.x;
	var dy1 = entity1.y - entity2.y;
	return Math.round(Math.sqrt(dx1*dx1 + dy1*dy1) * 10)/10;	
}

var replaceValues = function(userData, content){
	for (var value in userData){
		content = content.replace("{{"+value+"}}", userData[value]);
	}
	return content;
}

var getRankFromRating = function(rating){
	const rankings = [
		{rank:"bronze1",rating:0},
		{rank:"bronze2",rating:100},
		{rank:"bronze3",rating:200},
		{rank:"silver1",rating:300},
		{rank:"silver2",rating:500},
		{rank:"silver3",rating:700},
		{rank:"gold1",rating:1000},
		{rank:"gold2",rating:1300},
		{rank:"gold3",rating:1600},
		{rank:"diamond",rating:2000},
		{rank:"diamond2",rating:9999}
	];

	for (var r in rankings){
		var rPlus = parseInt(r)+1;
		var rMinus = parseInt(r)-1;
		if (rating < rankings[rPlus].rating){
			log(rankings[r].rank + " is his rank");
			var response = {rank:rankings[r].rank, floor:rankings[r].rating, previousRank:"bronze1", nextRank:"diamond2", ceiling:9999};
			if (rankings[rPlus]){
				response.nextRank = rankings[rPlus].rank;
				response.ceiling = rankings[rPlus].rating;
			}
			if (rankings[rMinus]){
				response.previousRank = rankings[rMinus].rank;
			}
			return response;
		}		
	}
	return {rank:"bronze1", floor:0, nextRank:"bronze2", ceiling:100};
}

var getLevelFromExperience = function(experience){
	var pointsBetweenThisLevelAndNext = 2500;
	var additionalPointsBetweenLevels = 2500; //This never gets updated. It is whats added to pointsBetweenLevels, which increases the higher the level.
	var pointsForLevel = 0;
	var experienceProgressInfo = {};

	for (var x = 1; x < 99; x++){
		experienceProgressInfo.level = x;
		experienceProgressInfo.floor = pointsForLevel;
		experienceProgressInfo.ceiling = pointsForLevel + pointsBetweenThisLevelAndNext;

		if (experience < experienceProgressInfo.ceiling){
			return experienceProgressInfo;
		}

		pointsForLevel += pointsBetweenThisLevelAndNext;
		pointsBetweenThisLevelAndNext += additionalPointsBetweenLevels;
	}

	return {
		level: 99,
		floor: experience,
		ceiling: (experience + 1000000)
	};
}



if(typeof exports == 'undefined'){
}
else {
	global.removeCognitoSubFromArray = removeCognitoSubFromArray;
	global.getSocketIdFromCognitoSub = getSocketIdFromCognitoSub;
	global.getCurrentPlayersFromUsers = getCurrentPlayersFromUsers;
	global.removeIndexesFromArray = removeIndexesFromArray;
	global.comparePartySize = comparePartySize;
	global.comparePartySizeAsc =comparePartySizeAsc;
	global.compareCurrentPlayerSize = compareCurrentPlayerSize;
	global.numberWithCommas = numberWithCommas;
	global.getProgressBarPercentage = getProgressBarPercentage;
	global.getFullRankName = getFullRankName;
	global.checkIfBlocking = checkIfBlocking;
	global.line_intersects = line_intersects;
	global.isNumBetween = isNumBetween;
	global.randomInt = randomInt;
	global.getDistance = getDistance;
	global.replaceValues = replaceValues;
	global.getRankFromRating = getRankFromRating;
	global.getLevelFromExperience = getLevelFromExperience;
}