/* DataTables wrapper */

//-------------------------------------------------------------------------------------

function getDatatablesPumpProtocolsList() {
    // List of protocols
    var datatablesProtocols = [];
    
    // Fill list of protocols
    getPtsConfigPumpProtocolsList().forEach(function(item, i, array) {
        datatablesProtocols.push({
            "label": item.index + ". " + item.value,
            "value": item.index + ". " + item.value
        });
    });

    return datatablesProtocols;
}
//-------------------------------------------------------------------------------------

function getDatatablesProbeProtocolsList() {
    // List of protocols
    var datatablesProtocols = [];
    
    // Fill list of protocols
    getPtsConfigProbeProtocolsList().forEach(function(item, i, array) {
        datatablesProtocols.push({
            "label": item.index + ". " + item.value,
            "value": item.index + ". " + item.value
        });
    });

    return datatablesProtocols;
}
//-------------------------------------------------------------------------------------

function getDatatablesBaudRatesList() {
    // List of baud rates
    var baudRates = [];
    
    // Fill list of baud rates
    getPtsConfigBaudRatesList().forEach(function(item, i, array) {
        baudRates.push({
            "label": item.index + ". " + item.value,
            "value": item.index + ". " + item.value
        });
    });

    return baudRates;
}

//-------------------------------------------------------------------------------------