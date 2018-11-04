const electron = require('electron');
const path = require('path');
const url = require('url');
var fs = require('fs');

require('electron-reload')(__dirname, { electron: require(  path.join(__dirname, 'node_modules', 'electron') ) });

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
    mainWindow.show()
  })
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
  addAccountWindow.on('close', function(){
    addAccountWindow = null;
  });
}

// ea web app
function createEaWindow(emailAcc,passAcc,sessAcc){
  var loadingWindow = new BrowserWindow({width: 600, height: 400, transparent: true, frame: false, parent: mainWindow, modal: true});
  // add loadingWindow 
  loadingWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'views/loading.html'),
    protocol: 'file:',
    slashes:true
  }));
  // create ea window
  var eaWindow = new BrowserWindow({width:600, height:400, show:false, parent: mainWindow, modal: true, webPreferences: {
    partition: 'persist:mywin'
  }});
  eaWindow.on('close', function(){
    eaWindow = null;
  });
  eaWindow.loadURL('https://fantasy.premierleague.com/');
  
  
  
  
  // send email and pass to ea 
  eaWindow.webContents.on('did-finish-load', ()=>{
    
    let userName = `var emailInput = document.getElementById("ismjs-username");
                emailInput.value ="`+emailAcc+'"';
    let password = `var passInput = document.getElementById("ismjs-password");
                passInput.value ="`+passAcc+'"';
    
    eaWindow.webContents.executeJavaScript(userName);
    eaWindow.webContents.executeJavaScript(password);
    loadingWindow.destroy();
    eaWindow.show();
    return eaWindow;
  });
  
  
}



//creat Menu
const mainMenuTemplate =  [
    {
    label: 'File',
    submenu:[{
      label: 'Add Account',
      click(){
        createEaWindow();  
      }
    }]
  }
];



        

//add developer tool
if(process.env.NODE_ENV !== 'production'){
  mainMenuTemplate.push({
    label: 'Developer Tools',
    submenu: [
      {
        label: 'Toggle Developer tool',
        accelerator: 'Ctrl+I',
        click(item, focusedWindow){
          focusedWindow.toggleDevTools();
        }
      },
      {
        role: 'reload'
      }
    ]

  });
}



// Attach listener in the main process with the given ID
ipcMain.on('requestHandler', (event, data) => {
   if(data.type === 'saveAccount'){
     //catch email-acc and password-acc
      addAccountWindow.close();
      accountList[data.email] = {
        password : data.password,
        session: null
      }
      var tab = [accountList];
      let sendToJson = JSON.stringify(tab,null,2);
      fs.writeFileSync('accountInfo.json',sendToJson);  
   }

   if(data.type === 'addAccount'){
    
    createAddAccountWindow();
   }
   if(data.type === 'openEaWindow'){
    accountList = JSON.parse(fs.readFileSync('accountInfo.json'))[0];
    opened_windows[data.email] = createEaWindow(data.email,accountList[data.email].password,accountList[data.email].session);
    
   }
});

