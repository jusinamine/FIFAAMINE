const http = require('https');
const fs = require('fs');

API_KEY = JSON.parse(fs.readFileSync('apiKeys.json'))[0]['fifaCoinsApiKey'];

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
								stopTrade();
								resolve('error-key');
							}
							console.log(p);
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

let cancelTradeFifacoins = (CARDID)=>{
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
			}
			catch (err) {
				console.log('dd'+bb);
			}
		});
	}

	req = http.request(options, handle_response);
	req.end();

}


module.exports = {
	getTradeFifacoins : getTradeFifacoins,
	stopTrade: stopTrade ,
	listP : listP,
	cancelTradeFifacoins : cancelTradeFifacoins
};

  // If you ever want to stop it...  clearInterval(requestLoop)