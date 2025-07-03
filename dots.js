


const lhsdot = document.getElementById("dot1")
const rhsdot = document.getElementById("dot2")
const lhsdot2 = document.getElementById("dot3")
const rhsdot2 = document.getElementById("dot4")

lhsdot.addEventListener("click", highlight);
rhsdot.addEventListener("click", highlight); 
lhsdot2.addEventListener("click", highlight);
rhsdot2.addEventListener("click",highlight);

var leftSelected = false;
var rightSelected = false;
var elemSelected = null;

const connected = [];

function addConnection(node1,node2,line_obj) {
    connected.push({
        node1 : node1,
        node2 : node2,
        line : line_obj
    })
}

function removeConnection(node1,node2) {
  const index = connected.findIndex(c =>
    (c.node1 === node1 && c.node2 === node2) || (c.node1 === node2 && c.node2 === node1)
  );

  if (index !== -1) {
    const connection = connected[index];
    connection.line.remove(); 
    connected.splice(index, 1);
  }
}

function checkIfConnection(node1,node2) {
    return connected.some(c =>
    (c.node1 === node1 && c.node2 === node2) ||
    (c.node1 === node2 && c.node2 === node1)
  )
}

function alreadyUsed(node) {
    return connected.some(c => (c.node1 === node) || c.node2 === node)
}

function insertLine(first_dot,second_dot) {
let parent = elemSelected.parentNode
let line = document.createElementNS("http://www.w3.org/2000/svg", "line");

line.setAttribute("x1", parseFloat(first_dot.getAttribute("cx")));
line.setAttribute("y1", parseFloat(first_dot.getAttribute("cy")));
line.setAttribute("x2", parseFloat(second_dot.getAttribute("cx")));
line.setAttribute("y2", parseFloat(second_dot.getAttribute("cy")));
line.setAttribute("stroke", "black");
line.setAttribute("stroke-width", "3");

parent.insertBefore(line, parent.firstChild);
addConnection(first_dot,second_dot,line)
}

// probelm is passing in a copy so leftSelected/rightSelected not actually gettig altered
// function LineNeeded(sideSelected, otherSide, sideNeeded, className, target, elemSelected) {
//     if (sideSelected === true && otherSide === false) {
//         if (className === sideNeeded){
//             insertLine(elemSelected,target);
//             sideSelected = false;
//             elemSelected.setAttribute("stroke-width","0")
//             elemSelected = null;
//         } else {
//             elemSelected.setAttribute("stroke-width","0")
//             sideSelected = false;
//         }

//     }
// }

function highlight(event) {

    let className = event.target.className.baseVal;

    if (leftSelected === false && rightSelected === false) {
        event.target.setAttribute("stroke-width", "3")
        elemSelected = event.target
        if (className === "lhs") {
            leftSelected = true;
        }   else {
                rightSelected = true;
        }
    } 

    // else if (LineNeeded(leftSelected,rightSelected, "rhs",className,event.target,elemSelected)) {}
    // else if (LineNeeded(rightSelected,leftSelected,"lhs",className,event.target,elemSelected)) {}

    else if (leftSelected === true && rightSelected === false) {
        if (className === "rhs"){
            if (checkIfConnection(elemSelected,event.target) === true) {
                removeConnection(elemSelected,event.target)
                leftSelected = false;
                elemSelected.setAttribute("stroke-width","0")
                elemSelected = null;
            } 
            else if (alreadyUsed(elemSelected) || alreadyUsed(event.target)) {
                console.log("already a line")
                leftSelected = false;
                elemSelected.setAttribute("stroke-width","0")
                elemSelected = null;
            } else {
                insertLine(elemSelected,event.target);
                leftSelected = false;
                elemSelected.setAttribute("stroke-width","0")
                elemSelected = null;
            }
        } else {
            elemSelected.setAttribute("stroke-width","0")
            leftSelected = false;
            elemSelected = null;
        }

    }

    else if (rightSelected === true && leftSelected === false) {
        if (className === "lhs"){
            if (checkIfConnection(elemSelected,event.target) === true) {
                removeConnection(elemSelected,event.target)
                rightSelected = false;
                elemSelected.setAttribute("stroke-width","0")
                elemSelected = null;
            } 
            else if (alreadyUsed(elemSelected) || alreadyUsed(event.target)) {
                console.log("already a line")
                rightSelected = false;
                elemSelected.setAttribute("stroke-width","0")
                elemSelected = null;
            } else {
                insertLine(elemSelected,event.target)
                rightSelected = false;
                elemSelected.setAttribute("stroke-width","0")
                elemSelected = null;
            }
        } else {
            elemSelected.setAttribute("stroke-width","0")
            rightSelected = false;
        }

    }


}