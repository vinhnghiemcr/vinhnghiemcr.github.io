(function() {
    var graph = null,
        formatter = null,
        dataSet = [],
        graphPin = null;

    $(function() {
        formatter = d3.format("2.2f");
        graph = simpleGraph('#graph')
            .title("Arduino Data")
            .xmax(100).ymax(35)
            .xLabel("Time")
            .yLabel("Value");

        $('input').change(startGraphing);

        $('#run-button').click(function() {
            setInterval(getData, 250);
            $('#run-button').html("Running...")
                .attr("disabled", true)
                .unbind();        
        });
    });

    function getData() {
        $.getJSON("http://169.254.1.1/&callback=?", window.arduinoEthernetComCallback); 
        /* comment-out the above and uncomment the code below to generate random data */
        // r = formatter(40 + (Math.random() * 50));
        // callback('{"A0":' + r + ',"A1":30,"A2":20,"A3":10,"A4":30,"A5":20}');
    };

    window.arduinoEthernetComCallback = function(jsonData) {
        data = JSON.parse(jsonData);

        for (pin in data) {
            var val = data[pin],
                voltage = (val * 5.0) / 1024.0,
                conv = $("#" + pin + "-conversion").val(),
                convValue = convert(voltage, conv);
            
            $("#" + pin).html(val);
            $("#" + pin + "-volts").html(formatter(voltage));
            $("#" + pin + "-convValue").html(convValue ? formatter(convValue) : "");
        }

        if (window.graphPin) {
            value = $("#" + window.graphPin + "-convValue").html() ? 
                $("#" + window.graphPin + "-convValue").html() : 
                $("#" + window.graphPin).html();
            dataSet.push(value);
            graph.set_data(dataSet);
        }
    };

    function startGraphing() {
        dataSet = [];
        window.graphPin = this.value;
    };


    function convert(value, type) {
        return convos[type](value);
    };

    // set of conversion functions
    var convos = {
        none: function(volts) {
            return "";
        },
        L35: function(volts) {
            return volts * 100;
        },
        TMP36: function(volts) {
            return (volts - 0.5) * 100;
        },
        A1301: function(volts) {
            return ((volts - 2.5) / 2.5) * 1000;
        },
    };

})()