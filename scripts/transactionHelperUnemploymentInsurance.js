var SOCIAL_UNEMPLOYMENT_INCOME_CAP_WEST = 3045.00; // social income is capped at 6500.00€ in 2018 for east Germany
var SOCIAL_UNEMPLOYMENT_INCOME_CAP_EAST = 2695.00; // social income is capped at 6500.00€ in 2018 for west Germany
var SOCIAL_UNEMPLOYMENT_INS_BASE        =    3.00;

var transactionHelperUnemploymentInsurance = new TransactionHelper(transactionType.EXP_SOCIAL_UNEMPLOYMENT_INS);
transactionHelperUnemploymentInsurance.title = 'Public Unemployment Insurance';
transactionHelperUnemploymentInsurance.components = {
    "east_west": {
        label: "Located in west Germany",
        unit: "%",
        type: "boolean",
        value: true
    },
    "social_income": {
        label: "Expected Revenue (before tax)",
        unit: "€",
        type: "number",
        value: SOCIAL_UNEMPLOYMENT_INCOME_CAP_WEST
    }
}

transactionHelperUnemploymentInsurance.model = function() {
    var socialUnemploymentInsCap = this.east_west.value ? SOCIAL_UNEMPLOYMENT_INCOME_CAP_WEST : SOCIAL_UNEMPLOYMENT_INCOME_CAP_EAST;
    var income = Math.min(+this.social_income.value, socialUnemploymentInsCap); 

    return income * (SOCIAL_UNEMPLOYMENT_INS_BASE / 100);
}

app.registerHelper(transactionHelperUnemploymentInsurance);