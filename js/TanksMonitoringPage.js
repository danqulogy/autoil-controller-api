var request = 0;
var commands = [];
var configurationId = 0;

var TANK_NUMBER_INDEX = 0;
var TANK_STATUS_INDEX = 1;
var TANK_GRADE_INDEX = 2;
var TANK_FILLINGPERCENTAGE_INDEX = 3;
var TANK_PRODUCTHEIGHT_INDEX = 4;
var TANK_WATERHEIGHT_INDEX = 5;
var TANK_TEMPERATURE_INDEX = 6;
var TANK_PRODUCTVOLUME_INDEX = 7;
var TANK_WATERVOLUME_INDEX = 8;
var TANK_PRODUCTULLAGE_INDEX = 9;
var TANK_PRODUCTTCVOLUME_INDEX = 10;
var TANK_PRODUCTDENSITY_INDEX = 11;
var TANK_PRODUCTMASS_INDEX = 12;

// Existing tanks configuration
var tanks = [];
var fuelGrades = [];

var tank;
var data;

// Tanks monitoring DataTable
var tanksMonitoringDatatable;

var automaticDeliveryString;

// Get tanks configuration and states on page start
initConfiguration();

//-------------------------------------------------------------------------------------
function initConfiguration() {

    clearTimeout(timerProbesPollingId);

    // Clean arrays
    commands = [];

    // Get firmware information to get list of protocols supported and get tanks configuration
    commands.push({
        function: GetProbesConfiguration
    },{
        function: GetTanksConfiguration
    },{
        function: GetFuelGradesConfiguration
    },{
        function: GetConfigurationIdentifier
    });
    request = createComplexRequest(commands);

    // Process response
    request.done(function(response) {
        if (responseNull == true)
            return;
                
        // Fuel grades configuration
        data = response.Packets.filter(Packet => Packet.Type == "FuelGradesConfiguration");
        if (data != null &&
            data != undefined &&
            data.length > 0) {
            data = data[0].Data;
            if (data == undefined) {
                return;
            } else {

                // Fill in response values
                if (data.FuelGrades.length > 0) {
                    fuelGrades = [];
                    data.FuelGrades.forEach(function(fuelGradeDataItem) {
                        fuelGrades.push({
                            Id: fuelGradeDataItem.Id,
                            Code: fuelGradeDataItem.Code,
                            Name: fuelGradeDataItem.Name,
                            Price: fuelGradeDataItem.Price
                        });
                    });
                }
            }
        }
        
        // Probes configuration
        data = response.Packets.filter(Packet => Packet.Type == "ProbesConfiguration");
        if (data != null &&
            data != undefined &&
            data.length > 0) {
            data = data[0].Data;
            if (data == undefined) {
                return;
            } else {

                // Set probes configuration
                if (data.Probes.length > 0) {
                    tanks = [];
                    data.Probes.forEach(function(probeData) {
                        if (parseInt(probeData.Port, 10) != 0 && parseInt(probeData.Address, 10) != 0) {

                            // Add tanks objects
                            tanks.push(new Tank(parseInt(probeData.Id, 10)));
                        }
                    });
                }

                if (tanksMonitoringDatatable != null)
                    tanksMonitoringDatatable.destroy();

                // Fill in tanks control table
                tanksMonitoringDatatable = $('#tmpTanks').DataTable({    
                    dom: 't',
                    "pageLength": parseInt(data.Probes.length, 10),
                    "ordering": false,
                    responsive: true,
                    select: true,
                    data: tanks,
                    columns: [
                        { data: 'Id' },
                        { data: 'Status' },
                        { data: 'GradeName' },
                        { data: 'FillingPercentage' },
                        { data: 'ProductHeight' },
                        { data: 'WaterHeight' },
                        { data: 'Temperature' },
                        { data: 'ProductVolume' },
                        { data: 'WaterVolume' },
                        { data: 'ProductUllage' },
                        { data: 'ProductTCVolume' },
                        { data: 'ProductDensity' },
                        { data: 'ProductMass' }
                    ],
                    columnDefs: [
                        {
                            targets: 0,
                            className: 'dt-body-center',
                            "width": '5%'
                        },
                        {
                            targets: 1,
                            className: 'dt-body-center font-weight-bold',
                            "width": '5%'
                        },
                        {
                            targets: 2,
                            className: 'dt-body-center',
                            "width": '10%'
                        },
                        {
                            targets: 3,
                            render: function (data, type, row, meta) {
                                return '<div class="progress"><div class="progress-bar bg-success progress-bar-striped progress-bar-animated" role="progressbar" style="width: ' + data + '%;" aria-valuenow="' + data + '" aria-valuemin="0" aria-valuemax="100">' + data + '%</div></div>';
                            }
                        },
                        {
                            targets: 4,
                            className: 'dt-body-center',
                            "width": '10%'
                        },
                        {
                            targets: 5,
                            className: 'dt-body-center',
                            "width": '5%'
                        },
                        {
                            targets: 6,
                            className: 'dt-body-center',
                            "width": '5%'
                        },
                        {
                            targets: 7,
                            className: 'dt-body-center',
                            "width": '10%'
                        },
                        {
                            targets: 8,
                            className: 'dt-body-center',
                            "width": '10%'
                        },
                        {
                            targets: 9,
                            className: 'dt-body-center',
                            "width": '10%'
                        },
                        {
                            targets: 10,
                            className: 'dt-body-center',
                            "width": '10%'
                        },
                        {
                            targets: 11,
                            className: 'dt-body-center',
                            "width": '5%'
                        },
                        {
                            targets: 12,
                            className: 'dt-body-center',
                            "width": '5%'
                        }
                    ],
                    "rowCallback": function(row, data) {
                        if (data.Status.toUpperCase() == "OK") {
                            $('td:eq(1)', row).removeClass();
                            $('td:eq(1)', row).addClass('probeOkStatus font-weight-bold');
                        } else if (data.Status.toUpperCase() == "ERROR") {
                            $('td:eq(1)', row).removeClass();
                            $('td:eq(1)', row).addClass('probeErrorStatus font-weight-bold');
                        } else if (data.Status.toUpperCase() == "OFFLINE") {
                            $('td:eq(1)', row).removeClass();
                            $('td:eq(1)', row).addClass('probeOfflineStatus font-weight-bold');
                        }
                    }
                });

                if (tanks.length > 0) {
                    // Tanks configuration
                    data = response.Packets.filter(Packet => Packet.Type == "TanksConfiguration");
                    if (data != null &&
                        data != undefined &&
                        data.length > 0) {
                        data = data[0].Data;
                        if (data == undefined) {
                            return;
                        } else {

                            // Fill in response values
                            if (data.Tanks.length > 0) {
                                data.Tanks.forEach(function(tankDataItem) {

                                    if (parseInt(tankDataItem.Id, 10) > 0) {
                                        tank = tanks.filter(tank => tank.Id == parseInt(tankDataItem.Id, 10))[0];
                                        if (tank != null) {
                                            // Set tank height
                                            tank.Height = tankDataItem.Height;

                                            // Set tank grade code and name
                                            fuelGrades.forEach(function(fuelGradeDataItem) {
                                                if (tankDataItem.FuelGradeId != undefined && 
                                                    tankDataItem.FuelGradeId != "0" &&
                                                    parseInt(fuelGradeDataItem.Id, 10) == parseInt(tankDataItem.FuelGradeId, 10)) {
                                                    tank.GradeCode = fuelGradeDataItem.Id;
                                                    tank.GradeName = fuelGradeDataItem.Name;
                                                    return;
                                                }
                                            });
                                        }
                                    }
                                });
                            }
                        }
                    }
                }
            }
        } 
                
        // Configuration identifier
        data = response.Packets.filter(Packet => Packet.Type == "ConfigurationIdentifier");
        if (data != null &&
            data != undefined &&
            data.length > 0) {
            data = data[0].Data;
            if (data == undefined) {
                return;
            } else {

                // Fill in response values
                if (data.Id != undefined) {
                    configurationId = data.Id;
                }
            }
        }

        // Start polling probes
        if (tanks.length > 0) {
            configurationReceived = 1;
            pollProbes();
        }
    });
}

//-------------------------------------------------------------------------------------
// Poll probes
function pollProbes() {
    
    var data;
    var newAutomaticDeliveryString = "";
    
    // Clean arrays
    commands = [];

    // Stop operation on any other page
    if (window.location.href.indexOf("TanksMonitoringPage") == -1)
        return;

    if (tanks.length > 0) {
        tanks.forEach(function(tankData) {
            commands.push({
                function: ProbeGetMeasurements,
                arguments: [
                    tankData.Id
                ]
            });
        });

        // Get configuration identifier
        commands.push({
            function: GetConfigurationIdentifier
        });
        
        // Send request
        request = createComplexRequest(commands, false);

        // Process response
        request.done(function(response) {
            if (responseNull == true)
                return;

            // Loop through all response packets
            response.Packets.forEach(function(packet) {

                if (packet.Type == "ConfigurationIdentifier") {
                    // Configuration identifier
                    data = packet.Data;
                    if (data == undefined) {
                        return;
                    } else {
                        // Fill in response values
                        if (data.Id != undefined &&
                            configurationId != data.Id) {
    
                            // Get all configurations
                            initConfiguration();
                        } else {
                            timerProbesPollingId = setTimeout(pollProbes, 1000);
                        }
                    }
                } else {
                    // Get current tank from response
                    var tank = tanks.filter(x => parseInt(x.Id, 10) == parseInt(packet.Data.Probe, 10))[0];

                    if (tank != null) {
                        if (packet.Data.Status != null) {
                            tank.Status = packet.Data.Status;

                            if (packet.Data.ProductHeight != null) {
                                tank.ProductHeight = packet.Data.ProductHeight;
                            } else {
                                tank.ProductHeight = "-";
                            }

                            if (packet.Data.WaterHeight != null) {
                                tank.WaterHeight = packet.Data.WaterHeight;
                            } else {
                                tank.WaterHeight = "-";
                            }

                            if (packet.Data.Temperature != null) {
                                tank.Temperature = packet.Data.Temperature;
                            } else {
                                tank.Temperature = "-";
                            }

                            if (packet.Data.ProductVolume != null) {
                                tank.ProductVolume = packet.Data.ProductVolume;
                            } else {
                                tank.ProductVolume = "-";
                            }

                            if (packet.Data.WaterVolume != null) {
                                tank.WaterVolume = packet.Data.WaterVolume;
                            } else {
                                tank.WaterVolume = "-";
                            }

                            if (packet.Data.ProductUllage != null) {
                                tank.ProductUllage = packet.Data.ProductUllage;
                            } else {
                                tank.ProductUllage = "-";
                            }

                            if (packet.Data.ProductTCVolume != null) {
                                tank.ProductTCVolume = packet.Data.ProductTCVolume;
                            } else {
                                tank.ProductTCVolume = "-";
                            }

                            if (packet.Data.ProductDensity != null) {
                                tank.ProductDensity = packet.Data.ProductDensity;
                            } else {
                                tank.ProductDensity = "-";
                            }

                            if (packet.Data.ProductMass != null) {
                                tank.ProductMass = packet.Data.ProductMass;
                            } else {
                                tank.ProductMass = "-";
                            }
                        }

                        // Automatic in-tank deliveries
                        if (packet.Data.LastInTankDeliveryStart != undefined &&
                            packet.Data.LastInTankDeliveryEnd != undefined) {
                            
                            newAutomaticDeliveryString = "\nAutomatic in-tank delivery for tank " + tank.Id + ":";
                            
                            // Start of delivery values
                            newAutomaticDeliveryString += "\nMeasurements on start: ";

                            if (packet.Data.LastInTankDeliveryStart.DateTime != undefined)
                                newAutomaticDeliveryString += "datetime = " + packet.Data.LastInTankDeliveryStart.DateTime.replace(/-/g, ".").replace(/T/g, " ") + ", ";
                                
                            if (packet.Data.LastInTankDeliveryStart.ProductHeight != undefined)
                                newAutomaticDeliveryString += "product height = " + packet.Data.LastInTankDeliveryStart.ProductHeight + ", ";

                            if (packet.Data.LastInTankDeliveryStart.WaterHeight != undefined)
                                newAutomaticDeliveryString += "height = " + packet.Data.LastInTankDeliveryStart.WaterHeight + ", ";

                            if (packet.Data.LastInTankDeliveryStart.Temperature != undefined)
                                newAutomaticDeliveryString += "product temperature = " + packet.Data.LastInTankDeliveryStart.Temperature + ", ";

                            if (packet.Data.LastInTankDeliveryStart.ProductVolume != undefined)
                                newAutomaticDeliveryString += "product volume = " + packet.Data.LastInTankDeliveryStart.ProductVolume + ", ";

                            if (packet.Data.LastInTankDeliveryStart.ProductTCVolume != undefined)
                                newAutomaticDeliveryString += "product TC volume = " + packet.Data.LastInTankDeliveryStart.ProductTCVolume + ", ";

                            if (packet.Data.LastInTankDeliveryStart.ProductDensity != undefined)
                                newAutomaticDeliveryString += "product density = " + packet.Data.LastInTankDeliveryStart.ProductDensity + ", ";

                            if (packet.Data.LastInTankDeliveryStart.ProductMass != undefined)
                                newAutomaticDeliveryString += "product mass = " + packet.Data.LastInTankDeliveryStart.ProductMass + ", ";
                            
                            // End of delivery values
                            newAutomaticDeliveryString += "\nMeasurements on end: ";

                            if (packet.Data.LastInTankDeliveryEnd.DateTime != undefined)
                                newAutomaticDeliveryString += "datetime = " + packet.Data.LastInTankDeliveryEnd.DateTime.replace(/-/g, ".").replace(/T/g, " ") + ", ";
                            
                            if (packet.Data.LastInTankDeliveryEnd.ProductHeight != undefined)
                                newAutomaticDeliveryString += "product height = " + packet.Data.LastInTankDeliveryEnd.ProductHeight + ", ";

                            if (packet.Data.LastInTankDeliveryEnd.WaterHeight != undefined)
                                newAutomaticDeliveryString += "water height = " + packet.Data.LastInTankDeliveryEnd.WaterHeight + ", ";

                            if (packet.Data.LastInTankDeliveryEnd.Temperature != undefined)
                                newAutomaticDeliveryString += "product temperature = " + packet.Data.LastInTankDeliveryEnd.Temperature + ", ";

                            if (packet.Data.LastInTankDeliveryEnd.ProductVolume != undefined)
                                newAutomaticDeliveryString += "product volume = " + packet.Data.LastInTankDeliveryEnd.ProductVolume + ", ";

                            if (packet.Data.LastInTankDeliveryEnd.ProductTCVolume != undefined)
                                newAutomaticDeliveryString += "product TC volume = " + packet.Data.LastInTankDeliveryEnd.ProductTCVolume + ", ";

                            if (packet.Data.LastInTankDeliveryEnd.ProductDensity != undefined)
                                newAutomaticDeliveryString += "product density = " + packet.Data.LastInTankDeliveryEnd.ProductDensity + ", ";

                            if (packet.Data.LastInTankDeliveryEnd.ProductMass != undefined)
                                newAutomaticDeliveryString += "product mass = " + packet.Data.LastInTankDeliveryEnd.ProductMass + ", ";
                            
                            // Delivery absolute values
                            if (packet.Data.LastInTankDelivery != undefined)
                            {
                                newAutomaticDeliveryString += "\nMeasurements absolute values:\n";

                                if (packet.Data.LastInTankDelivery.ProductHeight != undefined)
                                    newAutomaticDeliveryString += "product height = " + packet.Data.LastInTankDelivery.ProductHeight + ", ";

                                if (packet.Data.LastInTankDelivery.WaterHeight != undefined)
                                    newAutomaticDeliveryString += "water height = " + packet.Data.LastInTankDelivery.WaterHeight + ", ";

                                if (packet.Data.LastInTankDelivery.Temperature != undefined)
                                    newAutomaticDeliveryString += "product temperature = " + packet.Data.LastInTankDelivery.Temperature + ", ";

                                if (packet.Data.LastInTankDelivery.ProductVolume != undefined)
                                    newAutomaticDeliveryString += "product volume = " + packet.Data.LastInTankDelivery.ProductVolume + ", ";

                                if (packet.Data.LastInTankDelivery.ProductTCVolume != undefined)
                                    newAutomaticDeliveryString += "product TC volume = " + packet.Data.LastInTankDelivery.ProductTCVolume + ", ";

                                if (packet.Data.LastInTankDelivery.ProductDensity != undefined)
                                    newAutomaticDeliveryString += "product density = " + packet.Data.LastInTankDelivery.ProductDensity + ", ";

                                if (packet.Data.LastInTankDelivery.ProductMass != undefined)
                                    newAutomaticDeliveryString += "product mass = " + packet.Data.LastInTankDelivery.ProductMass + ", ";
                            }
                        }

                        if (newAutomaticDeliveryString != undefined &&
                            automaticDeliveryString != newAutomaticDeliveryString) {
                            console.log(newAutomaticDeliveryString);
                            automaticDeliveryString = newAutomaticDeliveryString;
                        }

                        // Refresh datatable
                        if (tanksMonitoringDatatable != null)
                            Tank.Update(tanksMonitoringDatatable, tank);
                    }
                }
            });
        }).fail(function(response) {
            timerProbesPollingId = setTimeout(pollProbes, 1000);
            
            if ($("#message").hasClass("d-block") &&
                $("#message").text() == "Error(s): No response") {
                if (tanks.length > 0) {
                    tanks.forEach(function(tank) {
                        tank.Status = "Offline";
                        tank.ProductHeight = "-";                                       
                        tank.WaterHeight = "-";
                        tank.Temperature = "-";
                        tank.ProductVolume = "-";
                        tank.WaterVolume = "-";
                        tank.ProductUllage = "-";
                        tank.ProductTCVolume = "-";
                        tank.ProductDensity = "-";
                        tank.ProductMass = "-";

                        // Refresh datatable
                        if (tanksMonitoringDatatable != null)
                            Tank.Update(tanksMonitoringDatatable, tank);
                    });
                }
            }
        });
    }
}