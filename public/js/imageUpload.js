var input = document.getElementById('image');
var infoArea = document.getElementById('file-upload-filename');

input.addEventListener('change', showFileName);
input.addEventListener('click', reShowFileName);

function reShowFileName(){
    infoArea.innerText = ""
}

function showFileName(event) {

    // the change event gives us the input it occurred in 
    var input = event.srcElement;
    const files = input.files;
    if (files.length > 1) {
        infoArea.innerHTML += "uploaded Images: &nbsp;"
        infoArea.innerText += files[0].name;
        for (let i = 1; i < 3; i++) {
            infoArea.innerText += `, ${files[i].name}`;
        }
        if(files.length > 3){
            infoArea.innerText += "...";

        }
    }
}