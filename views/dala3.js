const {ipcRenderer} = require('electron');


// get account data from json file
var getAccounts = new XMLHttpRequest();
console.log(getAccounts);
getAccounts.open('GET','../accountInfo.json');
getAccounts.onload = function(){
    var textHtml = ''
    var xdata = JSON.parse(getAccounts.responseText);
    var parent = document.getElementById('parent');
    for(i=0;i<Object.keys(xdata[0]).length;i++){
        textHtml += '<div class= "email">'+'<p>'+ Object.keys(xdata[0])[i] + '</p>' + '<label class="switch">' + '<input class="check" type="checkbox" onclick="isChecked(this)">'+'<span class="slider">'+'</span>'+'</label>'+'</div>';
        console.log(Object.keys(xdata[0])[i]);
    }
    parent.insertAdjacentHTML("beforeend",textHtml);
   
};
getAccounts.send();

// send add account if click
var add = document.querySelector("#add-account");


add.addEventListener('click', ()=> {
    
    let data = {
            
        type: 'addAccount'
    }
    ipcRenderer.send('requestHandler', data);

});



// open ea window when checkebox is checked and send email of checkbox target

var infoemail = document.getElementsByTagName("p");
console.log(infoemail)
var ch = document.getElementsByClassName("check");
function isChecked(el){
    
    if(el.checked === true){
        
        let data = {
            email: infoemail[indexInClass(el)+2].innerText,
            type: 'openEaWindow'
        }
        ;
        ipcRenderer.send('requestHandler', data);
    }
    
}
//get class index of checkbox
function indexInClass(node) {
    var className = node.className;
    var num = 0;
    for (var i = 0; i < ch.length; i++) {
      if (ch[i] === node) {
        return num;
      }
      num++;
    }
    return -1;
  }








        

    
        
