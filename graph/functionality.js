
// general variables

document.getElementById("degree").max = 0
let penState = true
let rubberState = false
let addedPolynomial = false
const degree_input = document.getElementById('degree')

// button reponses

function handleClick() {
    const degree = document.getElementById('degree').value;
    plotLeastSquares(degree)
    console.log(degree)
}

function penMode() {
  penState = true
  rubberState = false
}

function rubberMode() {
  penState = false
  rubberState = true
}

function plotLeastSquares(degree) {
    plotPolynomial(degree)
}

// event listeners 

document.getElementById("submit_button").addEventListener("click", handleClick);
document.getElementById("plot").addEventListener("click",alterDataPoint);
document.getElementById("pen").addEventListener("click",penMode);
document.getElementById("rubber").addEventListener("click",rubberMode);
degree_input.addEventListener('keydown', function (e) {
    // only allow strictly numeric input
  if (["e", "E", "+", "-"].includes(e.key)) {
    e.preventDefault();
  }
  // if (Number(e.key) > chart.data.datasets.length - 1) {
  //   const p = document.createElement("p")
  //   p.textContent = `<p> Please enter a degree less than ${chart.data.datasets.length + 1}</p>`
  //   let parent = document.getElementById("submission")
  //   console.log(parent)
  //   parent.appendChild(p)
  // }


}
)

// define the chart 
const chart = new Chart(
    document.getElementById('plot'),
    {
      type: 'scatter',
      data: {
        datasets: []
      },
      options: {
        plugins : {
          legend : {
          display : false
        }},
        events: [],
        scales: {
             x: {
                type: 'linear',
                    min: 0,  
                    max: 10,   
            },
            y: {
                min: 0,    
                max: 20,    
            }
            
        }
    }
    }
  );

// controlling datapoints functions
function alterDataPoint(event) {

    let x = chart.scales['x'].getValueForPixel(event.offsetX)
    let y = chart.scales['y'].getValueForPixel(event.offsetY)

    if (penState) {
      chart.data.datasets.push({
      data: [{x:x,y:y}],
      borderColor: 'black',
      backgroundColor : 'green',
      fill: true,
      pointRadius: 3,
      borderWidth: 1,
      })
      } else if (rubberState) {
        checkDeleting(x,y)
      };

    chart.update()
    
    if (!addedPolynomial) {
    document.getElementById("degree").max = chart.data.datasets.length - 1;
    } else {document.getElementById("degree").max = chart.data.datasets.length - 2}

}

function checkDeleting(x,y) {
  let pointsToRemove = []
  chart.data.datasets.forEach((item,i) => {
      let x_plotted = item.data['0'].x
      let y_plotted = item.data['0'].y
      const dist = Math.hypot(x-x_plotted,y-y_plotted)
      // console.log(dist)
      if (dist < 0.5) {
        pointsToRemove.push(i)
      }
  })
    pointsToRemove.forEach((item) => {
      console.log(item)
      chart.data.datasets.splice(item,1)
  })
}


// polynomial plotting functions
function polyCalc(x,degree) {
    let x_data = []
    let y_data = []
    let m = []

    for (let p=0; p<chart.data.datasets.length; p++) {
      x_data.push(chart.data.datasets[p].data['0'].x)
      y_data.push(chart.data.datasets[p].data['0'].y)
    }


    for (let i =0; i<x_data.length; i++){
        let number = x_data[i]
        var new_row = []
        for (let j = 0; j <= degree; j++) {
            new_row.push(number**j)
        }
        m.push(new_row)
    }

    const result = math.qr(m) // returns full QR so we need to convert Q/R matrices
    const R = result.R.slice(0,(Number(degree)+1))
    let Q = smallQ(result.Q,degree)
    let coefficients = math.multiply(math.inv(R),math.multiply(Q,y_data))
    console.log(coefficients)

    let total = 0;
    let exponented = 1;
    for (let k = 0; k<=degree; k++) {
        total += coefficients[k] * exponented
        exponented *= x
    }
    return total
}

function plotPolynomial(degree) {
    addedPolynomial = true
    removePolynomial()
    const dataPoints = [];
    for (let x = -10; x <= 10; x+=0.05) {
    dataPoints.push({ x: x, y: polyCalc(x,degree) });
    }

    chart.data.datasets.push({
    label : "polynomial",
    showLine : true,
    data: dataPoints,
    borderColor: 'red',
    pointRadius: 0,
    });

    chart.update()
};


// utilities

function removePolynomial() {
  chart.data.datasets = chart.data.datasets.filter(
    dataset => dataset.label !== "polynomial"
  )

  chart.update()
}

function smallQ(Q,degree) {
  // note returns Q^T (from original [Q Q_orth])
    let J = math.transpose(Q)
    J = J.slice(0,(Number(degree)+1))
    return J
}


