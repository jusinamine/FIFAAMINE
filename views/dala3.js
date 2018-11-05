const {ipcRenderer} = require('electron');

function fill_menu() {
    // get account data from json file
    var getAccounts = new XMLHttpRequest();
    getAccounts.open('GET','../accountInfo.json');
    getAccounts.onload = () => {
        var textHtml = '';
        var xdata = JSON.parse(getAccounts.responseText);

        for(i = 0; i < Object.keys(xdata[0]).length; i++)
            textHtml += `<div class= "email"><p>${ Object.keys(xdata[0])[i] }</p><span class="switch" onclick="isChecked(this)"><input class="check" type="checkbox"><span class="slider"></span></span></div>`;

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

    if (elem.querySelector('input').checked)
        elem.querySelector('input').checked = false;
    else
        elem.querySelector('input').checked = true;

    if(elem.querySelector('input').checked === true){
        let data = {
            email: elem.parentElement.querySelector('p').innerText,
            type: 'openEaWindow'
        };
        ipcRenderer.send('requestHandler', data);
    }
    else {
        let data = {
            email: elem.parentElement.querySelector('p').innerText,
            type: 'closeEaWindow'
        };
        ipcRenderer.send('requestHandler', data);
    }
}


document.addEventListener('DOMContentLoaded', () => {
    fill_menu();
    add_account();
});