const http = require('https');
const fs = require('fs');

API_KEY = JSON.parse(fs.readFileSync('apiKeys.json'))[0]['fifaCoinsApiKey'];
/*
const getTradeFifacoins = ()=>{
	API_KEY = "QFBMupXkVhCC37uqUNw";
	SKUS= "FFA19PS4";

	options = { 
		method: 'GET',
		host : 'sugar.sh',
		port: 443,
		path: `/market/api?pass=${API_KEY}&skus=${SKUS}`,
	};

	function handle_response (res) {
		var bb = '';
		
		res.on('data', chunk => {
			bb += chunk;
		});
		
		res.on('end', () => {
			try {
				var p = JSON.parse(bb);
				console.log(p);
			}
			catch (err) {
				console.log('dd'+bb);
			}
		});
	}

	req = http.request(options, handle_response);
	req.end();

}
const cancelTradeFifacoins = (CARDID)=>{
	API_KEY = "QFBMupXkVhCC37uqUNw";
	SKUS= "FFA19PS4";
	options = { 
		method: 'GET',
		host : 'sugar.sh',
		port: 443,
		path: `/market/api/cancel?pass=${API_KEY}&skus=${SKUS}&cardid=${CARDID}`,
	};
	function handle_response (res) {
		var bb = '';
		
		res.on('data', chunk => {
			bb += chunk;
		});
		
		res.on('end', () => {
			try {
				var p = JSON.parse(bb);
				console.log(p);
			}
			catch (err) {
				console.log('dd'+bb);
			}
		});
	}

	req = http.request(options, handle_response);
	req.end();

}
cancelTradeFifacoins(6519099);
module.exports = {
    getTradeFifacoins : getTradeFifacoins
};*/

var listP = [];
var requestLoop;
let getTradeFifacoins = () =>{
	return new Promise(
		function (resolve, reject) {
			requestLoop = setInterval(function(){
				
				SKUS= "FFA19PS4";
		
				options = { 
					method: 'GET',
					host : 'sugar.sh',
					port: 443,
					path: `/market/api?pass=${API_KEY}&skus=${SKUS}`,
				};
		
				function handle_response (res) {
					var bb = '';
					
					res.on('data', chunk => {
						bb += chunk;
					});
					
					res.on('end', () => {
						try {
							p = JSON.parse(bb);
							if(p["msg"] === "got 1 players"){
								listP[listP.length] = p["data"];
								resolve(listP);
							}
							if(p["msg"] === "forbidden"){
								console.log('error api key')
								stopTrade();
							}
							console.log(p);
							//console.log(listP.length)
					
						}
						catch (err) {
							console.log('dd'+bb);
						}
					});
				}
		
				req = http.request(options, handle_response);
				req.end();
				
			}, 1000);
	});
	
}
let stopTrade = () =>{
	clearInterval(requestLoop);
}

/*
getTradeFifacoins().then(function(a){
	var buy = setInterval(function(){
		console.log('bankok '+ a.length);
		if(a.length>2){
			clearInterval(requestLoop);
			clearInterval(buy);
		}
	},5000);
	
});*/



	/*
var coins = 100000

GETFIFACOINSTRADE.then(	a => {
	var buy = setInterval(()=>{
		console.log(a);
		if(a.length>=5){
			clearInterval(buy)
		}
	},5000)
});*/




module.exports = {
	getTradeFifacoins : getTradeFifacoins,
	stopTrade: stopTrade ,
	listP : listP
};

  // If you ever want to stop it...  clearInterval(requestLoop)