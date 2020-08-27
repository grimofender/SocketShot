const logEngine = require('../shared/engines/logEngine.js');
const userRouter = require('../shared/controllers/userController.js');
const serverRouter = require('./controllers/serverController.js');
const pageRouter = require('./controllers/pageController.js');
require('../shared/engines/socketEngine.js');
require('../shared/engines/sharedTimerEngine.js');
var dataAccess = require('../shared/data_access/dataAccess.js');
const os = require('os');
const ifaces = os.networkInterfaces();
const cookieParser = require('cookie-parser');
const path = require("path");
const hostname = os.hostname();
const util = require('util');
var AWS = require("aws-sdk");
var elasticbeanstalk = new AWS.ElasticBeanstalk({region:config.AWSRegion});
var elbv2 = new AWS.ELBv2({region:config.AWSRegion});


function getClientPath(relativePath) {
	return path.join(__dirname, "../client", relativePath);
}

processArgs();//Process command line arguments, reinit logging stream, register processes
testDB();

serv.listen(port);
app.use(userRouter);
app.use(serverRouter);
app.use(pageRouter);
app.use("/favicon.ico", express.static(getClientPath('favicon.ico')));
app.use("/client", express.static(getClientPath('.')));
app.use(express.urlencoded({extended: true})); //To support URL-encoded bodies
app.use(cookieParser());

logg("----------------------SERVER STARTUP-----------------------");
logg('Express server started on port ' + port + '.');

function testDB(){
	logg('Initializing...');
	logg("testing db");
	dataAccess.dbFindAwait("RW_USER", {USERNAME:"testuser"}, async function(err, res){
		if (res && res[0]){
			logg("DB SUCCESS! found testuser");
		}
		else {
			logg("ERROR! DB CONNECT FAIL: unable to find testuser");
		}
	});
}

function processArgs(){
	logg("Running on machine: " + hostname);
	logg("Command line arguments:");
	isWebServer = true;
	for (let j = 0; j < process.argv.length; j++) {
		if (j >= 2){
			logg(j + ' -> ' + (process.argv[j]));
			if (j == 2){
				logg("Updating port based on cmd argument: " + process.argv[j]);
				port = process.argv[j];
			}
		}
	}

	isLocal = !hostname.toLowerCase().includes("compute");
		
	if (isLocal){
		logg("Updating app to run locally");
		getIP();
		//addGameServerToLoadBalancer("i-0ba3cf132aa4121ac"); //For local testing
	}
	else {
		getAwsIp(function(){
			getInstanceIdAndAddProcessesToLoadBalancer();
		});
		serverHomePage = "https://rw.treatmetcalf.com/";
	}
}

//Get IP Address for RW_SERV (localhost)
function getIP(){
	Object.keys(ifaces).forEach(function (ifname) {
	  var alias = 0;

	  ifaces[ifname].forEach(function (iface) {
		if ('IPv4' !== iface.family || iface.internal !== false) {
		  // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
		  return;
		}

		if (alias >= 1) {
		  // this single interface has multiple ipv4 addresses
		  logg(ifname + ':' + alias, iface.address);
		} else {
		  // this interface has only one ipv4 adress
		  logg("Server hosting outside AWS on: " + iface.address);
		}
		myIP = iface.address;
		logEngine.reinitStream();
		++alias;
	  });
	});
	myUrl = myIP + ":" + port;
}

//Get IP Address for RW_SERV (AWS)
function getAwsIp(cb) {
	const request = require('request-promise');
	request('http://169.254.169.254/latest/meta-data/local-ipv4', function (error, response, body) {
		if (!error && response.statusCode === 200 && response.body) {
			myIP = response.body;
			logEngine.reinitStream();
			myUrl = myIP + ":" + port;
			cb();
		}
	}).catch(function (err){
		logg("ERROR: FAILED TO GET AWS IPV4 ADDRESS (ignore this if hosting outside AWS)");
		logg(util.format(err));
		//getIP(); //If the previous command fails, we arent in AWS, so try the local method
	});
}

function crash(){
	var newVar = alskdjf.thisIsUndefined;
}

//-----------------------PROCESS REGISTRATION-----------------------------------

function getInstanceIdAndAddProcessesToLoadBalancer(){
	logg("BEGIN EB PROCESS REGISTRATION");
	const request = require('request-promise');
	request('http://169.254.169.254/latest/meta-data/instance-id', function (error, response, body) {
		if (!error && response.statusCode === 200 && response.body) {
			var instanceId = response.body;
			addGameServerToLoadBalancer(instanceId);
		}
		else {
			log("AWS API ERROR -- Unable to Get Instance Id");
		}
	}).catch(function (err){
		log("AWS API ERROR -- Unable to Get Instance Id:");
		log(util.format(err));
	});
}

function addGameServerToLoadBalancer(instanceId){
	log("REGISTERING GAME SERVER");

  getLoadBalancerArn(config.EBName, function(loadBalancerArn){
    if (!loadBalancerArn){return;}
    getLBTargetGroups(loadBalancerArn, function(targetGroupData){

      log("All Target Groups in Load Balancer:");
      logObj(targetGroupData);
      
      //webTargetGroupArn:"arn:aws:elasticloadbalancing:us-east-2:231793983438:targetgroup/awseb-AWSEB-1RXD30P86RCRO/5404aa5233719f2d",
      //gameTargetGroupArns:["arn:aws:elasticloadbalancing:us-east-2:231793983438:targetgroup/awseb-AWSEB-1RXD30P86RCRO/5404aa5233719f2d","arn:aws:elasticloadbalancing:us-east-2:231793983438:targetgroup/awseb-AWSEB-1RXD30P86RCRO/5404aa5233719f2d"]
      

      //Web process registration
      if (!targetGroupData.webTargetGroupArn){ //Check if Web Target Group is not created
        createTargetGroup("web-server-tg", 80, function(createTargetGroupResult){
          if (!createTargetGroupResult){
            //Error logging handled in function
          }
          else {
            log("Successfully Created Web Server Target Group!");
            logObj("TargetGroupArn: " + createTargetGroupResult.TargetGroups[0].TargetGroupArn);    
            registerEC2ToTargetGroup(createTargetGroupResult.TargetGroups[0].TargetGroupArn, instanceId, function(registerResponse){
              if (!registerResponse){
                //Error logging handled inside function
              }
              else {
                log("Successfully added Web Process to newly created Web Server Target Group!");
                logObj(registerResponse);
              }
            });            
          }
        });
      }
      else { //Web Server Target Group is created, check if this instance's web process is already added
        getTargetsInTargetGroup(targetGroupData.webTargetGroupArn, function(targetGroupArn, targets){
          log("TARGETS IN WEB targetGroupArn:" + targetGroupArn);
          logObj(targets);
          var addedToWebTargetGroup = false;
          for (var t = 0; t < targets.length; t++){
            if (targets[t].Id == instanceId){
              addedToWebTargetGroup = true;
              break;
            }
          }
          if (addedToWebTargetGroup == false){
            log("ADDING INSTANCE TO WEB SERVER TARGET GROUP");
            registerEC2ToTargetGroup(targetGroupArn, instanceId, function(registerResponse){
              if (!registerResponse){
                //Error logging handled inside function
              }
              else {
                log("Successfully added Web Process to Web Server Target Group!");
                logObj(registerResponse);
              }
            });
          }
          else {
            log("Web Process already added to Web Server Target Group");
          }
        });
      }


      //ALSO NEED TO SKIP RULE CREATION IF THE TARGET GROUP ALREADY EXISTS!!!


      //Game processes registration      

      var portArray = [];
      for (let p = 1; p <= gameInstanceCount; p++) {
        portArray.push(3000 + p);
      }
      addProcessesToLoadBalancerRecursive(loadBalancerArn, instanceId, targetGroupData.gameTargetGroupArns, portArray);

    });
  });
}

function addProcessesToLoadBalancerRecursive(loadBalancerArn, instanceId, gameTargetGroupArns, portArray){
  if (!portArray[0]){
    log("Add Processes To load balancer recursive COMPLETED");
    return;
  }
  log("Adding Processes To load balancer for these ports:");
  logObj(portArray);
  var portToCheck = portArray[0];
  portArray.shift();

  upsertProcessToGameServerTargetGroup(gameTargetGroupArns, instanceId, portToCheck, function(upsertResult){
    get443ListenerArn(loadBalancerArn, function(listenerArn){            
      checkRulesAndGetPriority(listenerArn, upsertResult.targetGroupArn, function(priority){ //Will return false if rule already exists pointing to this Target Group
        if (listenerArn && upsertResult && priority){
          createRuleWithRetries(instanceId, portToCheck, listenerArn, upsertResult.targetGroupArn, priority, function(createRuleResult){
            addProcessesToLoadBalancerRecursive(loadBalancerArn, instanceId, gameTargetGroupArns, portArray);
          });
        }
        else {
          log("ERROR - Didn't get enough data to create Rule, or rule already exists (Need listenerArn:" + listenerArn + " targetGroupArn:" + upsertResult.targetGroupArn + " priority:" + priority + ")");
          addProcessesToLoadBalancerRecursive(loadBalancerArn, instanceId, gameTargetGroupArns, portArray);
        }
      });
    });          
  });
}


function checkRulesAndGetPriority(listenerArn, targetGroupArn, cb){
  var params = {
    ListenerArn: listenerArn
  };
  elbv2.describeRules(params, function(err, data) {
		if (err) {
      logg("AWS API ERROR -- Unable to Describe Rules for Listener: " + listenerArn);
      logg(util.format(err));
      cb(false);
    }
    else {
      logg("Getting Rules for Listener on Port 443:");

      //Check if Rule already exists
      for (var r in data.Rules){
        logg("Rule: " + data.Rules[r].RuleArn + " conditions:");
        logObj("Forward to:" + data.Rules[r].Actions[0].TargetGroupArn);
        if (data.Rules[r].Actions[0].TargetGroupArn == targetGroupArn){
          logg("Target Group already addded to load balancer rules.");
          cb(false);
          return;
        }
      }

      //Add the rule
      for (var x = 1; x < 999; x++){ //Starting at 1...
        var availablePriority = true;
        for (var r in data.Rules){
          if (parseInt(data.Rules[r].Priority) == x){
            availablePriority = false;
            break;
          }
        }
        if (availablePriority == false){
          continue;
        }
        else { //Found the lowest number that after looping through all rules, this number does not appear as a priority 
          cb(x); 
          break;
        }
      }
    }
  });  
}


function upsertProcessToGameServerTargetGroup(gameTargetGroupArns, instanceId, portToCheck, cb){
  portToCheck = parseInt(portToCheck);
  var targetGroupsChecked = 0;
  var presentInGameTargetGroup = false;
  for (var tg = 0; tg < gameTargetGroupArns.length; tg++){
    getTargetsInTargetGroup(gameTargetGroupArns[tg], function(targetGroupArn, targets){
      log("TARGETS IN GAME SERVER targetGroupArn:" + targetGroupArn);
      logObj(targets);
      for (var t = 0; t < targets.length; t++){
        if (targets[t].Id == instanceId && parseInt(targets[t].Port) == portToCheck){
          presentInGameTargetGroup = true;
          log("Verified process " + portToCheck + " for instance " + instanceId + " has already been added to targetGroup " + targetGroupArn);
          cb({targetGroupArn:targetGroupArn});
          break;
        }
        targetGroupsChecked++;
        if (targetGroupsChecked >= gameTargetGroupArns.length && !presentInGameTargetGroup){
          //Create Target Group, and add Process
          log("Adding process on port " + portToCheck + " for instance " + instanceId + " to new Target Group");
          createTargetGroup("game-" + instanceId.substring(2) + "-" + portToCheck.toString().substring(2), portToCheck, function(createTargetGroupResult){
            if (!createTargetGroupResult){
              //Error logging handled in function
            }
            else {
              log("Successfully Created Web Server Target Group!");
              logObj("TargetGroupArn: " + createTargetGroupResult.TargetGroups[0].TargetGroupArn);    
              registerEC2ToTargetGroup(createTargetGroupResult.TargetGroups[0].TargetGroupArn, instanceId, function(registerResponse){
                if (!registerResponse){
                  cb(false);
                }
                else {
                  log("Successfully added Game Process to newly created Game Server Target Group!");
                  logObj(registerResponse);
                  cb({targetGroupArn:createTargetGroupResult.TargetGroups[0].TargetGroupArn});
                  presentInGameTargetGroup = true;
                }
              });            
            }
          });          
        }
      }
    });
  }    
  if (!presentInGameTargetGroup){ //Target group containing this server+process does not exist, create one
    log("Adding process on port " + portToCheck + " for instance " + instanceId + " to new Target Group");
    createTargetGroup("game-" + instanceId.substring(2) + "-" + portToCheck.toString().substring(2), portToCheck, function(createTargetGroupResult){
      if (!createTargetGroupResult){
        //Error logging handled in function
      }
      else {
        log("Successfully Created Web Server Target Group!");
        logObj("TargetGroupArn: " + createTargetGroupResult.TargetGroups[0].TargetGroupArn);    
        registerEC2ToTargetGroup(createTargetGroupResult.TargetGroups[0].TargetGroupArn, instanceId, function(registerResponse){
          if (!registerResponse){
            cb(false);
          }
          else {
            log("Successfully added Game Process to newly created Game Server Target Group!");
            logObj(registerResponse);
            cb({targetGroupArn:createTargetGroupResult.TargetGroups[0].TargetGroupArn});
            presentInGameTargetGroup = true;
          }
        });            
      }
    });          
  }
}

function getLoadBalancerArn(EBName, cb){
  log("Getting LoadBalancer Arn...");
	var EBparams = {
		EnvironmentName:EBName
	};
	elasticbeanstalk.describeEnvironmentResources(EBparams, function(err, data) { //Get Loadbalancer Arn from ElasticBeanstalk environment
		if (err) {
      logg("AWS API ERROR -- Unable to Get Loadbalancer Arn from ElasticBeanstalk environment:");
      logg(util.format(err));
      cb(false);
    }
		else    {
			//log("Instance Ids:");
			//logObj(data.EnvironmentResources.Instances);
			log("Got LoadBalancer Arns:");
			logObj(data.EnvironmentResources.LoadBalancers[0].Name);
			cb(data.EnvironmentResources.LoadBalancers[0].Name);
		}
	});
}

function getLBTargetGroups(loadBalancerArn, cb){
  log("Getting LoadBalancer Target Groups...");
  var LBparams = {
    LoadBalancerArn: loadBalancerArn,
    PageSize: 400
  };
  elbv2.describeTargetGroups(LBparams, function(err, data) { //List all target groups in Loadbalancer
    if (err) {
      logg("AWS API ERROR -- Unable to List all target groups in Loadbalancer:");
      logg(util.format(err));
      cb(false);
    }
    else {
      log("Got LoadBalancer Target Groups:");
      logObj(data.TargetGroups);
      var targetGroupData = {gameTargetGroupArns:[]};
      for (var l in data.TargetGroups){
        log("Name=" + data.TargetGroups[l].TargetGroupName + " TargetGroupArn=" + data.TargetGroups[l].TargetGroupArn);

        if (data.TargetGroups[l].Port == 80){
          targetGroupData.webTargetGroupArn = data.TargetGroups[l].TargetGroupArn;
        }
        else {
          targetGroupData.gameTargetGroupArns.push(data.TargetGroups[l].TargetGroupArn);
        }
      }
      cb(targetGroupData);
    }        
  });
}


function getTargetsInTargetGroup(targetGroupArn, cb){
  var targets = [];
  var targetParams = {
    TargetGroupArn: targetGroupArn
  };
  elbv2.describeTargetHealth(targetParams, function(err, instanceData) {
    if (err) {
      logg("AWS API ERROR -- Unable to Get Instances in target group: ");
      logg(util.format(err));
    }
    else {
      for (var i in instanceData.TargetHealthDescriptions){
        log("InstanceId:" + instanceData.TargetHealthDescriptions[i].Target.Id + " Port:" + instanceData.TargetHealthDescriptions[i].Target.Port);
        //var pushable = data.TargetGroups.filter(function (targetGroup) {
          //return targetGroup.TargetGroupArn == targetParams.TargetGroupArn;
        //});
        targets.push({Id:instanceData.TargetHealthDescriptions[i].Target.Id, Port:instanceData.TargetHealthDescriptions[i].Target.Port});
      }
      cb(targetGroupArn, targets);
    }          
  });
}

function createTargetGroup(name, port, cb){
	var returnData = {};

	var params = {
		Name: name,
		HealthCheckEnabled: true,
		HealthCheckIntervalSeconds: 30,
		HealthCheckPath: '/ping',
		HealthCheckProtocol: 'HTTP',
		HealthCheckTimeoutSeconds: 5,
		HealthyThresholdCount: 5,
		Matcher: {
			HttpCode: '200'
		},
		Port: port,
		Protocol: 'HTTP',
		TargetType: 'instance',
		UnhealthyThresholdCount: 2,
		VpcId: config.targetGroupVpcId
	};
	elbv2.createTargetGroup(params, function(err, data) {
		if (err){ 
			logg("AWS API ERROR -- Unable to createTargetGroup[" + name + "] for port[" + port + "]");
			logObj(err);
			cb(false);
		}
		else {
			console.log(data);
			cb(data);
		}          
	});
}

function registerEC2ToTargetGroup(targetGroupArn, instanceId, cb){
	var returnData = {};
	var params = {
		TargetGroupArn: targetGroupArn, //"arn:aws:elasticloadbalancing:us-west-2:123456789012:targetgroup/my-targets/73e2d6bc24d8a067"
		Targets: [{	Id: instanceId }] //"i-80c8dd94"
	};
	elbv2.registerTargets(params, function(err, data) {
		if (err) {
			logg("AWS API ERROR -- Unable to Register EC2[" + instanceId + "] to Target Group[" + targetGroupArn + "]");
			logObj(err);
			cb(false);
		}
		else {
			logObj(data);
			cb(data);
		}
	});	
}

function createRuleWithRetries(instanceId, portToCheck, listenerArn, targetGroupArn, priority, cb){
  createRule(instanceId.substring(2), portToCheck.toString().substring(2), listenerArn, targetGroupArn, priority, function(createRuleResult){
    if (createRuleResult){
      log("FIRST TRY - Successfully created rule");
      cb(createRuleResult.Rules[0].RuleArn);
    }
    else {
      createRule(instanceId.substring(2), portToCheck.toString().substring(2), listenerArn, targetGroupArn, priority+1, function(createRuleResult){
        if (createRuleResult){
          log("SECOND TRY - Successfully created rule");
          cb(createRuleResult.Rules[0].RuleArn);
        }
        else {
          log("ERROR -- RULE CREATION FAILED");
          cb(false);
        }
      });                  
    }
  });  
}

function createRule(serverParam, processParam, listenerArn, targetGroupArn, priority, cb){
  var params = {
    Actions: [
      {
        TargetGroupArn: targetGroupArn, 
        Type: "forward"
      }
    ], 
    Conditions: [
      {
        Field: "query-string",
        QueryStringConfig: {
          Values: [
            {
              Key: 'server',
              Value: serverParam
            }
          ]
        }
      },
      {
        Field: "query-string",
        QueryStringConfig: {
          Values: [
            {
              Key: 'process',
              Value: processParam
            }
          ]
        }
      }      
    ], 
    ListenerArn: listenerArn, 
    Priority: priority
  };
  elbv2.createRule(params, function(err, data) {
    if (err) {
      logg("AWS API ERROR -- Unable to Create Rule server=" + serverParam + "&process=" + processParam + " pointing to targetGroup " + targetGroupArn);
      logObj(err);
      cb(false);
    }
    else {
      logg("Successfully created Rule: " + data.Rules[0].RuleArn + " for query: server=" + serverParam + "&process=" + processParam + " priority:" + priority + " pointing to targetGroup " + targetGroupArn);
      cb(data); //RuleArn = data.Rules[0].RuleArn
    }
  });
}

function get443ListenerArn(loadBalancerArn, cb){
  var LBparams = {
    LoadBalancerArn: loadBalancerArn,
    PageSize: 100
  };
  elbv2.describeListeners(LBparams, function(err, data) {
    if (err) {
      logg("AWS API ERROR -- Unable to Get Listener on Port 443 for LoadBalancer: " + loadBalancerArn);
      logObj(err);
      cb(false);
    }
    else {
      for (var l in data.Listeners){
        if (data.Listeners[l].Port == 443){
          cb(data.Listeners[l].ListenerArn);
          break;
        }
      }
    }        
  });  
}
