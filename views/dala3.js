const {ipcRenderer} = require('electron');

function fill_menu() {
    // get account data from json file
    var getAccounts = new XMLHttpRequest();
    getAccounts.open('GET','../accountInfo.json');
    getAccounts.onload = () => {
        var textHtml = '';
        var xdata = JSON.parse(getAccounts.responseText);

        for(i = 0; i < Object.keys(xdata[0]).length; i++)
            textHtml += `<div class= "email"><p>${ Object.keys(xdata[0])[i] }</p><div class="delete-icon"></div><span class="switch" onclick="isChecked(this)"><input class="check" type="checkbox"><span class="slider"></span></span></div>`;

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