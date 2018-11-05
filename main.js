const electron = require('electron');
const path = require('path');
const url = require('url');
var fs = require('fs');

// require('electron-reload')(__dirname, { electron: require(  path.join(__dirname, 'node_modules', 'electron') ) });
require('electron-reload')(__dirname);

const {app, BrowserWindow, Menu, session, ipcMain, webContents} = electron;
var jsonFile = require('./accountInfo'); 
let addAccountWindow;
let account = [];
let accountList = {};
var opened_windows = {};


app.on('ready', function(){
	// Create new window
	mainWindow = new BrowserWindow({show:false});

	mainWindow.once('ready-to-show', () => {
		mainWindow.show();
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
function createEaWindow(emailAcc, passAcc){
	session.defaultSession.clearStorageData();
	// var loadingWindow = new BrowserWindow({width: 600, height: 400, transparent: true, frame: false, parent: mainWindow, modal: true});
	// add loadingWindow 
	// loadingWindow.loadURL(url.format({
	// 	pathname: path.join(__dirname, 'views/loading.html'),
	// 	protocol: 'file:',
	// 	slashes:true
	// }));
	// create ea window

	// var ses = session.fromPartition(emailAcc);

	
	opened_windows[emailAcc] = {
		window : new BrowserWindow({width:600, height:400, show:false, parent: mainWindow}),
		cookies : null,
	};

	// opened_windows[emailAcc].window.on('close', event => {
	// 	opened_windows[emailAcc].window.webContents.session.cookies.get({}, (error, cookies) => {
	// 		opened_windows[emailAcc].cookies = cookies;
	// 		console.log(opened_windows[emailAcc].cookies);
	// 	});
	// });

	opened_windows[emailAcc].window.loadURL('https://fantasy.premierleague.com/');

	// send email and pass to ea 
	opened_windows[emailAcc].window.webContents.on('did-finish-load', () => {
		
		opened_windows[emailAcc].window.webContents.executeJavaScript(
			`document.getElementById("ismjs-username").value = '${emailAcc}';`
		);
		opened_windows[emailAcc].window.webContents.executeJavaScript(
			`document.getElementById("ismjs-password").value = '${passAcc}';`
		);
		// loadingWindow.destroy();
		opened_windows[emailAcc].window.show();
		
		opened_windows[emailAcc].window.webContents.session.clearStorageData([], () => {});
		
	});
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
	if(data.type === 'saveAccount'){
		//catch email-acc and password-acc
		addAccountWindow.close();
		accountList[data.email] = {
			password : data.password,
			// session: null
		};
		var tab = [accountList];
		let sendToJson = JSON.stringify(tab,null,2);
		fs.writeFileSync('accountInfo.json',sendToJson);  
	}

	if(data.type === 'addAccount')
		createAddAccountWindow();

	if(data.type === 'openEaWindow'){
		accountList = JSON.parse(fs.readFileSync('accountInfo.json'))[0];
		createEaWindow(data.email,accountList[data.email].password);
	}
});

