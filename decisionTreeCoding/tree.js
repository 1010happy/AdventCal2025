///ddd = drag dropdown direct

// let //can reval but not redeclare (var can be redeclared accidentally), const is ur normal let

// function make_ddd(id, optionsArray){
//   let div = document.createElement("div")
//   div.id = id;
//   div.setAttribute("class", "draggable-select");
//   // dispatchEvent.classList.add("draggable-select"); //class

//   let sel = document.createElement("select");
//   div.appendChild(sel) // select
//   for(var i = 0; i < optionsArray.length; i++){
//     let opt = document.createElement("option");
//     opt.value = optionsArray[i];
//     opt.textContent = optionsArray[i];
//     sel.appendChild(opt);
//   }

//   document.body.appendChild(div);
// }


function ddd_init(id, hasParent = true, hasKids = true){

  // init dragging
  const moveTarget = document.getElementById(id); // the whole thing
  const dragTarget = document.getElementById(id+"_mover");
  // const dragTarget = document.getElementById(id);

  let isDragging = false;
  let offsetX, offsetY;

  dragTarget.addEventListener("mousedown", (e) => {
    isDragging = true;
    offsetX = e.clientX - moveTarget.offsetLeft;//dragTarget.offsetLeft;
    offsetY = e.clientY - moveTarget.offsetLeft;//dragTarget.offsetTop;
    document.body.style.userSelect = "none";
  });

  document.addEventListener("mousemove", (e) => {
    if (isDragging) {
      moveTarget.style.left = e.clientX - offsetX + "px";
      moveTarget.style.top = e.clientY - offsetY + "px";
    }
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
    document.body.style.userSelect = "auto";
  });
  
  function highlight_init(target){
    let isSelected = false;
    target.addEventListener("mousedown", (e) => {
      if(isSelected){ //disable highlighting
        isSelected = false; // no longer selected
        target.style.borderWidth = "1px";
      }else{ //highlight
        isSelected = true;
        target.style.borderWidth = "10px";
      }
    });
  }

  //init yes no parent selection
  if(hasParent){
    const parentTarget = document.getElementById(id+"_parent");
    highlight_init(parentTarget);
  }

  if(hasKids){
    const yesTarget = document.getElementById(id+"_yes");
    highlight_init(yesTarget);
    const noTarget = document.getElementById(id+"_no");
    highlight_init(noTarget);
  }
}

//eg.
// make_ddd("block1", ["Apples", "Bananas", "Oranges"]);
// make_ddd("block2", ["Option A", "Option B", "Option C"]);
ddd_init("block1");
// ddd_init("block2");
