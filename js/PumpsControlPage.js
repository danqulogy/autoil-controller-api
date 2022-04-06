var request = 0;
var commands = [];
var configurationId = 0;
var currentUserPermissions = [];

var PUMP_NUMBER_INDEX = 0;
var PUMP_STATUS_INDEX = 1;
var PUMP_NOZZLE_INDEX = 2;
var PUMP_PRICE_INDEX = 3;
var PUMP_VOLUME_FILLED_INDEX = 4;
var PUMP_AMOUNT_FILLED_INDEX = 5;
var PUMP_VOLUME_TOTAL_INDEX = 6;
var PUMP_AMOUNT_TOTAL_INDEX = 7;
var PUMP_USER_INDEX = 8;
var PUMP_REQUEST_INDEX = 9;

var SYSTEM_PRICE_DECIMAL_DIGITS = 2;
var SYSTEM_AMOUNT_DECIMAL_DIGITS = 2;
var SYSTEM_VOLUME_DECIMAL_DIGITS = 2;
var SYSTEM_AMOUNT_TOTAL_DECIMAL_DIGITS = 2;
var SYSTEM_VOLUME_TOTAL_DECIMAL_DIGITS = 2;

var SYSTEM_USER_DART_1_ID = 11;
var SYSTEM_USER_DART_1_NAME = "DART 1";
var SYSTEM_USER_DART_2_ID = 12;
var SYSTEM_USER_DART_2_NAME = "DART 2";
var SYSTEM_USER_DART_3_ID = 13;
var SYSTEM_USER_DART_3_NAME = "DART 3";
var SYSTEM_USER_DART_4_ID = 14;
var SYSTEM_USER_DART_4_NAME = "DART 4";
var SYSTEM_USER_UNIPUMP_ID = 15;
var SYSTEM_USER_UNIPUMP_NAME = "UNIPUMP";
var SYSTEM_USER_PTS_ID = 16;
var SYSTEM_USER_PTS_NAME = "PTS";

// Existing pumps configuration
var pumps = [];
var fuelGrades = [];

var pump;
var data;

// Pumps control DataTable
var pumpsControlDatatable;

// Get all configurations
initConfiguration();

//-------------------------------------------------------------------------------------
function initConfiguration() {

    clearTimeout(timerPumpsPollingId);

    // Clean arrays
    commands = [];

    // Get firmware information to get list of protocols supported and get pumps configuration
    commands.push({
        function: GetPumpsConfiguration
    },{
        function: GetSystemDecimalDigits
    },{
        function: GetFuelGradesConfiguration
    },{
        function: GetPumpNozzlesConfiguration
    },{
        function: GetConfigurationIdentifier
    },{
        function: GetUserInformation
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
                            Name: fuelGradeDataItem.Name,
                            Price: fuelGradeDataItem.Price
                        });
                    });
                }
            }
        }
        
        // Pumps configuration
        data = response.Packets.filter(Packet => Packet.Type == "PumpsConfiguration");
        if (data != null &&
            data != undefined &&
            data.length > 0) {
            data = data[0].Data;
            if (data == undefined) {
                return;
            } else {

                // Set pumps configuration
                if (data.Pumps.length > 0) {
                    pumps = [];
                    data.Pumps.forEach(function(pumpData) {
                        if (parseInt(pumpData.Port, 10) != 0 && parseInt(pumpData.Address, 10) != 0) {
                            
                            // Add pumps objects
                            pumps.push(new Pump(parseInt(pumpData.Id, 10), "OFFLINE"));
                            
                            // Add pump numbers to the list
                            $('#pcpPumpSelect').append('<option value="' + parseInt(pumpData.Id, 10) + '">' + parseInt(pumpData.Id, 10) + '</option>');
                        }
                    });
                }

                if (pumpsControlDatatable != null)
                    pumpsControlDatatable.destroy();

                // Fill in pumps control table
                pumpsControlDatatable = $('#pcpPumps').DataTable({    
                    dom: 't',
                    "pageLength": parseInt(data.Pumps.length, 10),
                    "ordering": false,
                    responsive: true,
                    select: true,
                    data: pumps,
                    columns: [
                        { data: 'Id' },
                        { data: 'Status' },
                        { data: 'Nozzle' },
                        { data: 'Price' },
                        { data: 'Volume' },
                        { data: 'Amount' },
                        { data: 'VolumeTotal' },
                        { data: 'AmountTotal' },
                        { data: 'User' },
                        { data: 'Request' }
                    ],
                    columnDefs: [
                        {
                            targets: 0,
                            className: 'dt-body-center pumpNumber',
                            "width": '5%'
                        },
                        {
                            targets: 1,
                            className: 'dt-body-center font-weight-bold',
                            "width": '15%'
                        },
                        {
                            targets: 2,
                            className: 'dt-body-center',
                            "width": '15%'
                        },
                        {
                            targets: 3,
                            className: 'dt-body-center',
                            "width": '10%'
                        },
                        {
                            targets: 4,
                            className: 'dt-body-center',
                            "width": '10%'
                        },
                        {
                            targets: 5,
                            className: 'dt-body-center',
                            "width": '10%'
                        },
                        {
                            targets: 6,
                            className: 'dt-body-center',
                            "width": '10%',
                            "visible": false
                        },
                        {
                            targets: 7,
                            className: 'dt-body-center',
                            "width": '10%',
                            "visible": false
                        },
                        {
                            targets: 8,
                            className: 'dt-body-center',
                            "width": '5%',
                            "visible": false
                        },
                        {
                            targets: 9,
                            className: 'dt-body-center',
                            "width": '10%',
                            "visible": false
                        }
                    ],
                    "rowCallback": function(row, data) {
                        if (data.Status == "IDLE") {
                            $('td:eq(' + PUMP_STATUS_INDEX + ')', row).removeClass();
                            $('td:eq(' + PUMP_STATUS_INDEX + ')', row).addClass('pumpIdleStatus font-weight-bold');
                        } else if (data.Status == "NOZZLE") {
                            $('td:eq(' + PUMP_STATUS_INDEX + ')', row).removeClass();
                            $('td:eq(' + PUMP_STATUS_INDEX + ')', row).addClass('pumpIdleNozzleUpStatus font-weight-bold');
                        } else if (data.Status == "FILLING") {
                            $('td:eq(' + PUMP_STATUS_INDEX + ')', row).removeClass();
                            $('td:eq(' + PUMP_STATUS_INDEX + ')', row).addClass('pumpFillingStatus font-weight-bold');
                        } else if (data.Status == "OFFLINE") {
                            $('td:eq(' + PUMP_STATUS_INDEX + ')', row).removeClass();
                            $('td:eq(' + PUMP_STATUS_INDEX + ')', row).addClass('pumpOfflineStatus font-weight-bold');
                        }
                    },
                    "initComplete": function() {
                        setTimeout(function() { 
                            if (pumps.length > 0) {
                                $("#pcpPumpSelect").change();
                            }
                        }, 500);
                    }
                });

                // Set pump number in list on pumps table row select
                pumpsControlDatatable.on('select', function (event, datatable, type, indexes) {
                    if (type === 'row') {
                        var tr = pumpsControlDatatable.rows(indexes).nodes().to$();
                        $("#pcpPumpSelect").val(parseInt($(tr).children('td.pumpNumber').text(), 10));

                        // Set nozzle prices and grade names
                        setNozzlePricesAndGradeNames(parseInt($(tr).children('td.pumpNumber').text(), 10));

                        // Refresh buttons
                        refreshControls();
                    }
                });

                if (pumps.length > 0) {
                    // Pump nozzles configuration
                    data = response.Packets.filter(Packet => Packet.Type == "PumpNozzlesConfiguration");
                    if (data != null &&
                        data != undefined &&
                        data.length > 0) {
                        data = data[0].Data;
                        if (data == undefined) {
                            return;
                        } else {

                            // Fill in response values
                            if (data.PumpNozzles.length > 0) {
                                data.PumpNozzles.forEach(function(pumpNozzleDataItem) {

                                    if (parseInt(pumpNozzleDataItem.PumpId, 10) > 0) {
                                        pump = pumps.filter(pump => pump.Id == parseInt(pumpNozzleDataItem.PumpId, 10))[0];
                                        if (pump != null) {
                                            fuelGrades.forEach(function(fuelGradeDataItem) {

                                                if (pumpNozzleDataItem.FuelGradeIds != undefined) {
            
                                                        if (pumpNozzleDataItem.FuelGradeIds[0] != undefined &&
                                                            parseInt(fuelGradeDataItem.Id, 10) == parseInt(pumpNozzleDataItem.FuelGradeIds[0], 10))                                                            
                                                            Pump.SetGradeData(pump, 1, fuelGradeDataItem.Name, fuelGradeDataItem.Price);
            
                                                        if (pumpNozzleDataItem.FuelGradeIds[1] != undefined &&
                                                            parseInt(fuelGradeDataItem.Id, 10) == parseInt(pumpNozzleDataItem.FuelGradeIds[1], 10))                                                            
                                                            Pump.SetGradeData(pump, 2, fuelGradeDataItem.Name, fuelGradeDataItem.Price);
            
                                                        if (pumpNozzleDataItem.FuelGradeIds[2] != undefined &&
                                                            parseInt(fuelGradeDataItem.Id, 10) == parseInt(pumpNozzleDataItem.FuelGradeIds[2], 10))                                                            
                                                            Pump.SetGradeData(pump, 3, fuelGradeDataItem.Name, fuelGradeDataItem.Price);
            
                                                        if (pumpNozzleDataItem.FuelGradeIds[3] != undefined &&
                                                            parseInt(fuelGradeDataItem.Id, 10) == parseInt(pumpNozzleDataItem.FuelGradeIds[3], 10))                                                            
                                                            Pump.SetGradeData(pump, 4, fuelGradeDataItem.Name, fuelGradeDataItem.Price);
            
                                                        if (pumpNozzleDataItem.FuelGradeIds[4] != undefined &&
                                                            parseInt(fuelGradeDataItem.Id, 10) == parseInt(pumpNozzleDataItem.FuelGradeIds[4], 10))                                                            
                                                            Pump.SetGradeData(pump, 5, fuelGradeDataItem.Name, fuelGradeDataItem.Price);
            
                                                        if (pumpNozzleDataItem.FuelGradeIds[5] != undefined &&
                                                            parseInt(fuelGradeDataItem.Id, 10) == parseInt(pumpNozzleDataItem.FuelGradeIds[5], 10))                                                            
                                                            Pump.SetGradeData(pump, 6, fuelGradeDataItem.Name, fuelGradeDataItem.Price);
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
        
        // System decimal digits
        data = response.Packets.filter(Packet => Packet.Type == "SystemDecimalDigits");
        if (data != null &&
            data != undefined &&
            data.length > 0) {
            data = data[0].Data;
            if (data == undefined) {
                return;
            } else {
                SYSTEM_PRICE_DECIMAL_DIGITS = parseInt(data.Price, 10);
                SYSTEM_AMOUNT_DECIMAL_DIGITS = parseInt(data.Amount, 10);
                SYSTEM_VOLUME_DECIMAL_DIGITS = parseInt(data.Volume, 10);
                SYSTEM_AMOUNT_TOTAL_DECIMAL_DIGITS = parseInt(data.AmountTotal, 10);
                SYSTEM_VOLUME_TOTAL_DECIMAL_DIGITS = parseInt(data.VolumeTotal, 10);
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

        data = response.Packets.filter(Packet => Packet.Type == "UserInformation");
        if (data != null &&
            data != undefined &&
            data.length > 0) {
            data = data[0].Data;
            if (data == undefined) {
                return;
            } else {

                if (data.Permissions != undefined)
                    currentUserPermissions = data.Permissions;

                if (currentUserPermissions["Control"] == true && currentUserPermissions["Configuration"] == true) {
                    $('#pcpPricesSection').removeClass("d-none");
                    $('#pcpPricesSection').addClass("col-md-6");

                    $('#pcpControlButtonsSection1').addClass("col-md-3");
                    $('#pcpControlButtonsSection1').removeClass("col-sm-6 offset-sm-3");

                    $('#pcpPumpResumeButton').removeClass("d-none");
                    $('#pcpPumpSuspendButton').removeClass("d-none");

                    $('#pcpControlButtonsSection2').removeClass("d-none");
                    $('#pcpControlButtonsSection2').addClass("col-md-3");

                    pumpsControlDatatable.columns([PUMP_VOLUME_TOTAL_INDEX, PUMP_AMOUNT_TOTAL_INDEX, PUMP_USER_INDEX, PUMP_REQUEST_INDEX]).visible(true);
                }
            }
        }

        // Start polling pumps
        if (pumps.length > 0) {
            configurationReceived = 1;
            pollPumps();
        }
    });
}

//-------------------------------------------------------------------------------------
// Limit decimal digits in preset dose
$('#pcpPresetDoseInput').on('keypress', function(event) {
    /*if ($('#pcpPresetTypeSelect').val() == "Volume") {
        return limitDecimalDigits(this, event, SYSTEM_VOLUME_DECIMAL_DIGITS);
    } else if ($('#pcpPresetTypeSelect').val() == "Amount") {
        return limitDecimalDigits(this, event, SYSTEM_AMOUNT_DECIMAL_DIGITS);
    }*/
});

//-------------------------------------------------------------------------------------
// Limit decimal digits in nozzle 1 price
$('#nozzle1Price').on('keypress', function(event) {
    return limitDecimalDigits(this, event, SYSTEM_PRICE_DECIMAL_DIGITS);
});

//-------------------------------------------------------------------------------------
// Limit decimal digits in nozzle 2 price
$('#nozzle2Price').on('keypress', function(event) {
    return limitDecimalDigits(this, event, SYSTEM_PRICE_DECIMAL_DIGITS);
});

//-------------------------------------------------------------------------------------
// Limit decimal digits in nozzle 3 price
$('#nozzle3Price').on('keypress', function(event) {
    return limitDecimalDigits(this, event, SYSTEM_PRICE_DECIMAL_DIGITS);
});

//-------------------------------------------------------------------------------------
// Limit decimal digits in nozzle 4 price
$('#nozzle4Price').on('keypress', function(event) {
    return limitDecimalDigits(this, event, SYSTEM_PRICE_DECIMAL_DIGITS);
});

//-------------------------------------------------------------------------------------
// Limit decimal digits in nozzle 5 price
$('#nozzle5Price').on('keypress', function(event) {
    return limitDecimalDigits(this, event, SYSTEM_PRICE_DECIMAL_DIGITS);
});

//-------------------------------------------------------------------------------------
// Limit decimal digits in nozzle 6 price
$('#nozzle6Price').on('keypress', function(event) {
    return limitDecimalDigits(this, event, SYSTEM_PRICE_DECIMAL_DIGITS);
});

//-------------------------------------------------------------------------------------
// Set selected number in table on pump number change in list
$("#pcpPumpSelect").change(function() {
    if (pumpsControlDatatable == null)
        return;

    pumpsControlDatatable.rows().deselect();

    $('#pcpPumps>tbody>tr').each(function(row, tr) {
        if (parseInt($(tr).children('td.pumpNumber').text(), 10) == parseInt($("#pcpPumpSelect").val(), 10)) {
            pumpsControlDatatable.row(row).select();

            // Set nozzle prices and grade names
            setNozzlePricesAndGradeNames(parseInt($("#pcpPumpSelect").val(), 10));

            // Refresh buttons
            refreshControls();

            return;
        }
    });
});

//-------------------------------------------------------------------------------------
// Set selected number in table on pump number change in list
$("#pcpPresetTypeSelect").change(function() {
    if ($('#pcpPresetTypeSelect').val() == "FullTank") { 
        $('#pcpPresetDoseInput').prop("readonly", true);
    } else {
        $('#pcpPresetDoseInput').prop("readonly", false);
    }
});

//-------------------------------------------------------------------------------------
// Authorize button click handler
$('#pcpPumpAuthorizeModalButton').click(function() {
    var pumpNumber = 0;
    var nozzleNumber = 0;
    var price = 0;
    var presetType = 0;
    var presetDose = 0;
    var modalText = "";
    var pump;
    
    if (pumps.length == 0) {
        showMessage("No pumps");
        return;
    }

    // Get selected pump
    pumpNumber = parseInt($("#pcpPumpSelect").val(), 10);
    pump = pumps.filter(pump => pump.Id == pumpNumber)[0];
    if (pump.Status != "IDLE" && pump.Status != "NOZZLE") {
        showMessage("Pump is busy");
        return;
    }

    // Get selected nozzle and price
    switch($("input[name='pcpNozzlesRadio']:checked"). val()) {
        case "nozzle1":
            nozzleNumber = 1;
            price = $("input[name='nozzle1Price']").val();
            break;
        case "nozzle2":
            nozzleNumber = 2;
            price = $("input[name='nozzle2Price']").val();
            break;
        case "nozzle3":
            nozzleNumber = 3;
            price = $("input[name='nozzle3Price']").val();
            break;
        case "nozzle4":
            nozzleNumber = 4;
            price = $("input[name='nozzle4Price']").val();
            break;
        case "nozzle5":
            nozzleNumber = 5;
            price = $("input[name='nozzle5Price']").val();
            break;
        case "nozzle6":
            nozzleNumber = 6;
            price = $("input[name='nozzle6Price']").val();
            break;
    }

    // Validate price value
    if (parseFloat(price) == NaN) {
        showMessage("Price is NaN");
        return;
    }

    // Get preset type
    presetType = $('#pcpPresetTypeSelect').val();
    if (presetType == "Volume" ||
        presetType == "Amount") {
        
        // Get preset value
        presetDose = $('#pcpPresetDoseInput').val();

        // Validate dose value
        if (parseFloat(presetDose) == NaN) {
            showMessage("Preset dose is NaN");
            return;
        }
    }

    modalText += "Pump: " + pumpNumber.toString();

    pump = pumps.filter(pump => pump.Id == pumpNumber)[0];
    data = Pump.GetGradeData(pump, nozzleNumber);
    if (data.name.length > 0)
        modalText += "<br/>Nozzle: " + nozzleNumber.toString() + " (" + data.name + ")";
    else
        modalText += "<br/>Nozzle: " + nozzleNumber.toString();

    modalText += "<br/>Price: " + parseFloat(price).toFixed(SYSTEM_PRICE_DECIMAL_DIGITS);
    
    if (presetType == "Volume")
        modalText += "<br/>Preset type: volume, dose: " + parseFloat(presetDose).toFixed(SYSTEM_VOLUME_DECIMAL_DIGITS);
    else if (presetType == "Amount")
        modalText += "<br/>Preset type: amount, dose: " + parseFloat(presetDose).toFixed(SYSTEM_AMOUNT_DECIMAL_DIGITS);
    else
        modalText += "<br/>Preset type: full tank";

    $('#pcpAuthorizeModalText').html(modalText);

    $('#pcpAuthorizeModal').modal({backdrop: true, keyboard: true, focus: true, show: true});
    
    if (presetType == "Volume")
        $('.modal-backdrop').css("background-color", "DodgerBlue");
    else if (presetType == "Amount")
        $('.modal-backdrop').css("background-color", "Coral");
    else
        $('.modal-backdrop').css("background-color", "Aquamarine");
});

//-------------------------------------------------------------------------------------
// Authorize button click handler
$('#pcpPumpAuthorizeButton').click(function() {
    var pumpNumber = 0;
    var nozzleNumber = 0;
    var price = 0;
    var presetType = 0;
    var presetDose = 0;

    $('#pcpAuthorizeModal').modal('hide');
    
    if (pumps.length == 0) {
        showMessage("No pumps");
        return;
    }

    // Get selected pump
    pumpNumber = parseInt($("#pcpPumpSelect").val(), 10);
    pumps.filter(pump => pump.Id == pumpNumber)[0];
    if (pump.Status != "IDLE" && pump.Status != "NOZZLE") {
        showMessage("Pump is busy");
        return;
    }

    // Get selected nozzle and price
    switch($("input[name='pcpNozzlesRadio']:checked"). val()) {
        case "nozzle1":
            nozzleNumber = 1;
            price = $("input[name='nozzle1Price']").val();
            break;
        case "nozzle2":
            nozzleNumber = 2;
            price = $("input[name='nozzle2Price']").val();
            break;
        case "nozzle3":
            nozzleNumber = 3;
            price = $("input[name='nozzle3Price']").val();
            break;
        case "nozzle4":
            nozzleNumber = 4;
            price = $("input[name='nozzle4Price']").val();
            break;
        case "nozzle5":
            nozzleNumber = 5;
            price = $("input[name='nozzle5Price']").val();
            break;
        case "nozzle6":
            nozzleNumber = 6;
            price = $("input[name='nozzle6Price']").val();
            break;
    }

    // Validate price value
    if (parseFloat(price) == NaN ||
        parseFloat(price) == 0) {
        showMessage("Price is not valid");
        return;
    }

    // Get preset type
    presetType = $('#pcpPresetTypeSelect').val();
    if (presetType == "Volume" ||
        presetType == "Amount") {
        
        // Get preset value
        presetDose = $('#pcpPresetDoseInput').val();

        // Validate dose value
        if (parseFloat(presetDose) == NaN) {
            showMessage("Preset dose is NaN");
            return;
        }
    }

    // Authorize
    commands = [];
    commands.push({
        function: PumpAuthorize,
        arguments: [
            pumpNumber, 
            nozzleNumber, 
            presetType, 
            presetDose, 
            price
        ]
    });
    request = createComplexRequest(commands, false);

    // Process response
    CheckResponse(request);
});

//-------------------------------------------------------------------------------------
// Stop button click handler
$('#pcpPumpStopButton').click(function() {
    var pumpNumber = 0;

    if (pumps.length == 0) {
        showMessage("No pumps");
        return;
    }

    // Get selected pump
    pumpNumber = parseInt($("#pcpPumpSelect").val(), 10);
    pumps.filter(pump => pump.Id == pumpNumber)[0];

    // Stop
    commands = [];
    commands.push({
        function: PumpStop,
        arguments: [
            pumpNumber
        ]
    });
    request = createComplexRequest(commands, false);

    // Process response
    CheckResponse(request);
});

//-------------------------------------------------------------------------------------
// Emergency stop button click handler
$('#pcpPumpEmergencyStopButton').click(function() {
    var pumpNumber = 0;

    if (pumps.length == 0) {
        showMessage("No pumps");
        return;
    }

    // Get selected pump
    pumpNumber = parseInt($("#pcpPumpSelect").val(), 10);
    pumps.filter(pump => pump.Id == pumpNumber)[0];

    // Stop
    commands = [];
    commands.push({
        function: PumpEmergencyStop,
        arguments: [
            pumpNumber
        ]
    });
    request = createComplexRequest(commands, false);

    // Process response
    CheckResponse(request);
});

//-------------------------------------------------------------------------------------
// Resume button click handler
$('#pcpPumpResumeButton').click(function() {
    var pumpNumber = 0;

    if (pumps.length == 0) {
        showMessage("No pumps");
        return;
    }

    // Get selected pump
    pumpNumber = parseInt($("#pcpPumpSelect").val(), 10);
    pumps.filter(pump => pump.Id == pumpNumber)[0];
    if (pump.Status != "FILLING") {
        showMessage("Pump is not filling");
        return;
    }

    // Resume
    commands = [];
    commands.push({
        function: PumpResume,
        arguments: [
            pumpNumber
        ]
    });
    request = createComplexRequest(commands, false);

    // Process response
    CheckResponse(request);
});

//-------------------------------------------------------------------------------------
// Suspend button click handler
$('#pcpPumpSuspendButton').click(function() {
    var pumpNumber = 0;

    if (pumps.length == 0) {
        showMessage("No pumps");
        return;
    }

    // Get selected pump
    pumpNumber = parseInt($("#pcpPumpSelect").val(), 10);
    pumps.filter(pump => pump.Id == pumpNumber)[0];
    if (pump.Status != "FILLING") {
        showMessage("Pump is not filling");
        return;
    }

    // Suspend
    commands = [];
    commands.push({
        function: PumpSuspend,
        arguments: [
            pumpNumber
        ]
    });
    request = createComplexRequest(commands, false);

    // Process response
    CheckResponse(request);
});

//-------------------------------------------------------------------------------------
// GetTotals button click handler
$('#pcpPumpGetTotalCountersButton').click(function() {
    var pumpNumber = 0;
    var nozzleNumber = 0;

    if (pumps.length == 0) {
        showMessage("No pumps");
        return;
    }

    // Get selected pump
    pumpNumber = parseInt($("#pcpPumpSelect").val(), 10);
    pumps.filter(pump => pump.Id == pumpNumber)[0];
    if (pump.Status != "IDLE" && pump.Status != "NOZZLE") {
        showMessage("Pump is busy");
        return;
    }

    // Get selected nozzle
    switch($("input[name='pcpNozzlesRadio']:checked"). val()) {
        case "nozzle1":
            nozzleNumber = 1;
            break;
        case "nozzle2":
            nozzleNumber = 2;
            break;
        case "nozzle3":
            nozzleNumber = 3;
            break;
        case "nozzle4":
            nozzleNumber = 4;
            break;
        case "nozzle5":
            nozzleNumber = 5;
            break;
        case "nozzle6":
            nozzleNumber = 6;
            break;
    }

    // GetTotals
    commands = [];
    commands.push({
        function: PumpGetTotals,
        arguments: [
            pumpNumber,
            nozzleNumber
        ]
    });
    request = createComplexRequest(commands, false);

    // Process response
    CheckResponse(request);
});

//-------------------------------------------------------------------------------------
// SetPrices button click handler
$('#pcpPumpSetPricesButton').click(function() {
    var pumpNumber = 0;
    var priceNozzle1 = 0;
    var priceNozzle2 = 0;
    var priceNozzle3 = 0;
    var priceNozzle4 = 0;
    var priceNozzle5 = 0;
    var priceNozzle6 = 0;

    if (pumps.length == 0) {
        showMessage("No pumps");
        return;
    }

    // Get selected pump
    pumpNumber = parseInt($("#pcpPumpSelect").val(), 10);
    pumps.filter(pump => pump.Id == pumpNumber)[0];
    if (pump.Status != "IDLE" && pump.Status != "NOZZLE") {
        showMessage("Pump is busy");
        return;
    }

    // Get price of nozzle 1
    if (parseFloat($('#nozzle1Price').val()) == NaN) {
        showMessage("Price of nozzle 1 is not a number");
        return;
    } else {
        priceNozzle1 = parseFloat($('#nozzle1Price').val());
    }

    // Get price of nozzle 2
    if (parseFloat($('#nozzle2Price').val()) == NaN) {
        showMessage("Price of nozzle 2 is not a number");
        return;
    } else {
        priceNozzle2 = parseFloat($('#nozzle2Price').val());
    }

    // Get price of nozzle 3
    if (parseFloat($('#nozzle3Price').val()) == NaN) {
        showMessage("Price of nozzle 3 is not a number");
        return;
    } else {
        priceNozzle3 = parseFloat($('#nozzle3Price').val());
    }

    // Get price of nozzle 4
    if (parseFloat($('#nozzle4Price').val()) == NaN) {
        showMessage("Price of nozzle 4 is not a number");
        return;
    } else {
        priceNozzle4 = parseFloat($('#nozzle4Price').val());
    }

    // Get price of nozzle 5
    if (parseFloat($('#nozzle5Price').val()) == NaN) {
        showMessage("Price of nozzle 5 is not a number");
        return;
    } else {
        priceNozzle5 = parseFloat($('#nozzle5Price').val());
    }

    // Get price of nozzle 6
    if (parseFloat($('#nozzle6Price').val()) == NaN) {
        showMessage("Price of nozzle 6 is not a number");
        return;
    } else {
        priceNozzle6 = parseFloat($('#nozzle6Price').val());
    }

    // SetPrices
    commands = [];
    commands.push({
        function: PumpSetPrices,
        arguments: [
            pumpNumber,
            priceNozzle1,
            priceNozzle2,
            priceNozzle3,
            priceNozzle4,
            priceNozzle5,
            priceNozzle6
        ]
    });
    request = createComplexRequest(commands, false);

    // Process response
    CheckResponse(request);
});

//-------------------------------------------------------------------------------------
// GetPrices button click handler
$('#pcpPumpGetPricesButton').click(function() {
    var pumpNumber = 0;

    if (pumps.length == 0) {
        showMessage("No pumps");
        return;
    }

    // Get selected pump
    pumpNumber = parseInt($("#pcpPumpSelect").val(), 10);
    pumps.filter(pump => pump.Id == pumpNumber)[0];
    if (pump.Status != "IDLE" && pump.Status != "NOZZLE") {
        showMessage("Pump is busy");
        return;
    }

    // GetPrices
    commands = [];
    commands.push({
        function: PumpGetPrices,
        arguments: [
            pumpNumber
        ]
    });
    request = createComplexRequest(commands, false);

    // Process response
    CheckResponse(request);
});

//-------------------------------------------------------------------------------------
// GetTag button click handler
$('#pcpPumpGetTagButton').click(function() {
    var pumpNumber = 0;
    var nozzleNumber = 0;

    if (pumps.length == 0) {
        showMessage("No pumps");
        return;
    }

    // Get selected pump
    pumpNumber = parseInt($("#pcpPumpSelect").val(), 10);
    pumps.filter(pump => pump.Id == pumpNumber)[0];
    if (pump.Status != "IDLE" && pump.Status != "NOZZLE") {
        showMessage("Pump is busy");
        return;
    }

    // Get selected nozzle
    switch($("input[name='pcpNozzlesRadio']:checked"). val()) {
        case "nozzle1":
            nozzleNumber = 1;
            break;
        case "nozzle2":
            nozzleNumber = 2;
            break;
        case "nozzle3":
            nozzleNumber = 3;
            break;
        case "nozzle4":
            nozzleNumber = 4;
            break;
        case "nozzle5":
            nozzleNumber = 5;
            break;
        case "nozzle6":
            nozzleNumber = 6;
            break;
    }

    // GetPrices
    commands = [];
    commands.push({
        function: PumpGetTag,
        arguments: [
            pumpNumber,
            nozzleNumber
        ]
    });
    request = createComplexRequest(commands, false);

    // Process response
    CheckResponse(request);
});

//-------------------------------------------------------------------------------------
// SetLightsOn button click handler
$('#pcpPumpSetLightsOnButton').click(function() {
    var pumpNumber = 0;

    if (pumps.length == 0) {
        showMessage("No pumps");
        return;
    }

    // Get selected pump
    pumpNumber = parseInt($("#pcpPumpSelect").val(), 10);
    pumps.filter(pump => pump.Id == pumpNumber)[0];
    if (pump.Status != "IDLE" && pump.Status != "NOZZLE") {
        showMessage("Pump is busy");
        return;
    }

    // GetPrices
    commands = [];
    commands.push({
        function: PumpSetLights,
        arguments: [
            pumpNumber,
            "On"
        ]
    });
    request = createComplexRequest(commands, false);

    // Process response
    CheckResponse(request);
});

//-------------------------------------------------------------------------------------
// SetLightsOff button click handler
$('#pcpPumpSetLightsOffButton').click(function() {
    var pumpNumber = 0;

    if (pumps.length == 0) {
        showMessage("No pumps");
        return;
    }

    // Get selected pump
    pumpNumber = parseInt($("#pcpPumpSelect").val(), 10);
    pumps.filter(pump => pump.Id == pumpNumber)[0];
    if (pump.Status != "IDLE" && pump.Status != "NOZZLE") {
        showMessage("Pump is busy");
        return;
    }

    // GetPrices
    commands = [];
    commands.push({
        function: PumpSetLights,
        arguments: [
            pumpNumber,
            "Off"
        ]
    });
    request = createComplexRequest(commands, false);

    // Process response
    CheckResponse(request);
});

//-------------------------------------------------------------------------------------
// Poll pumps
function pollPumps() {

    // Clean arrays
    commands = [];

    // Stop operation on any other page
    if (window.location.href.indexOf("PumpsControlPage") == -1)
        return;

    if (pumps.length > 0) {
        pumps.forEach(function(pumpData) {
            commands.push({
                function: PumpGetStatus,
                arguments: [
                    pumpData.Id
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
        CheckResponse(request);
    }
}

//-------------------------------------------------------------------------------------
function CheckResponse(request) {
    
    var data;
    
    // Process response
    request.done(function(response) {
        if (responseNull == true)
            return;
        
        // Request result is OK
        if (response.Packets.length == 1 &&
            response.Packets[0].Message != undefined && 
            response.Packets[0].Message == "OK") {
            return;
        }

        // Loop through all response packets
        response.Packets.forEach(function(packet) {
            if (packet == undefined ||
                packet == null)
                return;

            if (packet.Error != undefined &&
                packet.Error == true &&
                packet.Message != undefined &&
                packet.Message !== "") {
                showMessage(packet.Message);
                return;
            }

            if (packet.Type == "ConfigurationIdentifier") {
                data = packet.Data;
                if (data == undefined) {
                    return;
                } else {
                    if (data.Id != undefined &&
                        configurationId != data.Id) {

                        // Get all configurations
                        initConfiguration();
                    } else {
                        timerPumpsPollingId = setTimeout(pollPumps, 1000);
                    }
                }
            } else if (packet.Type == "PumpAuthorizeConfirmation") {
                // Do nothing
            } else if (packet.Type == "PumpEmergencyStop") {
                // Do nothing
            } else {
                if (packet.Data == undefined ||
                    packet.Data == null)
                    return;

                if (packet.Data.Pump == undefined ||
                    packet.Data.Pump == null)
                    return;

                // Get current pump from response
                var pump = pumps.filter(x => parseInt(x.Id, 10) == parseInt(packet.Data.Pump, 10))[0];

                if (pump != null) {
                    switch(packet.Type) {
                        case "PumpIdleStatus":                                    
                            if (parseInt(packet.Data.NozzleUp, 10) > 0) {
                                pump.Status = "NOZZLE";
                                pump.Nozzle = packet.Data.NozzleUp;
                                pump.Price = parseFloat(Pump.GetGradeData(pump, pump.Nozzle).price).toFixed(SYSTEM_PRICE_DECIMAL_DIGITS);
                            } else {
                                pump.Status = "IDLE";
                                pump.Nozzle = "0";
                            }

                            // Last transaction data
                            if (parseInt(packet.Data.LastNozzle, 10) > 0) {
                                pump.Transaction = packet.Data.LastTransaction;
                                pump.Volume = packet.Data.LastVolume;
                                pump.Amount = packet.Data.LastAmount;
                            }
                            
                            pump.Request = packet.Data.Request;
                            pump.User = packet.Data.User;
                            break;
                            
                        case "PumpFillingStatus":
                            pump.Status = "FILLING";
                            pump.Transaction = packet.Data.Transaction;
                            pump.Nozzle = packet.Data.Nozzle;
                            pump.Volume = packet.Data.Volume;
                            pump.Amount = packet.Data.Amount;
                            pump.Price = packet.Data.Price;
                            pump.User = packet.Data.User;
                            break;
                            
                        case "PumpEndOfTransactionStatus":
                            pump.Status = "FILLING";
                            pump.Transaction = packet.Data.Transaction;
                            pump.Nozzle = packet.Data.Nozzle;
                            pump.Volume = packet.Data.Volume;
                            pump.Amount = packet.Data.Amount;
                            pump.Price = packet.Data.Price;
                            pump.User = packet.Data.User;

                            // Close transaction
                            if (pump.User == $('#usernameDiv').text() ||
                                pump.User == SYSTEM_USER_PTS_NAME)
                                Pump.CloseTransaction(pump);
                            break;
                            
                        case "PumpOfflineStatus":
                            pump.Status = "OFFLINE";
                            pump.Nozzle = "0";                                        
                            pump.Transaction = "0";
                            pump.Volume = "0";
                            pump.Amount = "0";
                            pump.Price = "0";
                            pump.Request = "";
                            pump.User = packet.Data.User;
                            break;
                            
                        case "PumpTotals":
                            pump.Transaction = packet.Data.Transaction;
                            pump.VolumeTotal = packet.Data.Volume;
                            pump.AmountTotal = packet.Data.Amount;
                            pump.User = packet.Data.User;
                            break;
                            
                        case "PumpPrices":
                            Pump.SetGradePrice(pump, 1, packet.Data.Prices[0]);
                            Pump.SetGradePrice(pump, 2, packet.Data.Prices[1]);
                            Pump.SetGradePrice(pump, 3, packet.Data.Prices[2]);
                            Pump.SetGradePrice(pump, 4, packet.Data.Prices[3]);
                            Pump.SetGradePrice(pump, 5, packet.Data.Prices[4]);
                            Pump.SetGradePrice(pump, 6, packet.Data.Prices[5]);
                            pump.User = packet.Data.User;
                            $('#nozzle1Price').val(parseFloat(packet.Data.Prices[0]).toFixed(SYSTEM_PRICE_DECIMAL_DIGITS));
                            $('#nozzle2Price').val(parseFloat(packet.Data.Prices[1]).toFixed(SYSTEM_PRICE_DECIMAL_DIGITS));
                            $('#nozzle3Price').val(parseFloat(packet.Data.Prices[2]).toFixed(SYSTEM_PRICE_DECIMAL_DIGITS));
                            $('#nozzle4Price').val(parseFloat(packet.Data.Prices[3]).toFixed(SYSTEM_PRICE_DECIMAL_DIGITS));
                            $('#nozzle5Price').val(parseFloat(packet.Data.Prices[4]).toFixed(SYSTEM_PRICE_DECIMAL_DIGITS));
                            $('#nozzle6Price').val(parseFloat(packet.Data.Prices[5]).toFixed(SYSTEM_PRICE_DECIMAL_DIGITS));
                            break;
                            
                        case "PumpTag":
                            pump.Tag = packet.Data.Tag;
                            pump.User = packet.Data.User;
                            showMessage("Pump " + pump.Id + " nozzle " + packet.Data.Nozzle + " tag: " + pump.Tag, "success");
                            break;
                    }

                    // Refresh datatable
                    if (pumpsControlDatatable != null)
                        Pump.Update(pumpsControlDatatable, pump);

                    // Refresh controls
                    refreshControls();
                }
            }
        });
    }).fail(function(response) {
        timerPumpsPollingId = setTimeout(pollPumps, 1000);
        
        if ($("#message").hasClass("d-block") &&
            $("#message").text() == "Error(s): No response") {
            if (pumps.length > 0) {
                pumps.forEach(function(pump) {
                    pump.Status = "OFFLINE";
                    pump.Nozzle = "0";                                        
                    pump.Transaction = "0";
                    pump.Volume = "0";
                    pump.Amount = "0";
                    pump.Price = "0";
                    pump.Request = "";
                    pump.User = "";

                    // Refresh datatable
                    if (pumpsControlDatatable != null)
                        Pump.Update(pumpsControlDatatable, pump);
                });

                // Refresh controls
                refreshControls();
            }
        }
    });
}

//-------------------------------------------------------------------------------------
// Set active/disabled controls
function refreshControls() {
    var pump = 0;

    if (pumps.length == 0) {
        return;
    }
    
    // Get selected pump
    pump = pumps.filter(_pump => _pump.Id == parseInt($("#pcpPumpSelect").val(), 10))[0];
    if (pump == null) {
        return;
    }

    switch (pump.Status) {
        case "IDLE":
        case "NOZZLE":
            $('#pcpPumpAuthorizeModalButton').removeAttr("disabled");
            $('#pcpPumpAuthorizeButton').removeAttr("disabled");
            $('#pcpPumpStopButton').removeAttr("disabled");
            $('#pcpPumpResumeButton').attr('disabled', 'disabled');
            $('#pcpPumpSuspendButton').attr('disabled', 'disabled');
            $('#pcpPumpGetPricesButton').removeAttr("disabled");
            $('#pcpPumpSetPricesButton').removeAttr("disabled");
            $('#pcpPumpGetTotalCountersButton').removeAttr("disabled");
            $('#pcpPumpGetTagButton').removeAttr("disabled");
            $('#pcpPumpSetLightsOnButton').removeAttr("disabled");
            $('#pcpPumpSetLightsOffButton').removeAttr("disabled");

            setNozzlePricesAndGradeNames(parseInt($("#pcpPumpSelect").val(), 10), false);
            break;

        case "FILLING":
            $('#pcpPumpAuthorizeModalButton').attr('disabled', 'disabled');
            $('#pcpPumpAuthorizeButton').attr('disabled', 'disabled');
            $('#pcpPumpStopButton').removeAttr("disabled");
            $('#pcpPumpResumeButton').removeAttr("disabled");
            $('#pcpPumpSuspendButton').removeAttr("disabled");
            $('#pcpPumpGetPricesButton').attr('disabled', 'disabled');
            $('#pcpPumpSetPricesButton').attr('disabled', 'disabled');
            $('#pcpPumpGetTotalCountersButton').attr('disabled', 'disabled');
            $('#pcpPumpGetTagButton').attr('disabled', 'disabled');
            $('#pcpPumpSetLightsOnButton').attr('disabled', 'disabled');
            $('#pcpPumpSetLightsOffButton').attr('disabled', 'disabled');
            break;
            
        case "OFFLINE":
            $('#pcpPumpAuthorizeModalButton').attr('disabled', 'disabled');
            $('#pcpPumpAuthorizeButton').attr('disabled', 'disabled');
            $('#pcpPumpStopButton').attr('disabled', 'disabled');
            $('#pcpPumpResumeButton').attr('disabled', 'disabled');
            $('#pcpPumpSuspendButton').attr('disabled', 'disabled');
            $('#pcpPumpGetPricesButton').attr('disabled', 'disabled');
            $('#pcpPumpSetPricesButton').attr('disabled', 'disabled');
            $('#pcpPumpGetTotalCountersButton').attr('disabled', 'disabled');
            $('#pcpPumpGetTagButton').attr('disabled', 'disabled');
            $('#pcpPumpSetLightsOnButton').attr('disabled', 'disabled');
            $('#pcpPumpSetLightsOffButton').attr('disabled', 'disabled');
            break;
    }
}

//-------------------------------------------------------------------------------------
// Updated nozzle prices and fuel grade names
function setNozzlePricesAndGradeNames(pumpNumber, setPrice = true) {
    pump = pumps.filter(pump => pump.Id == pumpNumber)[0];

    if (setPrice == true) {
        data = Pump.GetGradeData(pump, 1);
        if (data.name != "") {
            $('#pcpNozzle1GradeName').removeClass("d-none");
            $('#pcpNozzle1GradeName').html(data.name);
        } else {
            $('#pcpNozzle1GradeName').addClass("d-none");
            $('#pcpNozzle1GradeName').html("");
        }

        $('#nozzle1Price').val(parseFloat(data.price).toFixed(SYSTEM_PRICE_DECIMAL_DIGITS));
        
        data = Pump.GetGradeData(pump, 2);
        if (data.name != "") {
            $('#pcpNozzle2GradeName').removeClass("d-none");
            $('#pcpNozzle2GradeName').html(data.name);
        } else {
            $('#pcpNozzle2GradeName').addClass("d-none");
            $('#pcpNozzle2GradeName').html("");
        }        
        
        $('#nozzle2Price').val(parseFloat(data.price).toFixed(SYSTEM_PRICE_DECIMAL_DIGITS));
        
        data = Pump.GetGradeData(pump, 3);
        if (data.name != "") {
            $('#pcpNozzle3GradeName').removeClass("d-none");
            $('#pcpNozzle3GradeName').html(data.name);
        } else {
            $('#pcpNozzle3GradeName').addClass("d-none");
            $('#pcpNozzle3GradeName').html("");
        }        
        
        $('#nozzle3Price').val(parseFloat(data.price).toFixed(SYSTEM_PRICE_DECIMAL_DIGITS));
        
        data = Pump.GetGradeData(pump, 4);
        if (data.name != "") {
            $('#pcpNozzle4GradeName').removeClass("d-none");
            $('#pcpNozzle4GradeName').html(data.name);
        } else {
            $('#pcpNozzle4GradeName').addClass("d-none");
            $('#pcpNozzle4GradeName').html("");
        }        
        
        $('#nozzle4Price').val(parseFloat(data.price).toFixed(SYSTEM_PRICE_DECIMAL_DIGITS));
        
        data = Pump.GetGradeData(pump, 5);
        if (data.name != "") {
            $('#pcpNozzle5GradeName').removeClass("d-none");
            $('#pcpNozzle5GradeName').html(data.name);
        } else {
            $('#pcpNozzle5GradeName').addClass("d-none");
            $('#pcpNozzle5GradeName').html("");
        }        
        
        $('#nozzle5Price').val(parseFloat(data.price).toFixed(SYSTEM_PRICE_DECIMAL_DIGITS));
        
        data = Pump.GetGradeData(pump, 6);
        if (data.name != "") {
            $('#pcpNozzle6GradeName').removeClass("d-none");
            $('#pcpNozzle6GradeName').html(data.name);
        } else {
            $('#pcpNozzle6GradeName').addClass("d-none");
            $('#pcpNozzle6GradeName').html("");
        }        
        
        $('#nozzle6Price').val(parseFloat(data.price).toFixed(SYSTEM_PRICE_DECIMAL_DIGITS));
    }

    if (pump.Status == "IDLE" || pump.Status == "NOZZLE") {
        $('#nozzle1Price').prop("readonly", false);
        $('#nozzle2Price').prop("readonly", false);
        $('#nozzle3Price').prop("readonly", false);
        $('#nozzle4Price').prop("readonly", false);
        $('#nozzle5Price').prop("readonly", false);
        $('#nozzle6Price').prop("readonly", false);
    } else if (pump.Status == "FILLING" || pump.Status == "OFFLINE") {
        $('#nozzle1Price').prop("readonly", true);
        $('#nozzle2Price').prop("readonly", true);
        $('#nozzle3Price').prop("readonly", true);
        $('#nozzle4Price').prop("readonly", true);
        $('#nozzle5Price').prop("readonly", true);
        $('#nozzle6Price').prop("readonly", true);
    }

    // Set nozzle
    if (pump.Status == "NOZZLE" || pump.Status == "FILLING") {
        $('input[name="pcpNozzlesRadio"]').removeAttr('checked');
        switch (parseInt(pump.Nozzle, 10)) {
            case 1:
                $('input[name="pcpNozzlesRadio"]').val(["nozzle1"]);
                break;
                
            case 2:
                $('input[name="pcpNozzlesRadio"]').val(["nozzle2"]);
                break;
                
            case 3:
                $('input[name="pcpNozzlesRadio"]').val(["nozzle3"]);
                break;
                
            case 4:
                $('input[name="pcpNozzlesRadio"]').val(["nozzle4"]);
                break;
                
            case 5:
                $('input[name="pcpNozzlesRadio"]').val(["nozzle5"]);
                break;
                
            case 6:
                $('input[name="pcpNozzlesRadio"]').val(["nozzle6"]);
                break;
        }
    }
}

//-------------------------------------------------------------------------------------
// Set decimal digits in fields
function limitDecimalDigits(control, event, decimalDigitsNumber) {
    var indexDecimal = -1;
    var indexPresent = 0;
    var totalInteger = 0;
    var totalDecimal = 0;

    // Limit only numbers and decimal point
    if ((event.keyCode < 48 || event.keyCode > 57) &&
        event.keyCode != 46) {
        return false;
    }

    // Eliminate dublicating dot
    if (event.keyCode == 46 && 
        $(control).val().indexOf('.') != -1) {
        return false;
    }

    // Get present input position
    indexPresent = event.target.selectionStart;

    // Get decimal separator position
    if ($(control).val().split('.').length == 2) {
        indexDecimal = $(control).val().indexOf('.');
    }

    // Get total integer digits
    totalInteger = $(control).val().split('.')[0].length;

    // Get total decimal digits
    if (indexDecimal != -1) {
        totalDecimal = $(control).val().split('.')[1].length;
    }

    if (event.keyCode == 46 && 
        indexPresent < $(control).val().length - decimalDigitsNumber) {
        return false;
    }

    // Limit decimal digits
    if (totalDecimal >= decimalDigitsNumber &&
        indexPresent > indexDecimal &&
        indexDecimal != -1) {
        return false;
    }

    // Limit integer digits
    if (totalInteger >= 9 - decimalDigitsNumber &&
        indexPresent <= indexDecimal &&
        indexDecimal != -1) {
        return false;
    } else if (indexDecimal == -1 &&
        $(control).val().length >= 9) {
        return false;
    }
}