//-------------------------------------------------------------------------------------
//------------------------------------ Constants --------------------------------------
//-------------------------------------------------------------------------------------

var TOTAL_PUMP_PORTS = 4;
var TOTAL_PUMPS = 50;
var TOTAL_PROBE_PORTS = 3;
var TOTAL_PROBES = 50;

ParametersTypeEnum = {
    PARAMETERS_TYPE_NOT_SELECTED : "-1",
    PARAMETERS_TYPE_PTS1 : "0",
    PARAMETERS_TYPE_PTS2 : "1",
    PARAMETERS_TYPE_PUMP : "2",
    PARAMETERS_TYPE_PROBE : "3",
    PARAMETERS_TYPE_PUMP_COMMON : "4",
    PARAMETERS_TYPE_PROBE_COMMON : "5"
};

ParameterInputTypeEnum = {
    PARAMETER_INPUT_TYPE_BOOL : "0",
    PARAMETER_INPUT_TYPE_ENUM : "1",
    PARAMETER_INPUT_TYPE_INT : "2",
    PARAMETER_INPUT_TYPE_FLOAT : "3"
};

var TOTAL_FUEL_GRADES = 10;
var TOTAL_FUEL_GRADE_CODE = 255;
var TOTAL_FUEL_GRADE_NAME = 10;

var TOTAL_TANKS = TOTAL_PROBES;

var TOTAL_USERS = 10;
var TOTAL_USER_LOGIN_LENGTH = 10;
var TOTAL_USER_PASSWORD_LENGTH = 10;

var responseNull = false;

//-------------------------------------------------------------------------------------
//-------------------------------------- Timers ---------------------------------------
//-------------------------------------------------------------------------------------

var timerPumpsPollingId = 0;
var timerProbesPollingId = 0;
var timerDiagnostics = 0;
var timerShowMessageId = 0;

//-------------------------------------------------------------------------------------
//--------------------- jsonPTS communication protocol requests -----------------------
//-------------------------------------------------------------------------------------

function createComplexRequest(commands, showLoader = true, timeoutValue = 10000) {
    
    // Form request
    var request = new Object();
    request.Protocol = "jsonPTS";
    request.Packets = new Array();
    
    commands.forEach(function(command, counter) {
        var packet = new Object();
        packet.Id = counter + 1;
        packet.Type = command.function.name;
        packet.Data = window[command.function.name].apply(this, command.arguments);
        request.Packets.push(packet);
    });

    // Convert to json format
    return sendRequest(JSON.stringify(request), showLoader, timeoutValue);
}

//-------------------------------------------------------------------------------------
function GetConfigurationIdentifier() {
    var data = new Object();
    return data;
}

//-------------------------------------------------------------------------------------
function GetDateTime() {
    return;
}

//-------------------------------------------------------------------------------------
function SetDateTime(dateTime) {
    var data = new Object();

    data.DateTime = dateTime;

    return data;
}

//-------------------------------------------------------------------------------------
function GetUserInformation() {
    return;
}

//-------------------------------------------------------------------------------------
function GetFirmwareInformation() {
    return;
}

//-------------------------------------------------------------------------------------
function GetBatteryVoltage() {
    return;
}

//-------------------------------------------------------------------------------------
function GetUniqueIdentifier() {
    return;
}

//-------------------------------------------------------------------------------------
function GetSdInformation() {
    return;
}

//-------------------------------------------------------------------------------------
function FileDelete(filename) {
    var data = new Object();

    data.Name = filename;
    console.log("In FileDelete function, filename = " + filename);

    return data;
}

//-------------------------------------------------------------------------------------
function Logout() {
    return;
}

//-------------------------------------------------------------------------------------
function Restart() {
    return;
}

//-------------------------------------------------------------------------------------
function BackupConfiguration() {
    return;
}

//-------------------------------------------------------------------------------------
function RestoreConfiguration() {
    return;
}

//-------------------------------------------------------------------------------------
function GetPtsNetworkSettings() {
    return;
}

//-------------------------------------------------------------------------------------
function SetPtsNetworkSettings(IpAddress1, IpAddress2, IpAddress3, IpAddress4, 
                            NetMask1, NetMask2, NetMask3, NetMask4, 
                            Gateway1, Gateway2, Gateway3, Gateway4, 
                            HttpPort, HttpsPort, 
                            Dns11, Dns12, Dns13, Dns14,
                            Dns21, Dns22, Dns23, Dns24) {
    var data = new Object();

    data.IpAddress = new Array();
    data.IpAddress.push(parseInt(IpAddress1, 10));
    data.IpAddress.push(parseInt(IpAddress2, 10));
    data.IpAddress.push(parseInt(IpAddress3, 10));
    data.IpAddress.push(parseInt(IpAddress4, 10));

    data.NetMask = new Array();
    data.NetMask.push(parseInt(NetMask1, 10));
    data.NetMask.push(parseInt(NetMask2, 10));
    data.NetMask.push(parseInt(NetMask3, 10));
    data.NetMask.push(parseInt(NetMask4, 10));

    data.Gateway = new Array();
    data.Gateway.push(parseInt(Gateway1, 10));
    data.Gateway.push(parseInt(Gateway2, 10));
    data.Gateway.push(parseInt(Gateway3, 10));
    data.Gateway.push(parseInt(Gateway4, 10));
    
    data.HttpPort = parseInt(HttpPort, 10);
    data.HttpsPort = parseInt(HttpsPort, 10);

    data.Dns1 = new Array();
    data.Dns1.push(parseInt(Dns11, 10));
    data.Dns1.push(parseInt(Dns12, 10));
    data.Dns1.push(parseInt(Dns13, 10));
    data.Dns1.push(parseInt(Dns14, 10));

    data.Dns2 = new Array();
    data.Dns2.push(parseInt(Dns21, 10));
    data.Dns2.push(parseInt(Dns22, 10));
    data.Dns2.push(parseInt(Dns23, 10));
    data.Dns2.push(parseInt(Dns24, 10));

    return data;
}

//-------------------------------------------------------------------------------------
function GetRemoteServerNetworkSettings() {
    return;
}

//-------------------------------------------------------------------------------------
function SetRemoteServerNetworkSettings(IpAddress1, IpAddress2, IpAddress3, IpAddress4, 
                            NetMask1, NetMask2, NetMask3, NetMask4, 
                            Gateway1, Gateway2, Gateway3, Gateway4, 
                            Port) {
    var data = new Object();

    data.IpAddress = new Array();
    data.IpAddress.push(parseInt(IpAddress1, 10));
    data.IpAddress.push(parseInt(IpAddress2, 10));
    data.IpAddress.push(parseInt(IpAddress3), 10);
    data.IpAddress.push(parseInt(IpAddress4, 10));

    data.NetMask = new Array();
    data.NetMask.push(parseInt(NetMask1, 10));
    data.NetMask.push(parseInt(NetMask2, 10));
    data.NetMask.push(parseInt(NetMask3, 10));
    data.NetMask.push(parseInt(NetMask4, 10));

    data.Gateway = new Array();
    data.Gateway.push(parseInt(Gateway1, 10));
    data.Gateway.push(parseInt(Gateway2, 10));
    data.Gateway.push(parseInt(Gateway3, 10));
    data.Gateway.push(parseInt(Gateway4, 10));
    
    data.Port = parseInt(Port, 10);

    return data;
}

//-------------------------------------------------------------------------------------
function GetPumpsConfiguration() {
    return;
}

//-------------------------------------------------------------------------------------
function SetPumpsConfiguration(pumpPortsData, pumpsData) {
    var tmpCounter = 0;
    var data = new Object();

    data.Ports = new Array();
    
    // Fill in pump ports
    for (tmpCounter = 0; tmpCounter < pumpPortsData.length; tmpCounter++) {
        if (pumpPortsData[tmpCounter].communicationProtocol.split('.')[0] != "0" &&
            pumpPortsData[tmpCounter].baudRate.split('.')[0] != "0") {
            data.Ports.push({
                Id: parseInt(pumpPortsData[tmpCounter].pumpPort, 10),
                Protocol: parseInt(pumpPortsData[tmpCounter].communicationProtocol.split('.')[0], 10),
                BaudRate: parseInt(pumpPortsData[tmpCounter].baudRate.split('.')[0], 10)
            });
        }
    }
    
    data.Pumps = new Array();

    // Fill in pumps
    for (tmpCounter = 0; tmpCounter < pumpsData.length; tmpCounter++) {
        if (pumpsData[tmpCounter].pumpPort.split(' ')[0] != "0" &&
            pumpsData[tmpCounter].communicationAddress.split(' ')[0] != "0") {
            data.Pumps.push({
                Id: parseInt(pumpsData[tmpCounter].pump, 10),
                Port: parseInt(pumpsData[tmpCounter].pumpPort.split(' ')[0], 10),
                Address: parseInt(pumpsData[tmpCounter].communicationAddress.split(' ')[0], 10)
            });
        }
    }

    return data;
}

//-------------------------------------------------------------------------------------
function GetProbesConfiguration() {
    return;
}

//-------------------------------------------------------------------------------------
function SetProbesConfiguration(probePortsData, probesData) {
    var tmpCounter = 0;    
    var data = new Object();

    data.Ports = new Array();
    
    // Fill in probe ports
    if (probePortsData[0].communicationProtocol.split('.')[0] != "0" &&
        probePortsData[0].baudRate.split('.')[0] != "0") {
        data.Ports.push({
            Id: "DISP",
            Protocol: parseInt(probePortsData[0].communicationProtocol.split('.')[0], 10),
            BaudRate: parseInt(probePortsData[0].baudRate.split('.')[0], 10)
        });
    }
    if (probePortsData[1].communicationProtocol.split('.')[0] != "0" &&
        probePortsData[1].baudRate.split('.')[0] != "0") {
        data.Ports.push({
            Id: "LOG",
            Protocol: parseInt(probePortsData[1].communicationProtocol.split('.')[0], 10),
            BaudRate: parseInt(probePortsData[1].baudRate.split('.')[0], 10)
        });
    }
    if (probePortsData[2].communicationProtocol.split('.')[0] != "0" &&
        probePortsData[2].baudRate.split('.')[0] != "0") {
        data.Ports.push({
            Id: "USER",
            Protocol: parseInt(probePortsData[2].communicationProtocol.split('.')[0], 10),
            BaudRate: parseInt(probePortsData[2].baudRate.split('.')[0], 10)
        });
    }
    
    data.Probes = new Array();

    // Fill in probes
    for (tmpCounter = 0; tmpCounter < probesData.length; tmpCounter++) {
        if (probesData[tmpCounter].probePort.split(' ')[0] != "0" &&
            probesData[tmpCounter].communicationAddress.split(' ')[0] != "0") {
            if (probesData[tmpCounter].probePort == "DISP") {
                data.Probes.push({
                    Id: parseInt(probesData[tmpCounter].probe, 10),
                    Port: "DISP",
                    Address: parseInt(probesData[tmpCounter].communicationAddress.split(' ')[0], 10)
                });
            } else if (probesData[tmpCounter].probePort == "LOG") {
                data.Probes.push({
                    Id: parseInt(probesData[tmpCounter].probe, 10),
                    Port: "LOG",
                    Address: parseInt(probesData[tmpCounter].communicationAddress.split(' ')[0], 10)
                });
            } else if (probesData[tmpCounter].probePort == "USER") {
                data.Probes.push({
                    Id: parseInt(probesData[tmpCounter].probe, 10),
                    Port: "USER",
                    Address: parseInt(probesData[tmpCounter].communicationAddress.split(' ')[0], 10)
                });
            } else {
                data.Probes.push({
                    Id: parseInt(probesData[tmpCounter].probe, 10),
                    Port: "0",
                    Address: parseInt(probesData[tmpCounter].communicationAddress.split(' ')[0], 10)
                });
            }
        }
    }

    return data;
}

//-------------------------------------------------------------------------------------
function GetFuelGradesConfiguration() {
    return;
}

//-------------------------------------------------------------------------------------
function SetFuelGradesConfiguration(fuelGradesData) {
    var tmpCounter = 0;
    var data = new Object();

    data.FuelGrades = new Array();
    
    // Fill in fuel grades
    for (tmpCounter = 0; tmpCounter < fuelGradesData.length; tmpCounter++) {
        if (fuelGradesData[tmpCounter].name.length > 0 && fuelGradesData[tmpCounter].price != 0) {
            data.FuelGrades.push({
                Id: parseInt(fuelGradesData[tmpCounter].fuelGradeId, 10),
                Name: fuelGradesData[tmpCounter].name.toString(),
                Price: parseFloat(fuelGradesData[tmpCounter].price),
                ExpansionCoefficient: parseFloat(fuelGradesData[tmpCounter].expansionCoefficient)
            });
        }
    }

    return data;
}

//-------------------------------------------------------------------------------------
function GetPumpNozzlesConfiguration() {
    return;
}

//-------------------------------------------------------------------------------------
function SetPumpNozzlesConfiguration(pumpNozzlesData) {
    var tmpCounter = 0;
    var data = new Object();

    data.PumpNozzles = new Array();
    
    // Fill in pump nozzles
    for (tmpCounter = 0; tmpCounter < pumpNozzlesData.length; tmpCounter++) {
        if (pumpNozzlesData[tmpCounter].pumpId > 0) {

            data.PumpNozzles.push({
                PumpId: pumpNozzlesData[tmpCounter].pumpId,
                FuelGradeIds: [
                    (pumpNozzlesData[tmpCounter].fuelGradeIdNozzle1.split(' (').length > 1 && 
                    pumpNozzlesData[tmpCounter].fuelGradeIdNozzle1.split(' (')[0].split('Grade ').length > 1 &&
                    parseInt(pumpNozzlesData[tmpCounter].fuelGradeIdNozzle1.split(' (')[0].split('Grade ')[1], 10) >= 0 &&
                    parseInt(pumpNozzlesData[tmpCounter].fuelGradeIdNozzle1.split(' (')[0].split('Grade ')[1], 10) <= TOTAL_FUEL_GRADES) ? pumpNozzlesData[tmpCounter].fuelGradeIdNozzle1.split(' (')[0].split('Grade ')[1] : "0",
                    
                    (pumpNozzlesData[tmpCounter].fuelGradeIdNozzle2.split(' (').length > 1 && 
                    pumpNozzlesData[tmpCounter].fuelGradeIdNozzle2.split(' (')[0].split('Grade ').length > 1 &&
                    parseInt(pumpNozzlesData[tmpCounter].fuelGradeIdNozzle2.split(' (')[0].split('Grade ')[1], 10) >= 0 &&
                    parseInt(pumpNozzlesData[tmpCounter].fuelGradeIdNozzle2.split(' (')[0].split('Grade ')[1], 10) <= TOTAL_FUEL_GRADES) ? pumpNozzlesData[tmpCounter].fuelGradeIdNozzle2.split(' (')[0].split('Grade ')[1] : "0",
                    
                    (pumpNozzlesData[tmpCounter].fuelGradeIdNozzle3.split(' (').length > 1 && 
                    pumpNozzlesData[tmpCounter].fuelGradeIdNozzle3.split(' (')[0].split('Grade ').length > 1 &&
                    parseInt(pumpNozzlesData[tmpCounter].fuelGradeIdNozzle3.split(' (')[0].split('Grade ')[1], 10) >= 0 &&
                    parseInt(pumpNozzlesData[tmpCounter].fuelGradeIdNozzle3.split(' (')[0].split('Grade ')[1], 10) <= TOTAL_FUEL_GRADES) ? pumpNozzlesData[tmpCounter].fuelGradeIdNozzle3.split(' (')[0].split('Grade ')[1] : "0",
                    
                    (pumpNozzlesData[tmpCounter].fuelGradeIdNozzle4.split(' (').length > 1 && 
                    pumpNozzlesData[tmpCounter].fuelGradeIdNozzle4.split(' (')[0].split('Grade ').length > 1 &&
                    parseInt(pumpNozzlesData[tmpCounter].fuelGradeIdNozzle4.split(' (')[0].split('Grade ')[1], 10) >= 0 &&
                    parseInt(pumpNozzlesData[tmpCounter].fuelGradeIdNozzle4.split(' (')[0].split('Grade ')[1], 10) <= TOTAL_FUEL_GRADES) ? pumpNozzlesData[tmpCounter].fuelGradeIdNozzle4.split(' (')[0].split('Grade ')[1] : "0",
                    
                    (pumpNozzlesData[tmpCounter].fuelGradeIdNozzle5.split(' (').length > 1 && 
                    pumpNozzlesData[tmpCounter].fuelGradeIdNozzle5.split(' (')[0].split('Grade ').length > 1 &&
                    parseInt(pumpNozzlesData[tmpCounter].fuelGradeIdNozzle5.split(' (')[0].split('Grade ')[1], 10) >= 0 &&
                    parseInt(pumpNozzlesData[tmpCounter].fuelGradeIdNozzle5.split(' (')[0].split('Grade ')[1], 10) <= TOTAL_FUEL_GRADES) ? pumpNozzlesData[tmpCounter].fuelGradeIdNozzle5.split(' (')[0].split('Grade ')[1] : "0",
                    
                    (pumpNozzlesData[tmpCounter].fuelGradeIdNozzle6.split(' (').length > 1 && 
                    pumpNozzlesData[tmpCounter].fuelGradeIdNozzle6.split(' (')[0].split('Grade ').length > 1 &&
                    parseInt(pumpNozzlesData[tmpCounter].fuelGradeIdNozzle6.split(' (')[0].split('Grade ')[1], 10) >= 0 &&
                    parseInt(pumpNozzlesData[tmpCounter].fuelGradeIdNozzle6.split(' (')[0].split('Grade ')[1], 10) <= TOTAL_FUEL_GRADES) ? pumpNozzlesData[tmpCounter].fuelGradeIdNozzle6.split(' (')[0].split('Grade ')[1] : "0"
                ],
                TankIds: [
                    (pumpNozzlesData[tmpCounter].tankIdNozzle1 &&
                    pumpNozzlesData[tmpCounter].tankIdNozzle1.split(' (').length > 1 && 
                    pumpNozzlesData[tmpCounter].tankIdNozzle1.split(' (')[0].split('Tank ').length > 1 &&
                    parseInt(pumpNozzlesData[tmpCounter].tankIdNozzle1.split(' (')[0].split('Tank ')[1], 10) >= 0 &&
                    parseInt(pumpNozzlesData[tmpCounter].tankIdNozzle1.split(' (')[0].split('Tank ')[1], 10) <= TOTAL_TANKS) ? pumpNozzlesData[tmpCounter].tankIdNozzle1.split(' (')[0].split('Tank ')[1] : "0",
                    
                    (pumpNozzlesData[tmpCounter].tankIdNozzle2 &&
                    pumpNozzlesData[tmpCounter].tankIdNozzle2.split(' (').length > 1 && 
                    pumpNozzlesData[tmpCounter].tankIdNozzle2.split(' (')[0].split('Tank ').length > 1 &&
                    parseInt(pumpNozzlesData[tmpCounter].tankIdNozzle2.split(' (')[0].split('Tank ')[1], 10) >= 0 &&
                    parseInt(pumpNozzlesData[tmpCounter].tankIdNozzle2.split(' (')[0].split('Tank ')[1], 10) <= TOTAL_TANKS) ? pumpNozzlesData[tmpCounter].tankIdNozzle2.split(' (')[0].split('Tank ')[1] : "0",

                    (pumpNozzlesData[tmpCounter].tankIdNozzle3 &&
                    pumpNozzlesData[tmpCounter].tankIdNozzle3.split(' (').length > 1 && 
                    pumpNozzlesData[tmpCounter].tankIdNozzle3.split(' (')[0].split('Tank ').length > 1 &&
                    parseInt(pumpNozzlesData[tmpCounter].tankIdNozzle3.split(' (')[0].split('Tank ')[1], 10) >= 0 &&
                    parseInt(pumpNozzlesData[tmpCounter].tankIdNozzle3.split(' (')[0].split('Tank ')[1], 10) <= TOTAL_TANKS) ? pumpNozzlesData[tmpCounter].tankIdNozzle3.split(' (')[0].split('Tank ')[1] : "0",

                    (pumpNozzlesData[tmpCounter].tankIdNozzle4 &&
                    pumpNozzlesData[tmpCounter].tankIdNozzle4.split(' (').length > 1 && 
                    pumpNozzlesData[tmpCounter].tankIdNozzle4.split(' (')[0].split('Tank ').length > 1 &&
                    parseInt(pumpNozzlesData[tmpCounter].tankIdNozzle4.split(' (')[0].split('Tank ')[1], 10) >= 0 &&
                    parseInt(pumpNozzlesData[tmpCounter].tankIdNozzle4.split(' (')[0].split('Tank ')[1], 10) <= TOTAL_TANKS) ? pumpNozzlesData[tmpCounter].tankIdNozzle4.split(' (')[0].split('Tank ')[1] : "0",

                    (pumpNozzlesData[tmpCounter].tankIdNozzle5 &&
                    pumpNozzlesData[tmpCounter].tankIdNozzle5.split(' (').length > 1 && 
                    pumpNozzlesData[tmpCounter].tankIdNozzle5.split(' (')[0].split('Tank ').length > 1 &&
                    parseInt(pumpNozzlesData[tmpCounter].tankIdNozzle5.split(' (')[0].split('Tank ')[1], 10) >= 0 &&
                    parseInt(pumpNozzlesData[tmpCounter].tankIdNozzle5.split(' (')[0].split('Tank ')[1], 10) <= TOTAL_TANKS) ? pumpNozzlesData[tmpCounter].tankIdNozzle5.split(' (')[0].split('Tank ')[1] : "0",

                    (pumpNozzlesData[tmpCounter].tankIdNozzle6 &&
                    pumpNozzlesData[tmpCounter].tankIdNozzle6.split(' (').length > 1 && 
                    pumpNozzlesData[tmpCounter].tankIdNozzle6.split(' (')[0].split('Tank ').length > 1 &&
                    parseInt(pumpNozzlesData[tmpCounter].tankIdNozzle6.split(' (')[0].split('Tank ')[1], 10) >= 0 &&
                    parseInt(pumpNozzlesData[tmpCounter].tankIdNozzle6.split(' (')[0].split('Tank ')[1], 10) <= TOTAL_TANKS) ? pumpNozzlesData[tmpCounter].tankIdNozzle6.split(' (')[0].split('Tank ')[1] : "0"
                ]
            });
        }
    }

    return data;
}

//-------------------------------------------------------------------------------------
function GetTanksConfiguration() {
    return;
}

//-------------------------------------------------------------------------------------
function SetTanksConfiguration(tanksData) {
    var tmpCounter = 0;
    var data = new Object();

    data.Tanks = new Array();
    
    // Fill in pump nozzles
    for (tmpCounter = 0; tmpCounter < tanksData.length; tmpCounter++) {
        if (tanksData[tmpCounter].fuelGradeId != "" && tanksData[tmpCounter].height > 0) {
            data.Tanks.push({
                Id: parseInt(tanksData[tmpCounter].id, 10),
                FuelGradeId: (tanksData[tmpCounter].fuelGradeId.split(' (').length > 1 && 
                              tanksData[tmpCounter].fuelGradeId.split(' (')[0].split('Grade ').length > 1 &&
                              parseInt(tanksData[tmpCounter].fuelGradeId.split(' (')[0].split('Grade ')[1], 10) >= 0 &&
                              parseInt(tanksData[tmpCounter].fuelGradeId.split(' (')[0].split('Grade ')[1], 10) <= TOTAL_FUEL_GRADES) ? parseInt(tanksData[tmpCounter].fuelGradeId.split(' (')[0].split('Grade ')[1], 10) : "0",
                Height: parseInt(tanksData[tmpCounter].height, 10)
            });
        }
    }

    return data;
}

//-------------------------------------------------------------------------------------
function GetParameter(parameterDevice, parameterNumber, parameterAddress) {    
    var data = new Object();
    data.Device = parameterDevice;
    data.Number = parseInt(parameterNumber, 10);
    data.Address = parseInt(parameterAddress, 10);

    return data;
}

//-------------------------------------------------------------------------------------
function SetParameter(parameterDevice, parameterNumber, parameterAddress, parameterValue) {
    var data = new Object();
    data.Device = parameterDevice;
    data.Number = parseInt(parameterNumber, 10);
    data.Address = parseInt(parameterAddress, 10);
    data.Value = parameterValue;

    return data;
}

//-------------------------------------------------------------------------------------
function GetUsersConfiguration() {
    return;
}

//-------------------------------------------------------------------------------------
function SetUsersConfiguration(usersData) {
    var tmpCounter = 0;
    var data = new Object();

    data.Users = new Array();
    
    // Fill in users
    for (tmpCounter = 0; tmpCounter < usersData.length; tmpCounter++) {
        if (usersData[tmpCounter].login.length > 0) {

            var permissions = new Object();
            permissions["Configuration"] = usersData[tmpCounter].configurationPermission;
            permissions["Control"] = usersData[tmpCounter].controlPermission;
            permissions["Monitoring"] = usersData[tmpCounter].monitoringPermission;
            permissions["Reports"] = usersData[tmpCounter].reportsPermission;

            data.Users.push({
                Id: usersData[tmpCounter].userId,
                Login: usersData[tmpCounter].login.toString(),
                Password: usersData[tmpCounter].password.toString(),
                Permissions: permissions,
                ServerAddress: usersData[tmpCounter].serverAddress.toString(),
                ServerUri: usersData[tmpCounter].serverUri.toString(),
                ServerPort: usersData[tmpCounter].serverPort.toString(),
                ServerLogin: usersData[tmpCounter].serverLogin.toString(),
                ServerPassword: usersData[tmpCounter].serverPassword.toString(),
                UploadPumpTransactions: usersData[tmpCounter].uploadPumpTransactions.toString(),
                UploadTankMeasurements: usersData[tmpCounter].uploadTankMeasurements.toString()
            });
        }
    }

    return data;
}

//-------------------------------------------------------------------------------------
function GetSystemDecimalDigits() {
    return;
}

//-------------------------------------------------------------------------------------
function GetPortLoggingConfiguration() {
    return;
}

//-------------------------------------------------------------------------------------
function SetPortLoggingConfiguration(port, dateTimeStop) {
    var data = new Object();

    data.Port = port;
    data.DateTimeStop = dateTimeStop;
    
    return data;
}

//-------------------------------------------------------------------------------------
function PumpGetStatus(pumpNumber) {
    var data = new Object();

    data.Pump = pumpNumber;

    return data;
}

//-------------------------------------------------------------------------------------
function PumpAuthorize(pumpNumber, nozzleNumber, presetType, presetDose, price) {
    var data = new Object();

    data.Pump = pumpNumber;
    data.Nozzle = nozzleNumber;
    data.Type = presetType;
    if (data.Type == "Volume" ||
        data.Type == "Amount") {
        data.Dose = presetDose;
    }
    data.Price = price;

    return data;
}

//-------------------------------------------------------------------------------------
function PumpStop(pumpNumber) {
    var data = new Object();

    data.Pump = pumpNumber;

    return data;
}

//-------------------------------------------------------------------------------------
function PumpEmergencyStop(pumpNumber) {
    var data = new Object();

    data.Pump = pumpNumber;

    return data;
}

//-------------------------------------------------------------------------------------
function PumpResume(pumpNumber) {
    var data = new Object();

    data.Pump = pumpNumber;

    return data;
}

//-------------------------------------------------------------------------------------
function PumpSuspend(pumpNumber) {
    var data = new Object();

    data.Pump = pumpNumber;

    return data;
}

//-------------------------------------------------------------------------------------
function PumpCloseTransaction(pumpNumber, transactionNumber) {
    var data = new Object();

    data.Pump = pumpNumber;
    data.Transaction = transactionNumber;

    return data;
}

//-------------------------------------------------------------------------------------
function PumpGetTotals(pumpNumber, nozzleNumber) {
    var data = new Object();

    data.Pump = pumpNumber;
    data.Nozzle = nozzleNumber;

    return data;
}

//-------------------------------------------------------------------------------------
function PumpSetPrices(pumpNumber, priceNozzle1, priceNozzle2, priceNozzle3, priceNozzle4, priceNozzle5, priceNozzle6) {
    var data = new Object();

    data.Pump = pumpNumber;

    data.Prices = new Array();
    data.Prices.push(priceNozzle1);
    data.Prices.push(priceNozzle2);
    data.Prices.push(priceNozzle3);
    data.Prices.push(priceNozzle4);
    data.Prices.push(priceNozzle5);
    data.Prices.push(priceNozzle6);

    return data;
}

//-------------------------------------------------------------------------------------
function PumpGetPrices(pumpNumber) {
    var data = new Object();

    data.Pump = pumpNumber;

    return data;
}

//-------------------------------------------------------------------------------------
function PumpGetTag(pumpNumber, nozzleNumber) {
    var data = new Object();

    data.Pump = pumpNumber;
    data.Nozzle = nozzleNumber;

    return data;
}

//-------------------------------------------------------------------------------------
function PumpSetLights(pumpNumber, state) {
    var data = new Object();

    data.Pump = pumpNumber;
    data.State = state;

    return data;
}

//-------------------------------------------------------------------------------------
function ProbeGetMeasurements(probeNumber) {
    var data = new Object();

    data.Probe = probeNumber;

    return data;
}

//-------------------------------------------------------------------------------------
function ProbeGetTankVolumeForHeight(tankNumber, height) {
    var data = new Object();

    data.Probe = tankNumber;
    data.Height = height;

    return data;
}

//-------------------------------------------------------------------------------------
function ReportGetPumpTransactions(pumpNumber, dateTimeStart, dateTimeEnd) {
    var data = new Object();

    data.Pump = pumpNumber;
    data.DateTimeStart = dateTimeStart;
    data.DateTimeEnd = dateTimeEnd;

    return data;
}

//-------------------------------------------------------------------------------------
function ReportGetTankMeasurements(tankNumber, dateTimeStart, dateTimeEnd) {
    var data = new Object();

    data.Tank = tankNumber;
    data.DateTimeStart = dateTimeStart;
    data.DateTimeEnd = dateTimeEnd;

    return data;
}

//-------------------------------------------------------------------------------------
function MakeDiagnostics() {
    var data = new Object();
    return data;
}

//-------------------------------------------------------------------------------------
function sendRequest(requestString, showLoader = true, timeoutValue = 10000) {
    // Show busyLoader
    if (showLoader == true)
        showBusyLoader();

    var username = 'admin';
    var password = 'admin';

    responseNull = false;

    // Send request to server
    return $.ajax({
        type: "POST",
        url: "http://192.168.1.117/jsonPTS",
        data: requestString,
        cache: false,
        dataType: 'json',
        headers: {
		'Authorization': 'Basic ' + btoa(username + ':' + password),
	},
        processData: false, // Don't process the files
        contentType: "application/json; charset=utf-8", // Set content type to false as jQuery will tell the server its a query string request
        timeout: timeoutValue,  // 10 seconds timeout for response
        success: function (responseData) {            
            // Hide busyLoader
            if (showLoader == true)
                hideBusyLoader();
            
            // Display error message
            if (responseData.Error != undefined && responseData.Error == true) {
                if (responseData.Message != undefined)
                    showMessage(responseData.Message);
                
                responseNull = true;
            } else {
                // Check all responses with error
                if (responseData.Packets == undefined ||
                    responseData.Packets == null) {
                    responseNull = true;
                } else {
                    if (responseData.Packets.length > 0) {
                        responseData.Packets.forEach(function(packet) {
                            if (packet.Error != undefined && packet.Error == true) {
                                if (packet.Message != undefined) {
                                    showMessage(packet.Message);
                                }

                                //responseNull = true;
                            }
                        });
                    }
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {            
            // Hide busyLoader
            if (showLoader == true)
                hideBusyLoader();               
                
            responseNull = true;

            if (ajaxOptions === 'timeout')
                console.log("AJAX timeout expired!");
        }
    });
}

//-------------------------------------------------------------------------------------
//--------------------------------- Pts_config.json -----------------------------------
//-------------------------------------------------------------------------------------

function getPtsConfigPumpProtocolsList() {
    // Check if Pts_config file is present
    if (ptsConfig == null)
    {
        console.log("pts_config_en.js file is not present!");
        alert("pts_config_en.js file is not present!");
        return null;
    }

    // List of pump protocols
    let protocols = [];
    
    // Fill list of pump protocols
    ptsConfig.configuration.protocols.protocol.forEach(function(item, i, array) {
        if (item.type == "0") {
            protocols.push({
                "index": item.index,
                "value": item.name
            });
        }
    });

    return protocols;
}

//-------------------------------------------------------------------------------------
function getPtsConfigProbeProtocolsList() {
    // Check if Pts_config file is present
    if (ptsConfig == null)
    {
        console.log("pts_config_en.js file is not present!");
        alert("pts_config_en.js file is not present!");
        return null;
    }

    // List of pump protocols
    let protocols = [];
    
    // Fill list of pump protocols
    ptsConfig.configuration.protocols.protocol.forEach(function(item, i, array) {
        if (item.type == "1") {
            protocols.push({
                "index": item.index,
                "value": item.name
            });
        }
    });

    return protocols;
}

//-------------------------------------------------------------------------------------
function getPtsConfigBaudRatesList() {
    // Check if Pts_config file is present
    if (ptsConfig == null)
    {
        console.log("pts_config_en.js file is not present!");
        alert("pts_config_en.js file is not present!");
        return null;
    }

    // List of baud rates
    let baudRates = [];
    
    // Fill list of baud rates
    ptsConfig.configuration.bauds.baud.forEach(function(item, i, array) {
        baudRates.push({
            "index": item.index,
            "value": item.rate
        });
    });

    return baudRates;
}

//-------------------------------------------------------------------------------------
function getPtsConfigParametersPts() {
    // Check if Pts_config file is present
    if (ptsConfig == null)
    {
        console.log("pts_config_en.js file is not present!");
        alert("pts_config_en.js file is not present!");
        return null;
    }

    // List of baud rates
    let parameters = [];
    
    // Fill list of parameters
    ptsConfig.configuration.params.param.forEach(function(parameter, counter, array) {
        if (parameter.type == ParametersTypeEnum.PARAMETERS_TYPE_PTS2.toString()) {
            parameter.input.value = 0;
            parameters.push(parameter);
        }
    });

    return parameters;
}

//-------------------------------------------------------------------------------------
function getPtsConfigParametersPump(protocolNumber) {
    // Check if Pts_config file is present
    if (ptsConfig == null)
    {
        console.log("pts_config_en.js file is not present!");
        alert("pts_config_en.js file is not present!");
        return null;
    }

    // List of baud rates
    let parameters = [];
    
    // Fill list of parameters
    ptsConfig.configuration.params.param.forEach(function(parameter, counter, array) {
        if (parameter.type == ParametersTypeEnum.PARAMETERS_TYPE_PUMP.toString() &&
            parameter.protocol == parseInt(protocolNumber, 10)) {
            parameter.input.value = 0;
            parameters.push(parameter);
        }
        if (parameter.type == ParametersTypeEnum.PARAMETERS_TYPE_PUMP_COMMON.toString()) {
            parameter.input.value = 0;
            parameters.push(parameter);
        }
    });

    return parameters;
}

//-------------------------------------------------------------------------------------
function getPtsConfigParametersProbe(protocolNumber) {
    // Check if Pts_config file is present
    if (ptsConfig == null)
    {
        console.log("pts_config_en.js file is not present!");
        alert("pts_config_en.js file is not present!");
        return null;
    }

    // List of baud rates
    let parameters = [];
    
    // Fill list of parameters
    ptsConfig.configuration.params.param.forEach(function(parameter, counter, array) {
        if (parameter.type == ParametersTypeEnum.PARAMETERS_TYPE_PROBE.toString() &&
            parameter.protocol == parseInt(protocolNumber, 10)) {
            parameter.input.value = 0;
            parameters.push(parameter);
        }
        if (parameter.type == ParametersTypeEnum.PARAMETERS_TYPE_PROBE_COMMON.toString()) {
            parameter.input.value = 0;
            parameters.push(parameter);
        }
    });

    return parameters;
}

//-------------------------------------------------------------------------------------