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
  
  dataStream.on('pa', function (pa){
      var data = pa;
      $('#data').prepend('<div>' + data + ' KPa' +'</div>');
  });
  
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
    //console.log('message ' + data);
    var str = data.split("#");
    var nilai = str[5].split(":");
    var pa = parseFloat(nilai[1]);
    

    if( !isNaN(pa)){
      dataStream.emit('pa', pa);
      //console.log('message', isNaN(pa));
    }
    

    /*Pressure.insert({
      data: data
    });*/
  });
};