
document.querySelectorAll('.drop_box').forEach(initialise)

function initialise(box) {
    box.dataset.full = false;
    box.addEventListener("drop", handleBoxDrop);
}

function allowDrop (ev)  { 
    ev.preventDefault (); 
} 


function drag(ev) {
    ev.dataTransfer.setData('text',ev.target.id ); 
}


function handleBoxDrop(ev) { 
    ev.preventDefault (); 

    let target = ev.target;
    let data  =  ev.dataTransfer.getData('text'); 

    while (target.tagName !== "DIV" && target.tagName !== "SPAN") {
    target = target.parentElement;
    }  

    if (target.children.length === 0) {
        target.dataset.full = false;
    }

    if (target.dataset.full === "false") {
        target.appendChild(document.getElementById(data));
        target.dataset.full = true;
    }
}

function wordContainerDrop(ev)  { 
    ev.preventDefault (); 

    let target = ev.target;
    let data  =  ev.dataTransfer.getData('text'); 
    
    while (target.tagName !== "DIV" && target.tagName !== "SPAN") {
        target = target.parentElement;
    } 
    target.appendChild(document.getElementById(data)); 
} 