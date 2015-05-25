//Pressure = new Mongo.Collection('pressure');

dataStream = new Meteor.Stream('pressure');

if (Meteor.isClient) {
  /*Template.hello.helpers({
    pressure: function () {
      return Pressure.find();
    }

  });

  dataStream.on('pa', function (pa){
      Pressure.insert({
        data: pa
      });
  });*/
  
  var data;
  
  dataStream.on('pa', function (pa){
      data = pa;
      $('#data').replaceWith('<h4 id="data" class="center-align">' + data + ' KPa' + '</h4>');
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
                    text: 'Live data'
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
      //console.log('message', isNaN(pa));
    }
  });
};