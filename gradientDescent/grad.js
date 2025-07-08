const COEFFS = [1,1,-1]; //1 + x + x^2
const GRADCOEFFS = []; //calculated in init


const data = {
    labels: [],
    datasets: [{
        label: "thefunc", // Name it as you want
        function: function(x){return calculate(x)},
        data: [], // Don't forget to add an empty data array, or else it will break
        borderColor: "rgba(75, 192, 192, 1)",
        fill: false
    }]
}


const plugin = {
    id: 'corsair',
    defaults: {
        width: 1,
        color: '#FF4949',
        dash: [3, 3],
    },
    beforeInit: (chart,args,opts)=>{ //create the data
        // For every label ...
        for (let i = -10; i < 10; i+= 0.1){
            data.labels.push(i);
            y = data.datasets[0].function(i);
            data.datasets[0].data.push(y);
        }
        //calculate gradient coeffs;
    },
    afterInit: (chart, args, opts) => {
      chart.corsair = { //coords of mouse
        x: 0,
        y: 0,
      }
    },
    afterEvent: (chart, args) => {
      const {inChartArea} = args
      const {type,x,y} = args.event

      chart.corsair = {x, y, draw: inChartArea}
      chart.draw()
    },
    beforeDatasetsDraw: (chart, args, opts) => { //before drawing dataset
      const {ctx} = chart
      const {top, bottom, left, right} = chart.chartArea
      const {x, y, draw} = chart.corsair
      if (!draw) return

      ctx.save()
      
      ctx.beginPath()
      ctx.lineWidth = opts.width
      ctx.strokeStyle = opts.color
      ctx.setLineDash(opts.dash)

      //x selecting line
      ctx.moveTo(x, bottom)
      ctx.lineTo(x, top)
      ctx.stroke()

      //calculate gradient
      calcGrad(left, right, x);
      
      ctx.restore()
    }
}

const options = {
  maintainAspectRatio: false,
  hover: {
    mode: 'index',
    intersect: false,
  },
  plugins: {
    corsair: {
      color: 'black',
    }
  }
}
  
const config = {
  type: 'line',
  data,
  options,
  plugins: [plugin],
}


function calculate(x){
    let cur = 1;
    let ans = 0;
    for(let i = 0; i < COEFFS.length; i++){
        ans += cur * COEFFS[i];
        cur *= x; //problem sheet says theres the way wher eu js * and + but thats such a minor improvement
    }
    return ans;
}

function calcGradCoeffs(){
    for(let i = 1; i < COEFFS.length; i++){
        GRADCOEFFS.push(i*COEFFS[i]);
    }
}

function calcGrad(left, right, x){
}


calcGradCoeffs()
const $chart = document.getElementById('chart')
const chart = new Chart($chart, config)