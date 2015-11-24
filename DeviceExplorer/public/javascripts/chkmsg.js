var xhr = new XMLHttpRequest();
var iswaiting = false;

function chkmsg() {
    iswaiting = true;
    xhr.open('GET', '/msgstatus');
    xhr.send(null);
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            if (xhr.responseText != '')
                boxMSG.innerHTML = xhr.responseText;
        }
    }
    iswaiting = false;
}

setInterval(function () { if (!iswaiting) chkmsg(); }, 1000);