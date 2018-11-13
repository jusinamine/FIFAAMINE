const electron = require('electron');
const path = require('path');
const url = require('url');
var fs = require('fs');
const {Builder, By, Key, until} = require('selenium-webdriver');
chrome    = require('selenium-webdriver/chrome');
require('electron-reload')(__dirname, { electron: require(  path.join(__dirname, 'node_modules', 'electron') ) });
 //require('electron-reload')(__dirname);

const {app, BrowserWindow, Menu, session, ipcMain, webContents} = electron;
var jsonFile = require('./accountInfo'); 
let addAccountWindow;
let account = [];
let accountList = {};
const ea_site = "https://signin.ea.com/p/web2/login?execution=e946554039s1&initref=https%3A%2F%2Faccounts.ea.com%3A443%2Fconnect%2Fauth%3FaccessToken%3DQVQwOjEuMDozLjA6NjA6ZzZhT2dRQzBMazNzcnpRRFlETnU5anRrWk9rZkNhc0xNZ1E6OTc1OTc6b2ZicWg%26client_id%3DFIFA-19-WEBCLIENT%26response_type%3Dtoken%26display%3Dweb2%252Flogin%26locale%3Dfr_FR%26redirect_uri%3Dhttps%253A%252F%252Fwww.easports.com%252Ffr%252Ffifa%252Fultimate-team%252Fweb-app%252Fauth.html%26release_type%3Dprod%26scope%3Dbasic.identity%2Boffline%2Bsignin";
const webapp = "https://www.easports.com/fr/fifa/ultimate-team/web-app/"
app.on('ready', function(){
	// Create new window
	mainWindow = new BrowserWindow({show:false});

	mainWindow.once('ready-to-show', () => {
		mainWindow.show();
		accountList = JSON.parse(fs.readFileSync('accountInfo.json'))[0];
	});

	mainWindow.on('close', () => {
		save_account_data();
		deactivate_account();
	});

	mainWindow.loadURL(url.format({
		pathname: path.join(__dirname, 'views/mainWindow.html'),
		protocol: 'file:',
		slashes:true
	}));

	const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
	Menu.setApplicationMenu(mainMenu);

});

// ADD WINDOW
function createAddAccountWindow(){
	addAccountWindow = new BrowserWindow({width:300, height:200, parent: mainWindow});
	addAccountWindow.loadURL(url.format({
		pathname: path.join(__dirname, 'views/addAc.html'),
		protocol: 'file:',
		slashes:true
	}));

	addAccountWindow.on('close', () => {
		addAccountWindow = null;
	});
}

function createCodeAccountWindow(){
	codeAccountWindow = new BrowserWindow({width:300, height:200,parent: mainWindow});
	codeAccountWindow.loadURL(url.format({
		pathname: path.join(__dirname, 'views/getCode.html'),
		protocol: 'file:',
		slashes:true
	}));
	codeAccountWindow.on('close', () => {
		codeAccountWindow = null;
	});
}


function activate_account(email){
	/*
	driver = new Builder().forBrowser('chrome').setChromeOptions(new chrome.Options()).build();
	codeEaWindow = new BrowserWindow({width:300, height:200, show:false, parent: mainWindow});
	codeEaWindow.loadURL(url.format({
		pathname: path.join(__dirname, 'views/getCode.html'),
		protocol: 'file:',
		slashes:true
	}));
	driver.get(ea_site) //login to ea account and show window to set ur code
	.then(function(){
		emailBox = driver.findElement(By.id('email'));
		passBox = driver.findElement(By.id('password'));
		emailBox.sendKeys(email);
		passBox.sendKeys(accountList[email].password)
		.then(function(){passBox.getAttribute("value").then(function(p){

			if(p.length>0){
				driver.findElement(By.id('btnLogin')).click();
			}

		}).then(function(){

			TextCode = driver.findElement(By.id('btnSendCode'));
			TextCode.isDisplayed().then(function(text){if(text===true){ TextCode.click();}})
			.then(function(){codeEaWindow.show();});

		});})
	
	});*/
	driver = new Builder().forBrowser('chrome').setChromeOptions(new chrome.Options()).build();
	driver.get(webapp).then(function(){
		
		driver.wait(function(){
			driver.findElement(By.className('btn-standard call-to-action')).click()
		})
	
	}
);
	

		
		
			
	
}

//creat Menu
const mainMenuTemplate =  [{
    label: 'File',
    submenu:[{
		label: 'Add Account',
		click(){
			createEaWindow();  
		}
    }]
}];



        

//add developer tool
if(process.env.NODE_ENV !== 'production'){
	mainMenuTemplate.push({
		label: 'Developer Tools',
		submenu: [{
			label: 'Toggle Developer tool',
			accelerator: 'Ctrl+I',
			click(item, focusedWindow){
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
	if(data.type === 'saveAccount')
		add_new_account(data);

	if(data.type === 'addAccount')
		createAddAccountWindow();
	
	if(data.type === 'openEaWindow')
		activate_account(data.email);
	
	if(data.type === 'DeleteAccount')
		delete_account(data.email);

	if(data.type === 'closeEaWindow')
		deactivate_account(data.email);
	if(data.type === 'sendEaCode')
		get_ea_code(data.codeEa);
});

function add_new_account(data) {
	add_account_to_menu(data.email);
	
	addAccountWindow.on('close', event => {
		accountList[data.email] = {
			password : data.password
		}
		save_account_data();
	});
	addAccountWindow.close();
}



function add_account_to_menu(email){
	mainWindow.webContents.executeJavaScript(`
		document.getElementById('accounts-list').insertAdjacentHTML('beforeend','<div class= "email"><p>${ email }</p><div class="delete-icon"></div><span class="switch"><input class="check" type="checkbox" onclick="isChecked(this)"><span class="slider"></span></span></div>');
	`);
}

function save_account_data() {
	/*
	for (let email in accountList) {
		accountList[email].window  = null;
	}*/
	var tab = [accountList];
	let sendToJson = JSON.stringify(tab,null,2);
	fs.writeFileSync('accountInfo.json',sendToJson);  
}

function deactivate_account(email) {
	driver.close();
}

function delete_account(emailDel) {
	
	emailDel = emailDel.toString();
	delete accountList[emailDel];
	var tab = [accountList];
	let sendToJson = JSON.stringify(tab,null,2);
	fs.writeFileSync('accountInfo.json',sendToJson);
	
}
/*
function get_ea_code(eaCode){
	var inputCode = driver.findElement(By.id('oneTimeCode'));
	var btnSubmit = driver.findElement(By.id('btnSubmit'));
	var isCorrect = driver.findElement(By.className('origin-ux-textbox-status-icon'));
	inputCode.sendKeys(eaCode).then(function(){
		
		inputCode.getAttribute("value").then(function(v){
			if(v.length>0){
				btnSubmit.click();
				isCorrect.isDisplayed().then(function(stat){
					//if code ea is false
					if(stat===true){
						codeEaWindow.webContents.executeJavaScript("document.querySelector('#code-error p').innerHTML = 'error code try again'");
					}
					else{
						codeEaWindow.webContents.executeJavaScript("document.querySelector('#code-error p').innerHTML = ''");
						codeEaWindow.close();
					}
				});
				
			}
		});
	}).then(setTimeout(
		function(){
			cnxbtn = driver.findElement(By.className('btn-standard call-to-action'));
			
			cnxbtn.isEnable().then(function(cnx){
				if(cnx === true){
					cnxbtn.click();
				}
			})
		},50000
	));
	
	
}
*/
