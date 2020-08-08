
if(typeof exports == 'undefined'){
}
else {
	global.express = require('express');
	global.app = express();
	global.serv = require('http').Server(app);
	global.fs = require('fs');
	global.util = require('util')
	global.config = require("./settings.json");
}
//--------------------------------SERVER CONFIGURATION-----------------------------------------------------
var debug = true;
var httpOnlyCookies = false;
var allowDuplicateUsername = false;
var allowServerCommands = true;

var syncServerWithDbInterval = 15; //Seconds //Both sync and check for stale thresholds
var serverHealthCheckTimestampThreshold = 90; //Seconds

var updateOnlineTimestampInterval = 15; //Seconds
var staleOnlineTimestampThreshold = 60; //Seconds

var staleRequestCheckInterval = 60; //Seconds
var staleFriendRequestThreshold = 30; //Days
var stalePartyRequestThreshold = 300; //Seconds

var joinActiveGameThreshold = 0.5; //Percentage threshold for how far the game is allowed to be progressed and still accept incoming players (0.0 - 1.0)

var pcMode = 2; //1 = no, 2= yes

//Cash Values for Events
var killCash = 100;
var doubleKillCash = 200;
var tripleKillCash = 300;
var quadKillCash = 400;
var spreeCash = 250;
var frenzyCash = 500;
var rampageCash = 750;
var unbelievableCash = 1000;
var thugCash = 25;
var assassinationCash = 150;
var stealCash = 50;
var captureCash= 300;
var killEnemyBagHolder = 150;
var returnCash = 100;
var winCash = 1000;
var loseCash = 100;
var mvpCash = 300;
var hitCash = 5;

//Shop config
var shopEnabled = false;
var invincibleInShop = false;
var shop = {
	active:false,
	selection:3,
	price1:150,
	price2:300,
	price3:200,
	price4:300,
	price5:100,	
	uniqueTextTimer:0,
	uniqueText:"",
	purchaseEffectTimer:0,
};


//Player config
var startingCash = 0;
var boostAmount = 23;
var boostDecay = 1.9;
var globalSpeed = 6;
var speedMin = globalSpeed; 
var maxSpeed = globalSpeed; 
var rechargeDelayTime = 150; //Double for breaking under zero energy
var healDelayTime = 300;
var healRate = 10; //Milisecond delay between heal tick after player already started healing (Higher number is slower heal)
var respawnTimeLimit = 180;
var slayerRespawnTimeLimit = 5 * 60; //seconds (translated to frames)
var ctfRespawnTimeLimit = 7 * 60; //seconds (translated to frames)
var bagDrag = 0.85;
//Cloaking config
var cloakingEnabled = true;
var cloakDrainSpeed = 0.09;
var cloakDrag = 0.5; //Walking speed multiplier when cloaked
var cloakInitializeSpeed = 0.02;
var cloakDeinitializeSpeed = 0.1;
var playerMaxHealth = 175;
var AfkFramesAllowed = 6000 * 60; //seconds (translated to frames) //timeout

//Weapons config
var bulletRange = 19 * 75;
var damageScale = 1;
	var pistolDamage = 10;
	var pistolSideDamage = 10; //Stacks on above
	var pistolBackDamage = 20; //Stacks AGAIN on above
	var mgDamage = 12; 
	var mgSideDamage = 12; //Stacks on above
	var mgBackDamage = 24; //Stacks AGAIN on above
	var SGDamage = 30;
	var SGSideDamage = 30;
	var SGBackDamage = 60;
	var friendlyFireDamageScale = 0.5;
	var boostDamage = 50;
	
var SGRange = 310;
var SGCloseRangeDamageScale = 4;
var SGPushSpeed = 12;

var DPClipSize = 20;
var MGClipSize = 45;
var SGClipSize = 6;

var pistolFireRateLimiter = true;	
var pistolFireRate = 12;
var DPFireRate = 12;
var MGFireRate = 5;
var SGFireRate = 50;

var maxSGAmmo = 24;
var maxDPAmmo = 40;
var maxMGAmmo = 90;

var cloakBonusDamage = 20;

var staggerScale = 0.60;
var staggerTime = 20;

var damagePushScale = 2;
var pushMaxSpeed = 35;

var allowBagWeapons = false;

//thug Config
var spawnOpposingThug = true; //Whether or not to spawn an opposing thug for each player who enters the game
var thugSightDistance = 600;
var thugHealth = 80;
var thugDamage = 50;
var thugSpeed = 4;
var thugAttackDelay = 30;
var thugLimit = 2; //Limit on how many thugs can appear before ALL thugs are wiped off map (for performance concerns)


//Map Config
var threatSpawnRange = 400;
var pushStrength = 15; //Push block strength

//Rating config
var matchWinLossRatingBonus = 30;
var enemySkillDifferenceDivider = 20;

//----------------------SERVER GLOBAL VARIABLES---------------------------------
var myIP = "";
var myUrl = "";
var port = 3000;
var serverHomePage = "/";

//Game global variables
var pause = false;
var minutesLeft = 9;
var secondsLeft = 99;
var nextGameTimer = 20;
var gameMinutesLength = 5;
var gameSecondsLength = 0;
var map = "longest";
var gametype = "ctf";
var maxPlayers = 14;
var isWebServer = false;
var isLocal = false;
var privateServer = false;
var scoreToWin = 0;
var serverNumber = 1;
var serverName = "Server";
var voteGametype = true;
var voteMap = true;
var ctfVotes = 0;
var slayerVotes = 0;
var thePitVotes = 0;
var longestVotes = 0;
var crikVotes = 0;
var voteMapIds = [];
var voteGametypeIds = [];
var timeBeforeNextGame = 60; //newGameTimer

var bagRed = {
	homeX:0,
	homeY:0,
	x:0,
	y:0,
	captured:false,
	speed:0,
	direction:0,
	playerThrowing:0,
};

var bagBlue = {
	homeX:0,
	homeY:0,
	x:0,
	y:0,
	captured:false,
	speed:0,
	direction:0,
	playerThrowing:0,
};

var whiteScore = 0;
var blackScore = 0;

var pregame = true;
var gameOver = false;

//Map global variables
var mapWidth = 0;
var mapHeight = 0;

var warp1X = 0;
var warp1Y = 0;
var warp2X = 0;
var warp2Y = 0;

var spawnXminBlack = 0;
var spawnXmaxBlack = 0;
var spawnYminBlack = 0;
var spawnYmaxBlack = 0;

var spawnXminWhite = 0;
var spawnXmaxWhite = 0;
var spawnYminWhite = 0;
var spawnYmaxWhite = 0;

//Update packs
var updatePlayerList = [];
var updateThugList = [];
var updateNotificationList = [];
var updatePickupList = [];
var updateEffectList = [];
var updateMisc = {};

var SOCKET_LIST = [];

if(typeof exports == 'undefined'){
}
else {
	global.debug = debug;
	global.httpOnlyCookies = httpOnlyCookies;
	global.allowDuplicateUsername = allowDuplicateUsername;
	global.allowServerCommands = allowServerCommands;

	global.syncServerWithDbInterval = syncServerWithDbInterval; //Seconds //Both sync and check for stale thresholds
	global.serverHealthCheckTimestampThreshold = serverHealthCheckTimestampThreshold; //Seconds

	global.updateOnlineTimestampInterval = updateOnlineTimestampInterval; //Seconds
	global.staleOnlineTimestampThreshold = staleOnlineTimestampThreshold; //Seconds

	global.staleRequestCheckInterval = staleRequestCheckInterval; //Seconds
	global.staleFriendRequestThreshold = staleFriendRequestThreshold; //Days
	global.stalePartyRequestThreshold = stalePartyRequestThreshold; //Seconds

	global.joinActiveGameThreshold = joinActiveGameThreshold; //Percentage threshold for how far the game is allowed to be progressed and still accept incoming players (0.0 - 1.0)

	global.pcMode = pcMode; //1 = no, 2= yes

	//Cash Values for Events
	global.killCash = killCash;
	global.doubleKillCash = doubleKillCash;
	global.tripleKillCash = tripleKillCash;
	global.quadKillCash = quadKillCash;
	global.spreeCash = spreeCash;
	global.frenzyCash = frenzyCash;
	global.rampageCash = rampageCash;
	global.unbelievableCash = unbelievableCash;
	global.thugCash = thugCash;
	global.assassinationCash = assassinationCash;
	global.stealCash = stealCash;
	global.captureCash= captureCash;
	global.killEnemyBagHolder = killEnemyBagHolder;
	global.returnCash = returnCash;
	global.winCash = winCash;
	global.loseCash = loseCash;
	global.mvpCash = mvpCash;
	global.hitCash = hitCash;

	//Shop config
	global.shopEnabled = shopEnabled;
	global.invincibleInShop = invincibleInShop;
	global.shop = shop;


	//Player config
	global.startingCash = startingCash;
	global.boostAmount = boostAmount;
	global.boostDecay = boostDecay;
	global.globalSpeed = globalSpeed;
	global.speedMin = speedMin; 
	global.maxSpeed = maxSpeed; 
	global.rechargeDelayTime = rechargeDelayTime; //Double for breaking under zero energy
	global.healDelayTime = healDelayTime;
	global.healRate = healRate; //Milisecond delay between heal tick after player already started healing (Higher number is slower heal)
	global.respawnTimeLimit = respawnTimeLimit;
	global.slayerRespawnTimeLimit = slayerRespawnTimeLimit; //seconds (translated to frames)
	global.ctfRespawnTimeLimit = ctfRespawnTimeLimit; //seconds (translated to frames)
	global.bagDrag = bagDrag;
	//Cloaking config
	global.cloakingEnabled = cloakingEnabled;
	global.cloakDrainSpeed = cloakDrainSpeed;
	global.cloakDrag = cloakDrag; //Walking speed multiplier when cloaked
	global.cloakInitializeSpeed = cloakInitializeSpeed;
	global.cloakDeinitializeSpeed = cloakDeinitializeSpeed;
	global.playerMaxHealth = playerMaxHealth;
	global.AfkFramesAllowed = AfkFramesAllowed; //seconds (translated to frames) //timeout

	//Weapons config
	global.bulletRange = bulletRange;
	global.damageScale = damageScale;
		global.pistolDamage = pistolDamage;
		global.pistolSideDamage = pistolSideDamage; //Stacks on above
		global.pistolBackDamage = pistolBackDamage; //Stacks AGAIN on above
		global.mgDamage = mgDamage; 
		global.mgSideDamage = mgSideDamage; //Stacks on above
		global.mgBackDamage = mgBackDamage; //Stacks AGAIN on above
		global.SGDamage = SGDamage;
		global.SGSideDamage = SGSideDamage;
		global.SGBackDamage = SGBackDamage;
		global.friendlyFireDamageScale = friendlyFireDamageScale;
		global.boostDamage = boostDamage;
		
	global.SGRange = SGRange;
	global.SGCloseRangeDamageScale = SGCloseRangeDamageScale;
	global.SGPushSpeed = SGPushSpeed;

	global.DPClipSize = DPClipSize;
	global.MGClipSize = MGClipSize;
	global.SGClipSize = SGClipSize;

	global.pistolFireRateLimiter = pistolFireRateLimiter;	
	global.pistolFireRate = pistolFireRate;
	global.DPFireRate = DPFireRate;
	global.MGFireRate = MGFireRate;
	global.SGFireRate = SGFireRate;

	global.maxSGAmmo = maxSGAmmo;
	global.maxDPAmmo = maxDPAmmo;
	global.maxMGAmmo = maxMGAmmo;

	global.cloakBonusDamage = cloakBonusDamage;

	global.staggerScale = staggerScale;
	global.staggerTime = staggerTime;

	global.damagePushScale = damagePushScale;
	global.pushMaxSpeed = pushMaxSpeed;

	global.allowBagWeapons = allowBagWeapons;

	//thug Config
	global.spawnOpposingThug = spawnOpposingThug; //Whether or not to spawn an opposing thug for each player who enters the game
	global.thugSightDistance = thugSightDistance;
	global.thugHealth = thugHealth;
	global.thugDamage = thugDamage;
	global.thugSpeed = thugSpeed;
	global.thugAttackDelay = thugAttackDelay;
	global.thugLimit = thugLimit; //Limit on how many thugs can appear before ALL thugs are wiped off map (for performance concerns)


	//Map Config
	global.threatSpawnRange = threatSpawnRange;
	global.pushStrength = pushStrength; //Push block strength

	//Rating config
	global.matchWinLossRatingBonus = matchWinLossRatingBonus;
	global.enemySkillDifferenceDivider = enemySkillDifferenceDivider;

	//----------------------SERVER GLOBAL VARIABLES---------------------------------
	global.myIP = myIP;
	global.myUrl = myUrl;
	global.port = port;
	global.serverHomePage = serverHomePage;

	//Game global variables
	global.pause = pause;
	global.minutesLeft = minutesLeft;
	global.secondsLeft = secondsLeft;
	global.nextGameTimer = nextGameTimer;
	global.gameMinutesLength = gameMinutesLength;
	global.gameSecondsLength = gameSecondsLength;
	global.map = map;
	global.gametype = gametype;
	global.maxPlayers = maxPlayers;
	global.isWebServer = isWebServer;
	global.isLocal = isLocal;
	global.privateServer = privateServer;
	global.scoreToWin = scoreToWin;
	global.serverNumber = serverNumber;
	global.serverName = serverName;
	global.voteGametype = voteGametype;
	global.voteMap = voteMap;
	global.ctfVotes = ctfVotes;
	global.slayerVotes = slayerVotes;
	global.thePitVotes = thePitVotes;
	global.longestVotes = longestVotes;
	global.crikVotes = crikVotes;
	global.voteMapIds = voteMapIds;
	global.voteGametypeIds = voteGametypeIds;
	global.timeBeforeNextGame = timeBeforeNextGame; //newGameTimer

	global.bagRed = bagRed;

	global.bagBlue = bagBlue;

	global.whiteScore = whiteScore;
	global.blackScore = blackScore;

	global.pregame = pregame;
	global.gameOver = gameOver;

	//Map global variables
	global.mapWidth = mapWidth;
	global.mapHeight = mapHeight;

	global.warp1X = warp1X;
	global.warp1Y = warp1Y;
	global.warp2X = warp2X;
	global.warp2Y = warp2Y;

	global.spawnXminBlack = spawnXminBlack;
	global.spawnXmaxBlack = spawnXmaxBlack;
	global.spawnYminBlack = spawnYminBlack;
	global.spawnYmaxBlack = spawnYmaxBlack;

	global.spawnXminWhite = spawnXminWhite;
	global.spawnXmaxWhite = spawnXmaxWhite;
	global.spawnYminWhite = spawnYminWhite;
	global.spawnYmaxWhite = spawnYmaxWhite;

	//Update packs
	global.updatePlayerList = updatePlayerList;
	global.updateThugList = updateThugList;
	global.updateNotificationList = updateNotificationList;
	global.updatePickupList = updatePickupList;
	global.updateEffectList = updateEffectList;
	global.updateMisc = updateMisc;

	global.SOCKET_LIST = SOCKET_LIST;
}