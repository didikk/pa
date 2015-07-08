Pressure = new Mongo.Collection('pressure');

dataStream = new Meteor.Stream('pressure');

TabularTables = {};

Meteor.isClient && Template.registerHelper('TabularTables', TabularTables);

TabularTables.Pressure = new Tabular.Table({
  name: "DataList",
  collection: Pressure,
  columns: [
    {data: "pressure", title: "Pressure"},
    {data: "status", title: "Status"},
    {data: "time", title: "Time"}
  ]
});


if (Meteor.isClient) {
  
  var data;
  var total = 0;
  var counter = 0;
  var average;
  var status;
  
  dataStream.on('pa', function (pa){
      data = pa;
      total += data;
      ++counter;
      average = total / counter;
      console.log(counter);
      
      if (counter == 300) {
        var d = new Date();

        Pressure.insert({
          pressure: average.toFixed(2),
          status: status,
          time: d.toLocaleString()
        });

        counter = 0;
        total = 0;
        average = 0;
      }else{
        if(data < 400) {
          status = 'Standard';
        }else if(data >= 400 && data < 800 ){
          status = 'Good';
        }else{
          status = 'Very Good';
        }

        $('#pressure').replaceWith('<p id="pressure" >' + data + ' KPa' + '</p>');
        $('#average').replaceWith('<p id="average" >' + average.toFixed(2) + ' KPa' + '</p>');
        $('#status').replaceWith('<p id="status" >' + status + '</p`>');
      }

      
  });



  function builtChart() {

      $(document).ready(function () {
            Highcharts.setOptions({
                global: {
                    useUTC: false
                }
            });

            $('#adminChartLevel').highcharts({
                chart: {
                    type: 'spline',
                    animation: Highcharts.svg, // don't animate in old IE
                    marginRight: 10,
                    events: {
                        load: function () {

                            // set up the updating of the chart each second
                            var series = this.series[0];

                            setInterval(function () {
                                var x = (new Date()).getTime(), // current time
                                    y = data;
                                series.addPoint([x, y], true, true);
                            }, 2000);
                        }
                    }
                },
                title: {
                    text: 'Atmospheric pressure'
                },
                xAxis: {
                    type: 'datetime',
                    tickPixelInterval: 150
                },
                yAxis: {
                    title: {
                        text: 'Value'
                    },
                    plotLines: [{
                        value: 0,
                        width: 1,
                        color: '#808080'
                    }]
                },
                tooltip: {
                    formatter: function () {
                        return '<b>' + this.series.name + '</b><br/>' +
                            Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', this.x) + '<br/>' +
                            Highcharts.numberFormat(this.y, 2);
                    }
                },
                legend: {
                    enabled: false
                },
                exporting: {
                    enabled: false
                },
                series: [{
                    name: 'Pressure data',
                    data: (function () {
                        // generate an array of random data
                        var data = [],
                            time = (new Date()).getTime(),
                            i;

                        for (i = -19; i <= 0; i += 1) {
                            data.push({
                                x: time + i * 2000,
                                y: Math.random() * (111 - 100) + 100
                            });
                        }
                        return data;
                    }())
                }]
            });
        });
  };

  Template.adminChartLevel.helpers({
   
  });

  Template.adminChartLevel.rendered = function() {    
      this.autorun(function (c) {
          builtChart();
      });
  };
  
};

if (Meteor.isServer) {
  var serialPort = new SerialPort.SerialPort("/dev/ttyUSB0", {
      baudrate: 115200,
      parser: SerialPort.parsers.readline('\n')
  });
  
  serialPort.on('open', function() {
      console.log('Port open');
  });

  serialPort.on('data', function(data) {
    var str = data.split("#");
    var nilai = str[5].split(":");
    var pa = parseFloat(nilai[1]);
    

    if( !isNaN(pa)){
      dataStream.emit('pa', pa);
    }
  });
};