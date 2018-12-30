const {ipcRenderer} = require('electron');

function fill_menu() {
    // get account data from json file
    var getAccounts = new XMLHttpRequest();
    getAccounts.open('GET','../accountInfo.json');
    getAccounts.onload = () => {
        var textHtml = '';
        var xdata = JSON.parse(getAccounts.responseText);

        for(i = 0; i < Object.keys(xdata[0]).length; i++)
            textHtml += `<div class= "email" onclick="show_account_content(this)"><p>${ Object.keys(xdata[0])[i] }</p><div class="delete-icon"></div><span class="switch" onclick="isChecked(this)"><input class="check" type="checkbox"><span class="slider"></span></span></div>`;

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

// when content is load
document.addEventListener('DOMContentLoaded', () => {
    delete_account();
    fill_menu();
    add_account();
    
});

deleteBtn = document.getElementById("delete-account");
deleteIcon = document.getElementsByClassName("delete-icon");
okBtn = document.getElementById("btn-ok");
cancelBtn = document.getElementById("btn-cancel");
alertBgr = document.getElementById("alert-bgr");
alertBox = document.getElementById("alert-box");
var clickBtn = 0;

function delete_account(){
   
    deleteBtn.addEventListener('click',()=>{
       
        // verify if button delete or cancel
        textInsideBtn = document.querySelector("#delete-account p");
        if (clickBtn === 0){
            //if delete transfer delete button to cancel
            textInsideBtn.innerHTML = "CANCEL";
            textInsideBtn.style.color = "#007acc"
            deleteBtn.style.backgroundColor = "#FFF";

            for(i=0;i<deleteIcon.length;i++){
                deleteIcon[i].style.visibility = "visible";
            } 
            
            clickBtn = 1;
            
            for (i = 0; i < deleteIcon.length; i++) {
                // show alert before delete account 
                deleteIcon[i].onclick = function() {
                    emailDel = this.parentNode.childNodes[0].innerText;
                    divDel = this.parentNode;
                    //show alert
                    alertBox.style.visibility = "visible";
                    alertBgr.style.visibility = "visible";

                    okBtn.onclick = function(){
                        alertBox.style.visibility = "hidden";
                        alertBgr.style.visibility = "hidden";

                        send_and_delete(emailDel,divDel);
                        //switch cancel to delete account
                        textInsideBtn.innerHTML = "DELETE ACCOUNT";
                        textInsideBtn.style.color = "#FFF";
                        deleteBtn.style.backgroundColor = "#F44336";
                        for(i=0;i<deleteIcon.length;i++){
                            deleteIcon[i].style.visibility = "hidden";
                        } 
                        clickBtn = 0;
                    };

                    cancelBtn.onclick = function(){
                        alertBox.style.visibility = "hidden";
                        alertBgr.style.visibility = "hidden";
                    };
                }
              }
            
        }
        // if cancel transfer cancel button to delete
        else{
            textInsideBtn.innerHTML = "DELETE ACCOUNT";
            textInsideBtn.style.color = "#FFF";
            deleteBtn.style.backgroundColor = "#F44336";
            for(i=0;i<deleteIcon.length;i++){
                deleteIcon[i].style.visibility = "hidden";
            } 
            clickBtn = 0;
        }
    });
}

//delete div and send to node

function send_and_delete(emailAcc,elAcc){
    let data = {
        email: emailAcc,
        type: 'DeleteAccount'
        };

    ipcRenderer.send('requestHandler', data);
    elAcc.remove();
}

// when click on email div send email of div and change style
function show_account_content(elm){
   
    for(i=0;i<document.getElementsByClassName('email').length;i++){
        document.getElementsByClassName('email')[i].style.pointerEvents = 'auto';
        document.getElementsByClassName('email')[i].style.backgroundColor = '#cccedb';
        document.getElementsByClassName('email')[i].onmouseover = function(){this.style.backgroundColor = '#b4b4b4'};
        document.getElementsByClassName('email')[i].onmouseleave  = function(){this.style.backgroundColor = '#cccedb'};
    }
    
    elm.style.backgroundColor = '#b4b4b4'
    elm.onmouseleave  = function(){this.style.backgroundColor = '#b4b4b4'};
    elm.style.pointerEvents = 'none';

    let data = {
        divemail: elm.childNodes[0].textContent,
        type: 'showAccContent'
        };
    ipcRenderer.send('requestHandler', data);
}
var clickBuy = 0;
document.getElementById('buy-players').addEventListener('click', () => {
    if(clickBuy === 0){
        document.getElementById('buy-players').style.backgroundColor = "#F44336";
        document.querySelector('#buy-players p').innerHTML = "STOP BUY";
        clickBuy = 1;
        let data = {
            type: 'buyPlayers'
            };
        ipcRenderer.send('requestHandler', data);
    }
    else{
        document.getElementById('buy-players').style.backgroundColor = "#007acc";
        document.querySelector('#buy-players p').innerHTML = "START BUY PLAYERS";
        clickBuy = 0;
        let data = {
            type: 'stopBuy'
            };
        ipcRenderer.send('requestHandler', data);
    }

});
//api key modification
var clickbtnkey = 0;
document.getElementById('api-key-btn').addEventListener('click', () => {
    console.log(clickbtnkey)
    if(clickbtnkey === 0){
        document.getElementById('api-key-inp').style.visibility = 'visible';
        document.getElementById('api-key-btn').style.backgroundColor = 'white';
        document.querySelector('#api-key-btn p').style.color = '#007acc';
        document.querySelector('#api-key-btn p').innerHTML = 'SAVE MODIFICATION';
        clickbtnkey = 1;
    }
    else{
        var newKey = document.getElementById("api-key-inp").value;
        document.getElementById('api-key-inp').style.visibility = 'hidden';
        document.getElementById('api-key-btn').style.backgroundColor = '#007acc';
        document.querySelector('#api-key-btn p').style.color = 'white';
        document.querySelector('#api-key-btn p').innerHTML = 'CHANGE';
        if(newKey !== ''){
            let data = {
                apiKey : newKey,
                type: 'changeApiKey'
                };
            ipcRenderer.send('requestHandler', data);
        }
        document.getElementById("api-key-inp").value = '';
        clickbtnkey = 0;
    }

});