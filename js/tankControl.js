class Tank {
    constructor(Id) {
        this._id = Id;
        this._status = "Offline";
        this._gradeCode = 0;
        this._gradeName = "";
        this._height = 0;
        this._fillingPercentage = 0;
        this._productHeight = 0;
        this._waterHeight = 0;
        this._temperature = 0;
        this._productVolume = 0;
        this._waterVolume = 0;
        this._productUllage = 0;
        this._productTCVolume = 0;
        this._productDensity = 0;
        this._productMass = 0;
    }

    get Id() {
        return this._id;
    }
    set Id(id) {
        this._id = id;
    }

    get Status() {
        return this._status;
    }
    set Status(status) {
        this._status = status;
    }

    get GradeCode() {
        return this._gradeCode;
    }
    set GradeCode(gradeCode) {
        this._gradeCode = gradeCode;
    }

    get GradeName() {
        return this._gradeName;
    }
    set GradeName(gradeName) {
        this._gradeName = gradeName;
    }

    get Height() {
        return this._height;
    }
    set Height(height) {
        this._height = height;
    }

    get FillingPercentage() {
        return this._fillingPercentage;
    }

    set FillingPercentage(fillingPercentage) {
        this._fillingPercentage = fillingPercentage;
    }

    get ProductHeight() {
        return this._productHeight;
    }
    set ProductHeight(productHeight) {
        this._productHeight = productHeight;
    }

    get WaterHeight() {
        return this._waterHeight;
    }
    set WaterHeight(waterHeight) {
        this._waterHeight = waterHeight;
    }

    get Temperature() {
        return this._temperature;
    }
    set Temperature(temperature) {
        this._temperature = temperature;
    }

    get ProductVolume() {
        return this._productVolume;
    }
    set ProductVolume(productVolume) {
        this._productVolume = productVolume;
    }

    get WaterVolume() {
        return this._waterVolume;
    }
    set WaterVolume(waterVolume) {
        this._waterVolume = waterVolume;
    }

    get ProductUllage() {
        return this._productUllage;
    }
    set ProductUllage(productUllage) {
        this._productUllage = productUllage;
    }

    get ProductTCVolume() {
        return this._productTCVolume;
    }
    set ProductTCVolume(productTCVolume) {
        this._productTCVolume = productTCVolume;
    }

    get ProductDensity() {
        return this._productDensity;
    }
    set ProductDensity(productDensity) {
        this._productDensity = productDensity;
    }

    get ProductMass() {
        return this._productMass;
    }
    set ProductMass(productMass) {
        this._productMass = productMass;
    }

    // Update tank in datatable
    static Update(datatable, tank) {
        if (datatable == null) {
            return;
        }

        datatable.rows().eq(0).each(function(rowIndex) {
            if (parseInt(datatable.cell(rowIndex, 0).data(), 10) == parseInt(tank._id, 10)) {
                // Set data for tank
                datatable.cell(rowIndex, TANK_STATUS_INDEX).data(tank._status);
                datatable.cell(rowIndex, TANK_GRADE_INDEX).data(tank._gradeName);

                if (parseFloat(tank._height) > 0 && 
                    parseFloat(tank._productHeight) > 0) {
                    tank._fillingPercentage = Math.round(parseFloat(tank._productHeight) * 100 / parseFloat(tank._height));
                } else {
                    tank._fillingPercentage = 0;
                }
                datatable.cell(rowIndex, TANK_FILLINGPERCENTAGE_INDEX).data(tank._fillingPercentage);

                datatable.cell(rowIndex, TANK_PRODUCTHEIGHT_INDEX).data(tank._productHeight);
                datatable.cell(rowIndex, TANK_WATERHEIGHT_INDEX).data(tank._waterHeight);
                datatable.cell(rowIndex, TANK_TEMPERATURE_INDEX).data(tank._temperature);
                datatable.cell(rowIndex, TANK_PRODUCTVOLUME_INDEX).data(tank._productVolume);
                datatable.cell(rowIndex, TANK_WATERVOLUME_INDEX).data(tank._waterVolume);
                datatable.cell(rowIndex, TANK_PRODUCTULLAGE_INDEX).data(tank._productUllage);
                datatable.cell(rowIndex, TANK_PRODUCTTCVOLUME_INDEX).data(tank._productTCVolume);
                datatable.cell(rowIndex, TANK_PRODUCTDENSITY_INDEX).data(tank._productDensity);
                datatable.cell(rowIndex, TANK_PRODUCTMASS_INDEX).data(tank._productMass);

                // Refresh datatable
                datatable.row(rowIndex).invalidate().draw();

                return;
            }
        });
    }
}