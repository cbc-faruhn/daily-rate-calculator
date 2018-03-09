var SOCIAL_PENSION_INCOME_CAP_WEST = 6500.00; // social income is capped at 6500.00€ in 2018 for east Germany
var SOCIAL_PENSION_INCOME_CAP_EAST = 5800.00; // social income is capped at 6500.00€ in 2018 for west Germany
var SOCIAL_PENSION_INS_BASE        =   18.60;

var transactionHelperPensionInsurance = new TransactionHelper(transactionType.EXP_SOCIAL_PENSION_INS);
transactionHelperPensionInsurance.title = 'Public Pension Insurance';
transactionHelperPensionInsurance.components = {
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
        value: SOCIAL_PENSION_INCOME_CAP_WEST
    }
}

transactionHelperPensionInsurance.model = function() {
    var socialPensionInsCap = this.east_west.value ? SOCIAL_PENSION_INCOME_CAP_WEST : SOCIAL_PENSION_INCOME_CAP_EAST;
    var income = Math.min(+this.social_income.value, socialPensionInsCap); 

    return income * (SOCIAL_PENSION_INS_BASE / 100);
}

app.registerHelper(transactionHelperPensionInsurance);