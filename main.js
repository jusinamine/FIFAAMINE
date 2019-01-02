const path = require('path');
const url = require('url');
const fs = require('fs');
const { app, BrowserWindow, Menu, session, ipcMain, webContents } = require('electron');
const { Builder, By, Key, until, promise } = require('selenium-webdriver');

var chrome = require('selenium-webdriver/chrome');
const querystring = require('querystring');

// botdevja45 futcompte1930@yandex.com
const fn = require('./function/playerById');
const api = require('./api_send');
const fc = require('./fifacoins');
var jsonFile = require('./accountInfo');
let addAccountWindow;
let accountList = {};
let driver = [];
let emailIsCon = [];
var stopBuy = '';
const webapp = "https://www.easports.com/fr/fifa/ultimate-team/web-app/";


function set_driver(path) {
	service = new chrome.ServiceBuilder(path).build();
	chrome.setDefaultService(service);
}

/*
// LINUX
set_driver(
	path.join(__dirname, 'chromedriver', 'chromedriver')
);*/

// WINDOWS
 set_driver(
 	path.join(__dirname, 'chromedriver', 'chromedriver.exe')
 );

app.on('ready', function () {
	// Create new window
	mainWindow = new BrowserWindow({ width: 800, show: false });

	mainWindow.once('ready-to-show',async () => {

		mainWindow.show();
		accountList = JSON.parse(fs.readFileSync('accountInfo.json'))[0];

	});

	mainWindow.on('close', async () => {

		save_account_data();

	});


	mainWindow.loadURL(url.format({
		pathname: path.join(__dirname, 'views/mainWindow.html'),
		protocol: 'file:',
		slashes: true
	}));
	mainWindow.setMenu(null);
	
	const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
	Menu.setApplicationMenu(mainMenu);

});

app.on('window-all-closed', async function () {

	for (i = 0; i < emailIsCon.length; i++)
		await driver[emailIsCon[i]].close();
	await app.quit();

});

// ADD WINDOW
function createAddAccountWindow() {

	addAccountWindow = new BrowserWindow({ width: 300, height: 200, parent: mainWindow });
	addAccountWindow.loadURL(url.format({
		pathname: path.join(__dirname, 'views/addAc.html'),
		protocol: 'file:',
		slashes: true
	}));

	addAccountWindow.on('close', () => {
		addAccountWindow = null;
	});
	addAccountWindow.setMenu(null);
}



// login to ea web app account
async function activate_account(email) {

	emailAcc = email;
	emailIsCon[emailIsCon.length] = email;
	mainWindow.webContents.executeJavaScript('document.getElementById("load-back").style.visibility = "visible"');

	codeEaWindow = new BrowserWindow({ width: 300, height: 200, show: false, parent: mainWindow });
		codeEaWindow.loadURL(url.format({
			pathname: path.join(__dirname, 'views/getCode.html'),
			protocol: 'file:',
			slashes: true
		}));

	driver[email] = await new Builder().forBrowser('chrome').setChromeOptions(new chrome.Options()).build();
	await driver[email].get(webapp);
	//if error in login
	var lowConx = setInterval(async function (){
		try{
			if(await driver[email].findElement(By.className('ut-language-select sm-ut-content-container ut-content-container'))){
				mainWindow.webContents.executeJavaScript("document.querySelector('#load-back').style.visibility = 'hidden';");
				error_message(2);
				clearInterval(lowConx);
			}
		}
		catch(err){

		}
		
	},5000);


	var connect_btn_cls = '.btn-standard.call-to-action';
	var login_panel = '#email-login-panel';

	while (true) {
		try {
			var elem = await driver[email].findElement(By.css(connect_btn_cls));
			break;
		}
		catch (err) {
			continue;
		}
	}

	while (true) {
		try {
			await elem.click();
			if (await driver[email].findElement(By.css(login_panel)))
				break;
		}
		catch (err) {
			continue;
		}
	}
	clearInterval(lowConx);
	
	await driver[email].findElement(By.id('email')).sendKeys(email);
	await driver[email].findElement(By.id('password')).sendKeys(accountList[email].password);
	await driver[email].findElement(By.id('btnLogin')).click();
	try{
		await driver[email].findElement(By.className('general-error'));
		mainWindow.webContents.executeJavaScript("document.querySelector('#load-back').style.visibility = 'hidden';");
		error_message(1);
	}
	catch(err){
		await driver[email].findElement(By.id('btnSendCode')).click();


		if (await driver[email].findElement(By.id('oneTimeCode'))) {
			codeEaWindow.show();
		}
	}
	
}


//creat Menu
const mainMenuTemplate = [{
	label: 'File',
	submenu: [{
		label: 'Add Account',
		click() {
			createEaWindow();
		}
	}]
}];


//add developer tool
if (process.env.NODE_ENV !== 'production') {
	mainMenuTemplate.push({
		label: 'Developer Tools',
		submenu: [{
			label: 'Toggle Developer tool',
			accelerator: 'Ctrl+I',
			click(item, focusedWindow) {
				focusedWindow.toggleDevTools();
			}
		},
		{
			role: 'reload'
		}]
	});
}

// Attach listener in the main process with the given ID
ipcMain.on('requestHandler', (event, data) => {
	if (data.type === 'saveAccount')
		add_new_account(data);

	if (data.type === 'addAccount')
		createAddAccountWindow();

	if (data.type === 'openEaWindow')
		activate_account(data.email);

	if (data.type === 'DeleteAccount')
		delete_account(data.email);

	if (data.type === 'closeEaWindow')
		deactivate_account(data.email);

	if (data.type === 'sendEaCode')
		get_ea_code(data.codeEa);

	if(data.type === 'changeApiKey')
		change_api_key(data.apiKey);

	if (data.type === 'showAccContent') {
		emailBuy = data.divemail;
		mainWindow.webContents.executeJavaScript("document.querySelector('#error-msg').style.visibility = 'hidden';");
		for (i = 0; i < emailIsCon.length; i++) {
			if (emailIsCon[i] === data.divemail) {
				show_acc_content(data.divemail);
				break;
			}
		}
		if(emailIsCon.includes(data.divemail) === false){
			mainWindow.webContents.executeJavaScript("document.querySelector('#main-box').style.visibility = 'hidden';");
		}
	}

	if(data.type === 'buyPlayers'){

		fc.listP = [];  
		fc.getTradeFifacoins().then(function(p){
			if(p !== 'error-key'){
				var buy = setInterval(function(){
	
					if( p.length > 0 ){
	
						fn.getPlayerById(p[0][0]['resourceId'])
						.then(function (playerName){
							if(playerName != 'No results')
								buy_player(playerName,p[0][0]['buyNowPrice'],p[0][0]['startingBid'],emailBuy);
							
						}).then(function (){
							p.shift();
						});	
					}
					getCoins(emailBuy).then(function(s){
						if(s<5000){
							fc.stopTrade();
							clearInterval(buy);
						}
					});
					if(stopBuy === 'stopBuy')
						clearInterval(buy);
				},10000);
			}
			else{
				error_message(4);
			}
		}); 
	
	}
	if(data.type === 'stopBuy'){
		fc.stopTrade();
		stopBuy = 'stopBuy';
	}
});

function add_new_account(data) {

	add_account_to_menu(data.email);
	accountList[data.email] = {
		password: data.password
	};
	save_account_data();
	addAccountWindow.close();
	mainWindow.reload();

}

function change_api_key(data){
	var tab = [{"fifaCoinsApiKey":data}];
	let sendToJson = JSON.stringify(tab, null, 2);
	fs.writeFileSync('apiKeys.json', sendToJson);
}

function add_account_to_menu(email) {
	mainWindow.webContents.executeJavaScript(`
		document.getElementById('accounts-list').insertAdjacentHTML('beforeend','<div class= "email" onclick="show_account_content(this)"><p>${ email}</p><div class="delete-icon"></div><span class="switch"><input class="check" type="checkbox" onclick="isChecked(this)"><span class="slider"></span></span></div>');
	`);
}

function save_account_data() {
	var tab = [accountList];
	let sendToJson = JSON.stringify(tab, null, 2);
	fs.writeFileSync('accountInfo.json', sendToJson);
}

function deactivate_account(email) {
	mainWindow.webContents.executeJavaScript("document.querySelector('#main-box').style.visibility = 'hidden';");
	stopBuy = 'stopBuy';
	fc.stopTrade();
	driver[email].close();
	var index = emailIsCon.indexOf(email);
	if (index > -1) {
		emailIsCon.splice(index, 1);
	}
	console.log(emailIsCon);
}

function delete_account(emailDel) {
	emailDel = emailDel.toString();
	delete accountList[emailDel];
	var tab = [accountList];
	let sendToJson = JSON.stringify(tab, null, 2);
	fs.writeFileSync('accountInfo.json', sendToJson);

}

async function get_ea_code(eaCode) {
	await driver[emailAcc].findElement(By.id('oneTimeCode')).sendKeys(eaCode);
	await driver[emailAcc].findElement(By.id('btnSubmit')).click();

	try {
		if (await driver[emailAcc].findElement(By.className('origin-ux-textbox-status-icon'))) {
			codeEaWindow.webContents.executeJavaScript("document.querySelector('#code-error p').innerHTML = 'error code try again'");
			codeEaWindow.webContents.executeJavaScript("document.getElementById('submit-code').style.pointerEvents = 'auto'");
		}
	}
	catch (err) {
		codeEaWindow.webContents.executeJavaScript("document.querySelector('#code-error p').innerHTML = ''");
		codeEaWindow.close();
		
	}
	while(true){
		try{
			await driver[emailAcc].findElement(By.className('view-navbar-currency-coins'));
			mainWindow.webContents.executeJavaScript('document.getElementById("load-back").style.visibility = "hidden"');
			break;
		}
		catch(err){
			continue;
		}
	}
	
}
//show account information in a div
async function show_acc_content(em) {
	
	try{
		if(await driver[em].findElement(By.className('ut-livemessage-container'))){
			await driver[em].findElement(By.className('btn-standard call-to-action')).click();
		}
	}
	catch(err){

	}
	try {
		var clubeName = await driver[em].findElement(By.className('view-navbar-clubinfo-name')).getText();
		var coins = await driver[em].findElement(By.className('view-navbar-currency-coins')).getText();
		await driver[em].findElement(By.className('view-tab-bar-item icon-settings')).click();
		var platform = await driver[em].findElement(By.className('platform')).getAttribute("class");
		platform = await platform.replace('platform', '');
		mainWindow.webContents.executeJavaScript("document.querySelector('#main-box').style.visibility = 'visible';");
		mainWindow.webContents.executeJavaScript(`document.querySelector("#club-name").innerHTML = "${clubeName}" ;`);
		mainWindow.webContents.executeJavaScript(`document.querySelector("#coins").innerHTML = "${coins}" ;`);
		mainWindow.webContents.executeJavaScript(`document.querySelector("#platform").innerHTML = "${platform}" ;`);
		
	}
	catch (err) {
		mainWindow.webContents.executeJavaScript(`
		for(i=0;i<document.getElementsByClassName('email').length;i++){
			document.getElementsByClassName('email')[i].style.pointerEvents = 'auto';
			document.getElementsByClassName('email')[i].style.backgroundColor = '#cccedb';
			document.getElementsByClassName('email')[i].onmouseover = function(){this.style.backgroundColor = '#b4b4b4'};
				document.getElementsByClassName('email')[i].onmouseleave  = function(){this.style.backgroundColor = '#cccedb'};
		}
		`);
	}
}

async function getCoins(email){
	var coins = await driver[email].findElement(By.className('view-navbar-currency-coins')).getText();
	console.log(coins)
	coins = coins.replace(/\s/,'');
	coins = coins*1;
	return coins;
}
// buy player from ultimate team 

async function buy_player(namePlayer, buyPrice, bidPrice, email) {

	var coins = await driver[email].findElement(By.className('view-navbar-currency-coins')).getText();
	coins = coins.replace(/\s/,'');
	coins = coins*1;
	buyPrice = buyPrice*1;
	console.log(namePlayer);

	if(coins >= buyPrice){
		var inp = [];
		var btnBuy = []
		var nbrPlayer = [];
		await driver[email].findElement(By.className('view-tab-bar-item icon-transfer')).click();
		while (true) {
			try {
				await driver[email].findElement(By.className('tile col-1-1 ut-tile-transfer-market')).click();
				
				break;
				
			}
			catch (err) {
				continue;
			}
		}
		while (true) {
			try {
				inp = await driver[email].findElements(By.className("numericInput"));
				break;
				
			}
			catch (err) {
				continue;
			}
		}
		while(true){
			try{
				if(inp[0]){
					await driver[email].findElement(By.className("textInput")).click();
					await driver[email].findElement(By.className("textInput")).sendKeys(namePlayer);
					
				}
				break;
			}
			catch(err){
				continue;
			}
		}
		while(true){
			try{
				await driver[email].findElement(By.className("ut-button-group playerResultsList")).click();
				break;
			}
			catch(err){
				continue;
			}
		}
		while(true){
			try{
				if(inp[0]){
					await inp[0].click();
					await inp[0].sendKeys(bidPrice);
					await inp[1].click();
					await inp[1].sendKeys(bidPrice);
					await inp[2].click();
					await inp[2].sendKeys(buyPrice);
					await inp[3].click();
					await inp[3].sendKeys(buyPrice);
					await driver[email].findElement(By.className("btn-standard call-to-action")).click();	
				}
				break;
			}
			catch(err){
				continue;
			}
		}

		
		while(true){
			try{

				nbrPlayer = await driver[email].findElements(By.className("listFUTItem has-auction-data"));
				if(nbrPlayer.length === 1){
					buy_message(0,namePlayer,buyPrice);
					await driver[email].findElement(By.className("btn-standard buyButton coins")).click();
					while(true){
						try{

							let btnBuy = await driver[email].findElements(By.className("flat"));
							await btnBuy[1].click();
							await driver[email].findElement(By.className('view-tab-bar-item icon-home')).click();
							break;
						}

						catch(err){
							continue;
						}
					}
					while(true){
						try{
							await driver[email].findElement(By.className('view-tab-bar-item icon-squad')).click(); 
							break;
						}
						catch(err){
							continue;
						}
					}
					while(true){
						try{
							await driver[email].findElement(By.className('view-tab-bar-item icon-home')).click(); 
							break;
						}
						catch(err){
							continue;
						}
					}
					while(true){
						try{
							await driver[email].findElement(By.id('UnassignedTile')).click();
							break;
						}
						catch(err){
							continue;
						}
					}
					while(true){
						try{
							await driver[email].findElement(By.className('ut-group-button cta')).click();
							buy_message(0,namePlayer,buyPrice);
							break;
						}
						catch(err){
							continue;
						}
					}
					while(true){
						try{
							let btnQuickSell = await driver[email].findElements(By.className("flat"));
							await btnQuickSell[1].click();
							await driver[email].findElement(By.className('view-tab-bar-item icon-settings')).click();
							break
						}
						catch(err){
							continue;
						}
					}

				}
				if(nbrPlayer.length>1){

					buy_message(2,namePlayer)
					await driver[email].findElement(By.className('view-tab-bar-item icon-settings')).click();
					break;

				}
				if(await driver[email].findElement(By.className("no-results-screen"))){

					buy_message(1,namePlayer);
					await driver[email].findElement(By.className('view-tab-bar-item icon-settings')).click();
					break;

				}
				
			}
			catch(err){

				try{
					await driver[email].findElement(By.className("no-results-screen"))
					buy_message(1,namePlayer);
					break;
				}

				catch(err){
					continue;
				}
				
			}
		}

	}
	else{
		buy_message(3,namePlayer);
	}
}

function error_message(ty,coins){
	if(ty === 1){
		mainWindow.webContents.executeJavaScript("document.querySelector('#error-txt').innerHTML = 'INVALID EMAIL OR PASSWORD';");
		mainWindow.webContents.executeJavaScript("document.querySelector('#error-msg').style.visibility = 'visible';");
	}
	if(ty === 2){
		mainWindow.webContents.executeJavaScript("document.querySelector('#error-txt').innerHTML = 'CONNECTION PROBLEM TRY AGAIN';");
		mainWindow.webContents.executeJavaScript("document.querySelector('#error-msg').style.visibility = 'visible';");
	}
	if(ty === 3){
		mainWindow.webContents.executeJavaScript(`document.querySelector('#error-txt').innerHTML = 'END OF BUY . STILL IN YOUR ACCOUNT ${coins} COINS';`);
		mainWindow.webContents.executeJavaScript("document.querySelector('#error-msg').style.background-color = '#007acc';");
		mainWindow.webContents.executeJavaScript("document.querySelector('#error-msg').style.visibility = 'visible';");
	}
	if(ty === 4){
		mainWindow.webContents.executeJavaScript(`document.querySelector('#error-txt').innerHTML = 'API KEY ERROR';`);
		mainWindow.webContents.executeJavaScript("document.querySelector('#error-msg').style.visibility = 'visible';");
	}
}

function buy_message(state,plname,val){
	if(state === 0){
		mainWindow.webContents.executeJavaScript(`
		document.getElementById('players-liste').insertAdjacentHTML('beforeend','<div class="buy-state"><div id="player-name">${plname}</div><div id="discription-pos">Buying Succeeded ${val} coins</div><div id="discription-neg"></div></div>');
		`);
	}
	if(state === 1){
		mainWindow.webContents.executeJavaScript(`
		document.getElementById('players-liste').insertAdjacentHTML('beforeend','<div class="buy-state"><div id="player-name">${plname}</div><div id="discription-pos"></div><div id="discription-neg">No Result</div></div>');
		`);
	}
	if(state === 2){
		mainWindow.webContents.executeJavaScript(`
		document.getElementById('players-liste').insertAdjacentHTML('beforeend','<div class="buy-state"><div id="player-name">${plname}</div><div id="discription-pos"></div><div id="discription-neg">More Than One</div></div>');
		`);
	}
	if(state === 3){
		mainWindow.webContents.executeJavaScript(`
		document.getElementById('players-liste').insertAdjacentHTML('beforeend','<div class="buy-state"><div id="player-name">${plname}</div><div id="discription-pos"></div><div id="discription-neg">The Price Of The Player Is Bigger</div></div>');
		`);
	}
}

