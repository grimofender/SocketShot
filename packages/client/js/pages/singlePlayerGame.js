var dataAccessFunctions = {};
dataAccessFunctions.getUserFromDB = function(){}
dataAccessFunctions.getAllUsersOnServer = function(){}
dataAccessFunctions.getPartyForUser = function(){}
dataAccessFunctions.getPartyById = function(){}
dataAccessFunctions.kickOfflineFromParty = function(){}
dataAccessFunctions.searchUserFromDB = function(){}
dataAccessFunctions.dbUserUpdate = function(){}
dataAccessFunctions.updateOnlineTimestampForUser = function(){}
dataAccessFunctions.updateOnlineTimestampForUsers = function(){}
dataAccessFunctions.setPartyIdIfEmpty = function(){}
dataAccessFunctions.updateServerUrlForUser = function(){}
dataAccessFunctions.removeRequest = function(){}
dataAccessFunctions.upsertRequest = function(){}
dataAccessFunctions.getFriendRequests = function(){}
dataAccessFunctions.getPartyRequests = function(){}
dataAccessFunctions.getRequestById = function(){}
dataAccessFunctions.removeRequestById = function(){}
dataAccessFunctions.removeStaleFriendRequests = function(){}
dataAccessFunctions.removeStalePartyRequests =  function(){}
dataAccessFunctions.getOnlineFriends = function(){}
dataAccessFunctions.getPlayerRelationshipFromDB = function(){}
dataAccessFunctions.upsertFriend = function(){}
dataAccessFunctions.removeFriend = function(){}
dataAccessFunctions.getPublicServersFromDB = function(){}
dataAccessFunctions.dbGameServerRemoveAndAdd = function(){}
dataAccessFunctions.dbGameServerUpdate = function(){}
dataAccessFunctions.syncGameServerWithDatabase = function(){}
dataAccessFunctions.checkForUnhealthyServers = function(){}
dataAccessFunctions.addUser = function(){}

var logEngine = {};
logEngine.reinitStream = function(){};



function startSinglePlayerGame(type){
	myPlayer.id = "0";
	startGame();
}