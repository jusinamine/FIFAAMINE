const http = require('https');
var HMAC = require("crypto-js/hmac-ripemd160");

const get_trade_params = (amnt = null, usr = null, pf = null) => {
    USERNAME = usr || "mohamed176900";
    HASH_KEY = "aeH8pi!s:e3cheiNg5te";
    PLATFORM = pf || "ps4";
    
    EMAIL = "mohamed176900@outlook.fr";
    GATEAWAY = "skrill";
    
    AMOUNT = amnt || 3000000;
    CURRENCY = 'USD';
    TIME = Math.round(+ new Date()/1000);
    
    hashed = HMAC(`${PLATFORM}|${AMOUNT}|${GATEAWAY}|${EMAIL}|${CURRENCY}|${TIME}`, HASH_KEY).toString();
    // console.log(hashed);

    params_obj = {
        user: USERNAME,
        platform: PLATFORM,
        coinAmount: AMOUNT,
        paymentGateway: GATEAWAY,
        paymentEmail: EMAIL,
        paymentCurrency: CURRENCY,
        time: TIME,
        hash: hashed,
    };
    
    return encodeURIComponent(JSON.stringify(params_obj));
};


const send_trade_request = (amount = null, username = null, platform = null) => {
    options = { 
        method: 'GET',
        host : 'www.mmoga.com',
        port: 443,
        path: `/FIFA-Coins/FUT-Coins-Sell/?get_trade=${get_trade_params(amount, username, platform)}`,
        headers: {
            'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.110 Safari/537.36'
        }
    };

    req = http.request(options, res => {
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
                console.log(bb);
            }
        });
    });

    req.end();
};


module.exports = {
    send_trade_request : send_trade_request
};

