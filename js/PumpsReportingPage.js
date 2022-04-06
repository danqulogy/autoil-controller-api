var request = 0;
var commands = [];
var counter = 0;
var counter2 = 0;

// Existing pumps configuration
var reportData = [];
var pumpNozzlesReportData = [];
var pumpNozzlesReportDataItem;
var users = [];
var fuelGrades = [];
var pumpNozzles = [];

// Pumps reporting DataTable
var pumpsReportingDatatable;
var pumpNozzlesReportingDatatable;

var SYSTEM_PRICE_DECIMAL_DIGITS = 2;
var SYSTEM_AMOUNT_DECIMAL_DIGITS = 2;
var SYSTEM_VOLUME_DECIMAL_DIGITS = 2;
var SYSTEM_AMOUNT_TOTAL_DECIMAL_DIGITS = 2;
var SYSTEM_VOLUME_TOTAL_DECIMAL_DIGITS = 2;

var SYSTEM_USER_DART_ID = 11;
var SYSTEM_USER_DART_NAME = "DART_1";
var SYSTEM_USER_DART_ID = 12;
var SYSTEM_USER_DART_NAME = "DART_2";
var SYSTEM_USER_DART_ID = 13;
var SYSTEM_USER_DART_NAME = "DART_3";
var SYSTEM_USER_DART_ID = 14;
var SYSTEM_USER_DART_NAME = "DART_4";
var SYSTEM_USER_UNIPUMP_ID = 15;
var SYSTEM_USER_UNIPUMP_NAME = "UNIPUMP";
var SYSTEM_USER_PTS_ID = 16;
var SYSTEM_USER_PTS_NAME = "PTS";

//-------------------------------------------------------------------------------------
// Add pump numbers to the list
$('#rpDeviceNumberLabel').text("Pump");
$('#rpDeviceNumberSelect').empty();
$('#rpDeviceNumberSelect').append('<option value="0">All</option>');
for(counter = 1; counter <= TOTAL_PUMPS; counter++)
    $('#rpDeviceNumberSelect').append('<option value="' + counter + '">' + counter + '</option>');
    
$('#rpFuelGradeSelect').empty();
$('#rpFuelGradeSelect').append('<option value="0">All</option>');

$('#rpUserSelect').empty();
$('#rpUserSelect').append('<option value="0">All</option>');
                
// Show pump controls
if ($('#rpPumpSummaryReport').hasClass("d-none") == true)
    $('#rpPumpSummaryReport').removeClass("d-none");
    
// Hide tank controls
if ($('#rpTankDirection').hasClass("d-none") == false)
    $('#rpTankDirection').addClass("d-none");
if ($('#rpTankReconciliationReport').hasClass("d-none") == false)
    $('#rpTankReconciliationReport').addClass("d-none");
if ($('#rpTankMeasurementsChart').hasClass("d-none") == false)
    $('#rpTankMeasurementsChart').addClass("d-none");

// Clean arrays
commands = [];

// Get configuration
commands.push({
    function: GetUsersConfiguration,
},{
    function: GetFuelGradesConfiguration
},{
    function: GetPumpNozzlesConfiguration
},{
    function: GetSystemDecimalDigits
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
                counter = 0;
                data.FuelGrades.forEach(function(fuelGradeDataItem) {
                    counter++;
                    fuelGrades.push({
                        Id: fuelGradeDataItem.Id,
                        Name: fuelGradeDataItem.Name
                    });
                    $('#rpFuelGradeSelect').append('<option value="' + counter + '">' + fuelGradeDataItem.Name + '</option>');
                });
                    
                if ($('#rpFuelGradesList').hasClass("d-none") == true)
                    $('#rpFuelGradesList').removeClass("d-none");
            }
        }
    }
            
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
                pumpNozzles = [];
                data.PumpNozzles.forEach(function(pumpNozzlesDataItem) {
                    pumpNozzles.push({
                        PumpId: pumpNozzlesDataItem.PumpId,
                        FuelGradeIds: pumpNozzlesDataItem.FuelGradeIds
                    });
                });
            }
        }
    }
            
    // Users configuration
    data = response.Packets.filter(Packet => Packet.Type == "UsersConfiguration");
    if (data != null &&
        data != undefined &&
        data.length > 0) {
        data = data[0].Data;
        if (data == undefined) {
            return;
        } else {

            // Fill in response values
            if (data.Users.length > 0) {
                users = [];
                counter = 0;
                data.Users.forEach(function(user) {
                    counter++;
                    users.push({
                        Id: user.Id,
                        Login: user.Login
                    });
                    $('#rpUserSelect').append('<option value="' + counter + '">' + user.Login + '</option>');
                });

                // Service users
                users.push({
                    Id: SYSTEM_USER_DART_ID,
                    Login: SYSTEM_USER_DART_NAME
                });
                $('#rpUserSelect').append('<option value="' + SYSTEM_USER_DART_ID.toString() + '">' + SYSTEM_USER_DART_NAME + '</option>');
                users.push({
                    Id: SYSTEM_USER_UNIPUMP_ID,
                    Login: SYSTEM_USER_UNIPUMP_NAME
                });
                $('#rpUserSelect').append('<option value="' + SYSTEM_USER_UNIPUMP_ID.toString() + '">' + SYSTEM_USER_UNIPUMP_NAME + '</option>');
                users.push({
                    Id: SYSTEM_USER_PTS_ID,
                    Login: SYSTEM_USER_PTS_NAME
                });
                $('#rpUserSelect').append('<option value="' + SYSTEM_USER_PTS_ID.toString() + '">' + SYSTEM_USER_PTS_NAME + '</option>');
                
                if ($('#rpUsersList').hasClass("d-none") == true)
                    $('#rpUsersList').removeClass("d-none");
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
});

//-------------------------------------------------------------------------------------
// Get pump nozzle product name
function getProductNameByPumpNozzleNumber(pumpNumber, nozzleNumber) {

    var nozzleName = nozzleNumber;

    if (fuelGrades != null ||
        fuelGrades.length > 0 ||
        pumpNozzles != null ||
        pumpNozzles.length > 0) {
        pumpNozzles.forEach(function(pumpNozzleItem) {
            if (parseInt(pumpNozzleItem.PumpId, 10) == pumpNumber) {
                fuelGrades.forEach(function(fuelGradeItem) {
                    if (pumpNozzleItem.FuelGradeIds != undefined &&
                        pumpNozzleItem.FuelGradeIds.length >= nozzleNumber) {
                        if (pumpNozzleItem.FuelGradeIds[nozzleNumber - 1] != undefined &&
                            parseInt(fuelGradeItem.Id, 10) == parseInt(pumpNozzleItem.FuelGradeIds[nozzleNumber - 1], 10)) {
                            nozzleName = fuelGradeItem.Name;
                        }
                    }
                });
            }
        });
    }

    return nozzleName;
}

//-------------------------------------------------------------------------------------
// Get users configuration and report data
$('#rpGenerateReportPumpsButton').click(function() {
    var nozzleFuelGrade;
    var reportTitle = "";

    // Clean arrays
    commands = [];

    // Date/time start variables
    var dateTimeStart = "20" + 
                        $('#rpDateTimeStartInput').val().split(' ')[0].split('.')[0] + 
                        "-" + 
                        $('#rpDateTimeStartInput').val().split(' ')[0].split('.')[1] +
                        "-" +
                        $('#rpDateTimeStartInput').val().split(' ')[0].split('.')[2] +
                        "T" +
                        $('#rpDateTimeStartInput').val().split(' ')[1].split(':')[0] +
                        ":" +
                        $('#rpDateTimeStartInput').val().split(' ')[1].split(':')[1] +
                        ":" +
                        $('#rpDateTimeStartInput').val().split(' ')[1].split(':')[2];

    // Date/time end variables
    var dateTimeEnd = "20" + 
                      $('#rpDateTimeEndInput').val().split(' ')[0].split('.')[0] + 
                      "-" + 
                      $('#rpDateTimeEndInput').val().split(' ')[0].split('.')[1] +
                      "-" +
                      $('#rpDateTimeEndInput').val().split(' ')[0].split('.')[2] +
                      "T" +
                      $('#rpDateTimeEndInput').val().split(' ')[1].split(':')[0] +
                      ":" +
                      $('#rpDateTimeEndInput').val().split(' ')[1].split(':')[1] +
                      ":" +
                      $('#rpDateTimeEndInput').val().split(' ')[1].split(':')[2];

    // Validate
    var startDateTime = new Date(dateTimeStart);
    if ((startDateTime instanceof Date) == false || isNaN(startDateTime.valueOf()) == true) {
        showMessage("Start date/time set incorrectly!");
        return;
    }
    var endDateTime = new Date(dateTimeEnd);
    if ((endDateTime instanceof Date) == false || isNaN(endDateTime.valueOf()) == true) {
        showMessage("End date/time set incorrectly!");
        return;
    }

    // Compare datetimes
    if (startDateTime > endDateTime) {
        showMessage("Start datetime is later than end datetime!");
        return;
    }

    reportData = [];
    if (pumpsReportingDatatable != null)
        pumpsReportingDatatable.destroy();

    pumpNozzlesReportData = [];
    if (pumpNozzlesReportingDatatable != null)
        pumpNozzlesReportingDatatable.destroy();

    // Get firmware information to get list of protocols supported and get pumps configuration
    commands.push({
        function: ReportGetPumpTransactions,
        arguments: [
            $('#rpDeviceNumberSelect').val(),
            dateTimeStart, 
            dateTimeEnd
        ]
    });
    request = createComplexRequest(commands, true, 300000);

    // Process response
    request.done(function(response) {
        if (responseNull != true) {

            // Report data
            data = response.Packets.filter(Packet => Packet.Type == "ReportPumpTransactions");
            if (data != null &&
                data != undefined &&
                data.length > 0) {
                data = data[0].Data;
                if (data != undefined) {

                    if (data.length > 0) {
                        
                        counter = 0;
                        counter2 = 0;
                        data.forEach(function(reportDataItem) {
                            // Filter fuel grade
                            nozzleFuelGrade = getProductNameByPumpNozzleNumber(parseInt(reportDataItem.Pump, 10), parseInt(reportDataItem.Nozzle, 10));
                            if ($('#rpFuelGradeSelect option:selected').val() != 0 &&
                                $('#rpFuelGradeSelect option:selected').text() != nozzleFuelGrade)
                                return;

                            // Filter user
                            if ($('#rpUserSelect option:selected').val() != 0) {
                                if (parseInt(reportDataItem.UserId, 10) == 0)
                                    return;

                                if (users.filter(User => parseInt(User.Id, 10) == parseInt(reportDataItem.UserId, 10)).length == 0)
                                    return;

                                if ($('#rpUserSelect option:selected').text() != users.filter(User => parseInt(User.Id, 10) == parseInt(reportDataItem.UserId, 10))[0].Login)
                                    return;
                            }

                            // Add report objects
                            counter++;
                            reportData.push({
                                DT_RowId: counter.toString(),
                                Line: counter.toString(),
                                DatetimeStart: reportDataItem.DateTimeStart.replace(/-/g, ".").replace(/T/g, " "),
                                DatetimeEnd: reportDataItem.DateTime.replace(/-/g, ".").replace(/T/g, " "),
                                Pump: reportDataItem.Pump,
                                Nozzle: nozzleFuelGrade,
                                Transaction: reportDataItem.Transaction,
                                Volume: reportDataItem.Volume.toFixed(SYSTEM_VOLUME_DECIMAL_DIGITS),
                                TCVolume: (reportDataItem.TCVolume != undefined) ? reportDataItem.TCVolume.toFixed(SYSTEM_VOLUME_DECIMAL_DIGITS) : "-",
                                Amount: reportDataItem.Amount.toFixed(SYSTEM_AMOUNT_DECIMAL_DIGITS),
                                TotalVolume: reportDataItem.TotalVolume.toFixed(SYSTEM_VOLUME_TOTAL_DECIMAL_DIGITS),
                                TotalAmount: reportDataItem.TotalAmount.toFixed(SYSTEM_AMOUNT_TOTAL_DECIMAL_DIGITS),
                                Price: reportDataItem.Price.toFixed(SYSTEM_PRICE_DECIMAL_DIGITS),
                                User: (parseInt(reportDataItem.UserId, 10) > 0) ? 
                                        ((users.filter(User => parseInt(User.Id, 10) == parseInt(reportDataItem.UserId, 10)).length > 0) ? 
                                            users.filter(User => parseInt(User.Id, 10) == parseInt(reportDataItem.UserId, 10))[0].Login : "") : 
                                        ""
                            });

                            // Prepare pump nozzles datatable
                            pumpNozzlesReportDataItem = pumpNozzlesReportData.find(x => x.Pump === reportDataItem.Pump &&
                                                                                        x.Nozzle == nozzleFuelGrade);
                            if (pumpNozzlesReportDataItem != undefined) {
                                pumpNozzlesReportDataItem.SummaryFilledVolume = (parseFloat(pumpNozzlesReportDataItem.SummaryFilledVolume) + parseFloat(reportDataItem.Volume)).toFixed(SYSTEM_VOLUME_DECIMAL_DIGITS);
                                pumpNozzlesReportDataItem.SummaryFilledAmount = (parseFloat(pumpNozzlesReportDataItem.SummaryFilledAmount) + parseFloat(reportDataItem.Amount)).toFixed(SYSTEM_AMOUNT_DECIMAL_DIGITS);
                                pumpNozzlesReportDataItem.TotalVolumeEnd = reportDataItem.TotalVolume.toFixed(SYSTEM_VOLUME_TOTAL_DECIMAL_DIGITS);
                                pumpNozzlesReportDataItem.TotalVolumeDifference = (parseFloat(pumpNozzlesReportDataItem.TotalVolumeEnd) - parseFloat(pumpNozzlesReportDataItem.TotalVolumeStart)).toFixed(SYSTEM_VOLUME_TOTAL_DECIMAL_DIGITS);
                                pumpNozzlesReportDataItem.TotalAmountEnd = reportDataItem.TotalAmount.toFixed(SYSTEM_AMOUNT_TOTAL_DECIMAL_DIGITS);
                                pumpNozzlesReportDataItem.TotalAmountDifference = (parseFloat(pumpNozzlesReportDataItem.TotalAmountEnd) - parseFloat(pumpNozzlesReportDataItem.TotalAmountStart)).toFixed(SYSTEM_AMOUNT_TOTAL_DECIMAL_DIGITS);
                            } else {
                                counter2++;
                                pumpNozzlesReportData.push({
                                    DT_RowId: counter2.toString(),
                                    Line: counter2.toString(),
                                    Pump: reportDataItem.Pump,
                                    Nozzle: nozzleFuelGrade,
                                    SummaryFilledVolume: reportDataItem.Volume.toFixed(SYSTEM_VOLUME_DECIMAL_DIGITS),
                                    SummaryFilledAmount: reportDataItem.Amount.toFixed(SYSTEM_AMOUNT_DECIMAL_DIGITS),
                                    TotalVolumeStart: (parseFloat(reportDataItem.TotalVolume) > 0) ? (parseFloat(reportDataItem.TotalVolume) - parseFloat(reportDataItem.Volume)).toFixed(SYSTEM_VOLUME_TOTAL_DECIMAL_DIGITS) : reportDataItem.TotalVolume.toFixed(SYSTEM_AMOUNT_TOTAL_DECIMAL_DIGITS),
                                    TotalVolumeEnd: reportDataItem.TotalVolume.toFixed(SYSTEM_VOLUME_TOTAL_DECIMAL_DIGITS),
                                    TotalVolumeDifference: (parseFloat(reportDataItem.TotalVolume) - parseFloat(reportDataItem.TotalVolume)).toFixed(SYSTEM_VOLUME_TOTAL_DECIMAL_DIGITS),
                                    TotalAmountStart: (parseFloat(reportDataItem.TotalAmount) > 0) ? (parseFloat(reportDataItem.TotalAmount) - parseFloat(reportDataItem.Amount)).toFixed(SYSTEM_AMOUNT_TOTAL_DECIMAL_DIGITS) : reportDataItem.TotalAmount.toFixed(SYSTEM_AMOUNT_TOTAL_DECIMAL_DIGITS),
                                    TotalAmountEnd: reportDataItem.TotalAmount.toFixed(SYSTEM_AMOUNT_TOTAL_DECIMAL_DIGITS),
                                    TotalAmountDifference: (parseFloat(reportDataItem.TotalAmount) - parseFloat(reportDataItem.TotalAmount)).toFixed(SYSTEM_AMOUNT_TOTAL_DECIMAL_DIGITS)
                                });
                            }
                        });

                        reportTitle = " for";

                        if ($('#rpDeviceNumberSelect').val() != 0)
                            reportTitle += " pump " + $('#rpDeviceNumberSelect').val();
                        else
                            reportTitle += " all pumps";

                        reportTitle += ' from ' + $('#rpDateTimeStartInput').val() + ' till ' + $('#rpDateTimeEndInput').val();

                        if ($('#rpFuelGradeSelect option:selected').val() != 0)
                            reportTitle += ', fuel grade "' + $('#rpFuelGradeSelect option:selected').text() + '"';
                            
                        if ($('#rpUserSelect option:selected').val() != 0)
                            reportTitle += ', user "' + $('#rpUserSelect option:selected').text() + '"';

                        document.title = 'Pumps transactions report' + reportTitle;

                        $("#trpPumpsTransactionsReportHeader").html("Pumps transactions report" + reportTitle);
                    }
                }
            }
        }
    
        // Display the table
        if ($('#prpPumpsTable').hasClass('d-none') == true)
            $('#prpPumpsTable').removeClass('d-none');
    
        // Fill in pumps reporting table
        pumpsReportingDatatable = $('#prpPumps').DataTable({
            "pageLength": 10,
            "ordering": true,
            responsive: true,
            select: true,
            data: reportData,
            columns: [
                { data: 'Line' },
                { data: 'DatetimeStart' },
                { data: 'DatetimeEnd' },
                { data: 'Pump' },
                { data: 'Nozzle' },
                { data: 'Transaction' },
                { data: 'Price' },
                { data: 'Volume' },
                { data: 'Amount' },
                { data: 'TotalVolume' },
                { data: 'TotalAmount' },
                { data: 'User' }
            ],
            columnDefs: [
                {
                    targets: 0,
                    className: 'dt-body-center',
                    "width": '5%'
                },
                {
                    targets: 1,
                    className: 'dt-body-center',
                    "width": '11%'
                },
                {
                    targets: 2,
                    className: 'dt-body-center',
                    "width": '11%'
                },
                {
                    targets: 3,
                    className: 'dt-body-center',
                    "width": '5%'
                },
                {
                    targets: 4,
                    className: 'dt-body-center',
                    "width": '5%'
                },
                {
                    targets: 5,
                    className: 'dt-body-center',
                    "width": '5%'
                },
                {
                    targets: 6,
                    className: 'dt-body-center',
                    "width": '8%'
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
                    "width": '10%'
                }
            ],
            dom: '<"clearfix"B>lfrtip',
            buttons: [
                'copyHtml5',
                {
                    extend: 'excelHtml5',
                    footer: true
                },
                'csvHtml5',
                'print'
            ],
            "footerCallback": function (row, data, start, end, display) {
                var api = this.api(), data;
        
                // Total volume over all pages
                var totalVolume = api.column(7).data().reduce(function (a, b) {
                    return (parseFloat(a) + parseFloat(b)).toFixed(SYSTEM_VOLUME_DECIMAL_DIGITS);
                }, 0);
        
                // Total amount over all pages
                var totalAmount = api.column(8).data().reduce(function (a, b) {
                    return (parseFloat(a) + parseFloat(b)).toFixed(SYSTEM_AMOUNT_DECIMAL_DIGITS);
                }, 0);
        
                // Update footer
                $(api.column(7).footer()).html(totalVolume);
                $(api.column(8).footer()).html(totalAmount);
            }
        });
    
        // Fill in pumps reporting table
        if ($("input[id='rpPumpNozzlesTotalsRadio1']:checked").val()) {
    
            // Display the pump nozzles table
            if ($('#prpPumpNozzlesTable').hasClass('d-none') == true)
                $('#prpPumpNozzlesTable').removeClass('d-none');

            // Hide the pump nozzles totals table
            if ($('#prpPumpNozzlesTotalsTable').hasClass('d-none') == false)
                $('#prpPumpNozzlesTotalsTable').addClass('d-none');
            
            pumpNozzlesReportingDatatable = $('#prpPumpNozzles').DataTable({
                "pageLength": parseInt(pumpNozzlesReportData.length, 10),
                "ordering": true,
                responsive: true,
                select: true,
                data: pumpNozzlesReportData,
                columns: [
                    { data: 'Line' },
                    { data: 'Pump' },
                    { data: 'Nozzle' },
                    { data: 'SummaryFilledVolume' },
                    { data: 'SummaryFilledAmount' }
                ],
                columnDefs: [
                    {
                        targets: 0,
                        className: 'dt-body-center',
                        "width": '20%'
                    },
                    {
                        targets: 1,
                        className: 'dt-body-center',
                        "width": '20%'
                    },
                    {
                        targets: 2,
                        className: 'dt-body-center',
                        "width": '20%'
                    },
                    {
                        targets: 3,
                        className: 'dt-body-center',
                        "width": '20%'
                    },
                    {
                        targets: 4,
                        className: 'dt-body-center',
                        "width": '20%'
                    }
                ],
                dom: '<"clearfix"B>frt',
                buttons: [
                    'copyHtml5',
                    {
                        extend: 'excelHtml5',
                        footer: true
                    },
                    'csvHtml5',
                    'print'
                ],
                "footerCallback": function (row, data, start, end, display) {
                    var api = this.api(), data;
            
                    // Total volume over all pages
                    var totalVolume = api.column(3).data().reduce(function (a, b) {
                        return (parseFloat(a) + parseFloat(b)).toFixed(SYSTEM_VOLUME_DECIMAL_DIGITS);
                    }, 0);
            
                    // Total amount over all pages
                    var totalAmount = api.column(4).data().reduce(function (a, b) {
                        return (parseFloat(a) + parseFloat(b)).toFixed(SYSTEM_AMOUNT_DECIMAL_DIGITS);
                    }, 0);
            
                    // Update footer
                    $(api.column(3).footer()).html(totalVolume);
                    $(api.column(4).footer()).html(totalAmount);
                }
            });

            $("#trpPumpNozzlesReportHeader").html("Pumps nozzles summary report" + reportTitle);

        } else if ($("input[id='rpPumpNozzlesTotalsRadio2']:checked").val()) {
    
            // Hide the pump nozzles table
            if ($('#prpPumpNozzlesTotalsTable').hasClass('d-none') == true)
                $('#prpPumpNozzlesTotalsTable').removeClass('d-none');

            // Display the pump nozzles totals table
            if ($('#prpPumpNozzlesTable').hasClass('d-none') == false)
                $('#prpPumpNozzlesTable').addClass('d-none');

            pumpNozzlesReportingDatatable = $('#prpPumpNozzlesTotals').DataTable({
                "pageLength": parseInt(pumpNozzlesReportData.length, 10),
                "ordering": true,
                responsive: true,
                select: true,
                data: pumpNozzlesReportData,
                columns: [
                    { data: 'Line' },
                    { data: 'Pump' },
                    { data: 'Nozzle' },
                    { data: 'SummaryFilledVolume' },
                    { data: 'SummaryFilledAmount' },
                    { data: 'TotalVolumeStart' },
                    { data: 'TotalVolumeEnd' },
                    { data: 'TotalVolumeDifference' },
                    { data: 'TotalAmountStart' },
                    { data: 'TotalAmountEnd' },
                    { data: 'TotalAmountDifference' }
                ],
                columnDefs: [
                    {
                        targets: 0,
                        className: 'dt-body-center',
                        "width": '5%'
                    },
                    {
                        targets: 1,
                        className: 'dt-body-center',
                        "width": '5%'
                    },
                    {
                        targets: 2,
                        className: 'dt-body-center',
                        "width": '10%'
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
                        "width": '10%'
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
                    }
                ],
                dom: '<"clearfix"B>frt',
                buttons: [
                    'copyHtml5',
                    {
                        extend: 'excelHtml5',
                        footer: true
                    },
                    'csvHtml5',
                    'print'
                ],
                "footerCallback": function (row, data, start, end, display) {
                    var api = this.api(), data;
            
                    // Total volume over all pages
                    var totalVolume = api.column(3).data().reduce(function (a, b) {
                        return (parseFloat(a) + parseFloat(b)).toFixed(SYSTEM_VOLUME_DECIMAL_DIGITS);
                    }, 0);
            
                    // Total amount over all pages
                    var totalAmount = api.column(4).data().reduce(function (a, b) {
                        return (parseFloat(a) + parseFloat(b)).toFixed(SYSTEM_AMOUNT_DECIMAL_DIGITS);
                    }, 0);
            
                    // Update footer
                    $(api.column(3).footer()).html(totalVolume);
                    $(api.column(4).footer()).html(totalAmount);
                }
            });

            $("#trpPumpNozzlesTotalsReportHeader").html("Pumps nozzles summary report" + reportTitle);
        }
    });
});

//-------------------------------------------------------------------------------------