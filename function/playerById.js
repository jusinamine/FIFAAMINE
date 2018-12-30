const http = require('https');

var getPlayerById = (PLAYER_ID) =>{
    return new Promise(function (resolve,reject){
        options = { 
            method: 'GET',
            host : 'www.easports.com',
            port: 443,
            path: `/fifa/ultimate-team/api/fut/item?id=${PLAYER_ID}`,
        };
        
        function handle_response (res ) {
            var bb = '';
            
            res.on('data', chunk => {
                bb += chunk; 
            });
            
            res.on('end', () => {
                try {
                    var p = JSON.parse(bb);
                    if(p["items"][0]["commonName"] === ''){
                        var fullPlayerName = p["items"][0]["firstName"]+' '+p["items"][0]["lastName"];
                        console.log(fullPlayerName);
                        resolve(fullPlayerName);
                    }
                    else{
                        console.log(p["items"][0]["commonName"]);
                        resolve(p["items"][0]["commonName"]);
                    }
                    
                }
                catch (err) {
                    console.log('nr')
                    resolve('No results');
                }
            });
        }
        
        req = http.request(options, handle_response);
        req.end();
    });
}

module.exports = {
    getPlayerById : getPlayerById
}