const electron = require('electron');
const path = require('path');
const url = require('url');
var fs = require('fs');

// require('electron-reload')(__dirname, { electron: require(  path.join(__dirname, 'node_modules', 'electron') ) });
// require('electron-reload')(__dirname);

const {app, BrowserWindow, Menu, session, ipcMain, webContents} = electron;
var jsonFile = require('./accountInfo'); 
let addAccountWindow;
let account = [];
let accountList = {};
const ea_site = "https://fantasy.premierleague.com/";

app.on('ready', function(){
	// Create new window
	mainWindow = new BrowserWindow({show:false});

	mainWindow.once('ready-to-show', () => {
		mainWindow.show();
		accountList = JSON.parse(fs.readFileSync('accountInfo.json'))[0];
	});

	mainWindow.on('close', () => {
		save_account_data();
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

// ea web app
function activate_account(email){
	accountList[email].window = new BrowserWindow({width:600, height:400, show:false, parent: mainWindow});
	accountList[email].window.webContents.session.clearStorageData({storages:['cookies']});

	accountList[email].cookies.forEach(cookie => {
		cookie.url = ea_site;
		accountList[email].window.webContents.session.cookies.set( cookie, error => {
			if (error)
				console.dir(error);
		});
	});

	accountList[email].window.on('close', () => {

		accountList[email].window = null;
	});

	accountList[email].window.loadURL(ea_site);

	// accountList[email].window.webContents.on('did-finish-load', () => {
	// 	accountList[email].window.show();
	// });
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

});

function add_new_account(data) {
	var window = new BrowserWindow({width:600, height:400, show:false, parent: mainWindow});
	window.webContents.session.clearStorageData({storages:['cookies']});

	window.on('close', event => {
		accountList[data.email] = {
			password : data.password
		};

		window.webContents.session.cookies.get({}, (error, retrieved_cookies) => {
			accountList[data.email].cookies = retrieved_cookies;
			save_account_data();
		});

		addAccountWindow.close();

		add_account_to_menu(data.email);

	});

	window.loadURL(ea_site);

	// send email and pass to ea 
	window.webContents.on('did-finish-load', () => {
		
		window.webContents.executeJavaScript(
			`document.getElementById("ismjs-username").value = '${data.email}';`
		);
		window.webContents.executeJavaScript(
			`document.getElementById("ismjs-password").value = '${data.password}';`
		);

		window.show();
		
	});
}


function add_account_to_menu(email) {
	mainWindow.webContents.executeJavaScript(`
		document.getElementById('accounts-list').insertAdjacentHTML('beforeend','<div class= "email"><p>${ email }</p><span class="switch"><input class="check" type="checkbox" onclick="isChecked(this)"><span class="slider"></span></span></div>');
	`);
}

function save_account_data() {
	for (let email in accountList) {
		accountList[email].window  = null;
	}
	var tab = [accountList];
	let sendToJson = JSON.stringify(tab,null,2);
	fs.writeFileSync('accountInfo.json',sendToJson);  
}
