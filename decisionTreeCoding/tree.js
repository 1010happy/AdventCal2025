///ddd = drag dropdown direct

// let //can reval but not redeclare (var can be redeclared accidentally), const is ur normal let

function make_ddd(id, optionsArray){
  let div = document.createElement("div")
  div.id = id;
  div.setAttribute("class", "draggable-select");
  // dispatchEvent.classList.add("draggable-select"); //class

  let sel = document.createElement("select");
  div.appendChild(sel) // select
  for(var i = 0; i < optionsArray.length; i++){
    let opt = document.createElement("option");
    opt.value = optionsArray[i];
    opt.textContent = optionsArray[i];
    sel.appendChild(opt);
  }

  document.body.appendChild(div);
}

function ddd_init(id){
  const dragTarget = document.getElementById(id);
  let isDragging = false;
  let offsetX, offsetY;

  dragTarget.addEventListener("mousedown", (e) => {
    isDragging = true;
    offsetX = e.clientX - dragTarget.offsetLeft;
    offsetY = e.clientY - dragTarget.offsetTop;
    document.body.style.userSelect = "none";
  });

  document.addEventListener("mousemove", (e) => {
    if (isDragging) {
      dragTarget.style.left = e.clientX - offsetX + "px";
      dragTarget.style.top = e.clientY - offsetY + "px";
    }
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
    document.body.style.userSelect = "auto";
  });
}

//eg.
// make_ddd("block1", ["Apples", "Bananas", "Oranges"]);
// make_ddd("block2", ["Option A", "Option B", "Option C"]);
ddd_init("block1");
ddd_init("block2");
