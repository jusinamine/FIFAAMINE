const {ipcRenderer} = require('electron');

function fill_menu() {
    // get account data from json file
    var getAccounts = new XMLHttpRequest();
    getAccounts.open('GET','../accountInfo.json');
    getAccounts.onload = () => {
        var textHtml = '';
        var xdata = JSON.parse(getAccounts.responseText);

        for(i = 0; i < Object.keys(xdata[0]).length; i++)
            textHtml += `<div class= "email"><p>${ Object.keys(xdata[0])[i] }</p><span class="switch"><input class="check" type="checkbox" onclick="isChecked(this)"><span class="slider"></span></span></div>`;

        document.getElementById('accounts-list').insertAdjacentHTML("beforeend", textHtml);
    };
    getAccounts.send();
}


function add_account() {
    // send add account if click
    document.querySelector("#add-account").addEventListener('click', ()=> {
        let data = { type: 'addAccount' };
        ipcRenderer.send('requestHandler', data);
    });
}


function isChecked(elem){
    if(elem.checked === true){
        let data = {
            email: elem.parentElement.parentElement.querySelector('p').innerText,
            type: 'openEaWindow'
        };
        ipcRenderer.send('requestHandler', data);
    }
}


document.addEventListener('DOMContentLoaded', () => {
    fill_menu();
    add_account();
});