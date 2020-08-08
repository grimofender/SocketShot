const dataAccessFunctions = require('shared/data_access/dataAccessFunctions.js');
const gameEngine = require('./gameEngine.js');


var secondsSinceLastServerSync = syncServerWithDbInterval - 2;

setInterval( 
	function(){
		//Server monitoring
		if (typeof syncServerWithDbInterval != 'undefined'){
			secondsSinceLastServerSync++;
			if (secondsSinceLastServerSync > syncServerWithDbInterval){
				dataAccessFunctions.syncGameServerWithDatabase();
				if (pregame == true && gameEngine.getNumPlayersInGame() >= 4){
					restartGame();
				}
				secondsSinceLastServerSync = 0;
			}		
		}
	},
	1000/1 //Ticks per second
);