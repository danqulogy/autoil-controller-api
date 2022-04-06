// Common title
var WEB_SERVER_TITLE = "PTS-2 controller web-server";

// Flag for SD error
var SD_ERROR = 0;

//-------------------------------------------------------------------------------------
(function($) {
    // Start of use strict
    "use strict";

    // Browser viewport width
    var windowWidth = 0;

    // On document ready
    $(function() {
        
        // Assign initial browser viewport width
        windowWidth = Number($(window).width());

        // Collapse side menu
        if (windowWidth >= 768) {
            $("body").addClass("sidenav-toggled");
        }

        displayUserInformation();

        // Logout
        $("#btnLogout").click(function(e) {
            ClearAuthentication();
        });
    });

    // On window resize adjust the navbar size
    $(window).resize(function() {
        // Show full side navigation menu in collapsed state
        if ($(window).width() < 768 && Number(windowWidth) >= 768) {
            $("body").removeClass("sidenav-toggled");
            $("#sidenavTogglerArrow").addClass("fa-rotate-180");
            $(".navbar-sidenav .nav-link-collapse").addClass("collapsed");
            $(".navbar-sidenav .sidenav-second-level, .navbar-sidenav .sidenav-third-level").removeClass("show");
        } else if ($(window).width() >= 768 && Number(windowWidth) < 768) {
            $("body").addClass("sidenav-toggled");
            $("#sidenavTogglerArrow").removeClass("fa-rotate-180");
        }

        windowWidth = Number($(window).width());
    });

    // Remove navbar menu after click on link in small screen
    $('a.nav-link').click(function() {
        if ($(window).width() < 768) {
            $('button.navbar-toggler').click();
        }
    });

    // Configure tooltips for collapsed side navigation
    $('.navbar-sidenav [data-toggle="tooltip"]').tooltip({
        template: '<div class="tooltip navbar-sidenav-tooltip" role="tooltip" style="pointer-events: none;"><div class="arrow"></div><div class="tooltip-inner"></div></div>'
    })

    // Toggle the side navigation
    $("#sidenavToggler").click(function(e) {
        e.preventDefault();
        $("body").toggleClass("sidenav-toggled");
        $("#sidenavTogglerArrow").toggleClass("fa-rotate-180");
        $(".navbar-sidenav .nav-link-collapse").addClass("collapsed");
        $(".navbar-sidenav .sidenav-second-level, .navbar-sidenav .sidenav-third-level").removeClass("show");
    });

    // Force the toggled class to be removed when a collapsible nav link is clicked
    $(".navbar-sidenav .nav-link-collapse").click(function(e) {
        e.preventDefault();
        $("body").removeClass("sidenav-toggled");
        $("#sidenavTogglerArrow").addClass("fa-rotate-180");
    });

    // Scroll to top button
    $(document).scroll(function() {
        var scrollDistance = $(this).scrollTop();
        if (scrollDistance > 100) {
            $('.scroll-to-top').fadeIn();
        } else {
            $('.scroll-to-top').fadeOut();
        }
    });

    $('.scroll-to-top').click(function (event) {
        event.preventDefault();
        $('html, body').animate({ scrollTop: 0 }, 500);
        return false;
    });
  
    // Configure tooltips globally
    $('[data-toggle="tooltip"]').tooltip();

    // Link clicked
    $('.pageLink').on('click', function (event) {
        event.preventDefault();

        $('.pageLink').removeClass("selected");
        $(this).addClass("selected");

        showPageContent(this.id);
        document.title = WEB_SERVER_TITLE;
        window.history.pushState(null, this.title, this.href); //update browser history
        return false;
    });

    /*// Device information page clicked
    $('#DeviceInformationPage').on('click', function() {
        showPageContent("DeviceInformationPage");
        document.title = WEB_SERVER_TITLE;
    });

    // Configuration page clicked
    $('#ConfigurationPage').on('click', function() {
        showPageContent("ConfigurationPage");
        document.title = WEB_SERVER_TITLE;
    });

    // Pumps control page clicked
    $('#PumpsControlPage').on('click', function() {
        showPageContent("PumpsControlPage");
        document.title = WEB_SERVER_TITLE;
    });

    // Tanks monitoring page clicked
    $('#TanksMonitoringPage').on('click', function() {
        showPageContent("TanksMonitoringPage");
        document.title = WEB_SERVER_TITLE;
    });

    // Tanks monitoring page clicked
    $('#ReportingPage').on('click', function() {
        showPageContent("ReportingPage");
        document.title = WEB_SERVER_TITLE;
    });

    // Tanks monitoring page clicked
    $('#SelfDiagnosticsPage').on('click', function() {
        showPageContent("SelfDiagnosticsPage");
        document.title = WEB_SERVER_TITLE;
    });

    // Upload firmware page clicked
    $('#FirmwareUploadPage').on('click', function(event) {
        showPageContent("FirmwareUpdatePage");
        document.title = WEB_SERVER_TITLE;
    });

    // Logging page clicked
    $('#LoggingPage').on('click', function(event) {
        showPageContent("LoggingPage");
        document.title = WEB_SERVER_TITLE;
    });*/

    // Go to currently selected page
    $('.pageLink').each(function () {
        if (window.location.href.indexOf(this.href) > -1) {
            $(this).click();
            $(this).addClass("selected");
        }
    });

    /*// Go to currently selected page
    if (window.location.href.indexOf("DeviceInformationPage") > -1) {
        $('#DeviceInformationPage').click();
    } else if (window.location.href.indexOf("ConfigurationPage") > -1) {
        $('#ConfigurationPage').click();
    } else if (window.location.href.indexOf("PumpsControlPage") > -1) {
        $('#PumpsControlPage').click();
    } else if (window.location.href.indexOf("TanksMonitoringPage") > -1) {
        $('#TanksMonitoringPage').click();
    } else if (window.location.href.indexOf("ReportingPage") > -1) {
        $('#ReportingPage').click();
    } else if (window.location.href.indexOf("SelfDiagnosticsPage") > -1) {
        $('#SelfDiagnosticsPage').click();
    } else if (window.location.href.indexOf("FirmwareUploadPage") > -1) {
        $('#FirmwareUploadPage').click();
    } else if (window.location.href.indexOf("LoggingPage") > -1) {
        $('#LoggingPage').click();
    }*/
  
})(jQuery); // End of use strict

// Variable showing whether busyLoader is displayed
var busyLoaderIsOn = 0;

//-------------------------------------------------------------------------------------
function displayUserInformation(gotoDeviceInformationPage = false) {    
    var request = 0;
    var commands = [];
    var message = "";
    var data;
    
    // Currently logged user
    var userPermissions = [];

    // Get currently logged user name
    commands = [];
    commands.push({
        function: GetUserInformation
    },{
        function: GetSdInformation
    },{
        function: GetBatteryVoltage
    });

    request = createComplexRequest(commands);

    // Process response
    request.done(function(response) {
        if (responseNull == true)
            return;

        message = "";
    
        data = response.Packets.filter(Packet => Packet.Type == "UserInformation");
        if (data != null &&
            data != undefined &&
            data.length > 0) {
            data = data[0].Data;
            if (data == undefined) {
                return;
            } else {
                $("#usernameDiv").text(data.Login);
                
                if (data.Permissions != undefined) {
                    userPermissions = data.Permissions;

                    if ($('#ConfigurationPageLi').length > 0)
                        $('#ConfigurationPageLi').addClass("d-none");

                    if ($('#SelfDiagnosticsPageLi').length > 0)
                        $('#SelfDiagnosticsPageLi').addClass("d-none");

                    if ($('#FirmwareUpdatePageLi').length > 0)
                        $('#FirmwareUpdatePageLi').addClass("d-none");
                    
                    if ($('#LoggingPageLi').length > 0)
                        $('#LoggingPageLi').addClass("d-none");
                    
                    if ($('#PumpsControlPageLi').length > 0)
                        $('#PumpsControlPageLi').addClass("d-none");
                    
                    if ($('#TanksMonitoringPageLi').length > 0)
                        $('#TanksMonitoringPageLi').addClass("d-none");
                    
                    if ($('#ReportingPageLi').length > 0)
                        $('#ReportingPageLi').addClass("d-none");

                    if (userPermissions["Configuration"] == true) {
                        if ($('#SelfDiagnosticsPageLi').length > 0)
                            $('#SelfDiagnosticsPageLi').removeClass("d-none");

                        if ($('#FirmwareUpdatePageLi').length > 0)
                            $('#FirmwareUpdatePageLi').removeClass("d-none");

                        if ($('#LoggingPageLi').length > 0)
                            $('#LoggingPageLi').removeClass("d-none");
                    }

                    if (userPermissions["Control"] == true ||
                        userPermissions["Monitoring"] == true) {
                        if ($('#ConfigurationPageLi').length > 0)
                            $('#ConfigurationPageLi').removeClass("d-none");

                        if ($('#PumpsControlPageLi').length > 0)
                            $('#PumpsControlPageLi').removeClass("d-none");
                            
                        if ($('#TanksMonitoringPageLi').length > 0)
                            $('#TanksMonitoringPageLi').removeClass("d-none");
                    }

                    if (userPermissions["Reports"] == true) {
                        if ($('#ReportingPageLi').length > 0)
                            $('#ReportingPageLi').removeClass("d-none");
                    }
        
                    if (window.location.href.indexOf("#") == -1) {
                        if ($('#DeviceInformationPageLi').length > 0) {
                            showPageContent("DeviceInformationPage");
                        } else {
                            showPageContent("PumpsControlPage");
                        } 
                        
                        document.title = WEB_SERVER_TITLE;
                    }
                }
            }
        }

        data = response.Packets.filter(Packet => Packet.Type == "SdInformation");
        if (data != null &&
            data != undefined &&
            data.length > 0) {
            if (data[0].Error != undefined &&
                data[0].Error == true) {
                message += "SD flash disk error!";
                SD_ERROR = 1;
            } else
                SD_ERROR = 0;
        }

        // No SD found
        data = response.Packets.filter(Packet => Packet.Type == "GetSdInformation");
        if (data != null &&
            data != undefined &&
            data.length > 0) {
            if (data[0].Error != undefined &&
                data[0].Error == true) {
                message += "SD flash disk error!";
                SD_ERROR = 1;
            } else
                SD_ERROR = 0;
        }

        data = response.Packets.filter(Packet => Packet.Type == "BatteryVoltage");
        if (data != null &&
            data != undefined &&
            data.length > 0) {
            data = data[0].Data;
            if (data != undefined) {
                if (message != "")
                    message += " ";
                
                if (data.Voltage > 2200 && data.Voltage <= 2500) {
                    message += "Battery is coming to low, needs replacement soon.";
                } else if (data.Voltage <= 2200) {
                    message += "No battery found! Please insert it immediately!";
                }
            }
        }

        if (message != "")
            showMessage(message);

        if (gotoDeviceInformationPage == true)
            showPageContent("DeviceInformationPage");
    });
}

//-------------------------------------------------------------------------------------
function cleanContainer() {
    $('#mainContainer').empty();
}

//-------------------------------------------------------------------------------------
function showBusyLoader() {
    if ($("#busyLoader")) {
        if (busyLoaderIsOn != null && busyLoaderIsOn == 0) {
            $("#busyLoader").modal("show");
            
            busyLoaderIsOn = 1;
        }
    }
}

//-------------------------------------------------------------------------------------
function hideBusyLoader() {
    if ($("#busyLoader")) {
        if (busyLoaderIsOn != null && busyLoaderIsOn == 1) {
            $("#busyLoader").modal("hide");
            busyLoaderIsOn = 0;
        }
    }
}

//-------------------------------------------------------------------------------------
function showMessage(message, type, timeout = 5000) {
    if ($("#message")) {

        $("#message").removeClass("d-none");
        $("#message").removeClass("alert-primary");
        $("#message").removeClass("alert-secondary");
        $("#message").removeClass("alert-success");
        $("#message").removeClass("alert-danger");
        $("#message").removeClass("alert-warning");
        $("#message").removeClass("alert-info");
        $("#message").removeClass("alert-light");
        $("#message").removeClass("alert-dark");

        $("#message").addClass("d-block");
        if (type == undefined || type == "error") {
            $("#message").addClass("alert-danger");
            $("#message").text("Error(s): " + message);
        } else {
            $("#message").addClass("alert-" + type);
            $("#message").text(message);
        }

        if (timerShowMessageId != 0)
            clearTimeout(timerShowMessageId);
    
        timerShowMessageId = setTimeout(hideMessage, timeout);
    }
}

//-------------------------------------------------------------------------------------
function hideMessage() {
    if ($("#message")) {
        $("#message").text("");

        $("#message").removeClass("d-block");
        $("#message").addClass("d-none");

        if (timerShowMessageId != 0)
            clearTimeout(timerShowMessageId);
    }
}

//-------------------------------------------------------------------------------------
function showPageContent(pageName) {
    // Show busy loader
    showBusyLoader();

    // Stop polling pumps
    if (timerPumpsPollingId != 0)
        clearTimeout(timerPumpsPollingId);

    // Stop polling probes
    if (timerProbesPollingId != 0)
        clearTimeout(timerProbesPollingId);

    // Stop polling diagnostics
    if (timerDiagnostics != 0)
        clearTimeout(timerDiagnostics);
  
    // Hide tooltip
    $('[data-toggle="tooltip"]').tooltip('hide');

    // Process
    setTimeout(function(){
        // Hide busy loader
        hideBusyLoader();
        
        // Clean container
        cleanContainer();

        // Fill some default elements
        $("#mainContainer").load("pagesPartial/" + pageName + ".html");
    }, 250); 
}

//-------------------------------------------------------------------------------------
function ClearAuthentication()
{
    var request = 0;
    var commands = [];
    var IsInternetExplorer = false;

    try {
        var agt = navigator.userAgent.toLowerCase();
        if (agt.indexOf("msie") != -1) { 
            IsInternetExplorer = true; 
        }
    }
    catch(e) {
        IsInternetExplorer = false;    
    };
    
    $("#logoutModal").modal('hide'); 
    
    if (IsInternetExplorer) {
        // Log out Internet Explorer
        document.execCommand("ClearAuthenticationCache");
        
        displayUserInformation(true);
    }
    else {
        $.ajax({
            // This can be any path on your same domain which requires HTTPAuth
            url: "/jsonPTS",
            username: 'logout',
            password: 'logout',
            // If the return is 401, refresh the page to request new details.
            statusCode: { 401: function() {
                    displayUserInformation(true);
                }
            }
        });
    }
}

//-------------------------------------------------------------------------------------
function addZero(i) {
    if (i.toString().length == 1)
        i = "0" + i.toString();
    
    return i;
}

//-------------------------------------------------------------------------------------