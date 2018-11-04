const electron = require('electron');
const path = require('path');
const url = require('url');
require('electron-reload')(__dirname, { electron: require(  path.join(__dirname, 'node_modules', 'electron') ) });

const {app, BrowserWindow, Menu, session, ipcMain} = electron;
let addAccountWindow;

let account = {emailAcc:'',passwordAcc:'',sessionAcc: null};
let accountList = {};
app.on('ready', function(){
    // Create new window
  mainWindow = new BrowserWindow({});
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
function createEaWindow(){
  eaWindow = new BrowserWindow({width:600, height:400, parent: mainWindow});
  eaWindow.on('close', function(){
    eaWindow = null;
  });
  eaWindow.loadURL('https://github.com');
  

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
    
      console.log(accountList);  
   }

   if(data.type === 'addAccount'){
    
    createAddAccountWindow();
   }
   if(data.type === 'openEaWindow'){
     console.log(11222)
     createEaWindow();
   }
});

