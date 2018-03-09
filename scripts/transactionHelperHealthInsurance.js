var SOCIAL_HEALTH_INCOME_CAP           = 4425.00; // social income is capped at 4425.00€ in 2018
var SOCIAL_HEALTH_INS_BASE             =   14.60;

var SOCIAL_NURSING_CARE_LOWER_CAP      = 2283.70;
var SOCIAL_NURSING_CARE_BASE_CHILDLESS =    2.80;
var SOCIAL_NURSING_CARE_BASE_CHILD     =    2.55;

var transactionHelperHealthInsurance = new TransactionHelper(transactionType.EXP_SOCIAL_HEALTH_INS);
transactionHelperHealthInsurance.title = 'Public Health Insurance';
transactionHelperHealthInsurance.components = {
    "additional_fee": {
        label: "Additional Contribution Rate",
        unit: "%",
        type: "number",
        value: 1.1
    },
    "social_income": {
        label: "Expected Revenue (before tax)",
        unit: "€",
        type: "number",
        value: SOCIAL_HEALTH_INCOME_CAP
    }
}

transactionHelperHealthInsurance.model = function() {
    var income = Math.min(+this.social_income.value, SOCIAL_HEALTH_INCOME_CAP);

    return income * ((SOCIAL_HEALTH_INS_BASE + +this.additional_fee.value) / 100);
}

var transactionHelperNursingCareInsurance = new TransactionHelper(transactionType.EXP_SOCIAL_NURSING_CARE_INS);
transactionHelperNursingCareInsurance.title = 'Public Nursing Care Insurance';
transactionHelperNursingCareInsurance.components = {
    "childless": {
        label: "Childless",
        unit: "%",
        type: "boolean",
        value: true
    },
    "social_income": {
        label: "Expected Revenue (before tax)",
        unit: "€",
        type: "number",
        value: SOCIAL_HEALTH_INCOME_CAP
    }
}

transactionHelperNursingCareInsurance.model = function() {
    var income = Math.max(Math.min(+this.social_income.value, SOCIAL_HEALTH_INCOME_CAP), SOCIAL_NURSING_CARE_LOWER_CAP);
    var base = this.childless.value ? SOCIAL_NURSING_CARE_BASE_CHILDLESS : SOCIAL_NURSING_CARE_BASE_CHILD;

    return income * (base / 100);
}

app.registerHelper(transactionHelperHealthInsurance);
app.registerHelper(transactionHelperNursingCareInsurance);