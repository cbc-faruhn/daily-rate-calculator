var TAX_INCOME_BASIC_FREE_ALLOWANCE       =   9000.00; // the basic tax-free allowance for income tax is 9000.00€ in 2018
var TAX_INCOME_ADVANCED_FREE_ALLOWANCE    =  13996.00; // the advanced tax-free allowance for income tax is 9000.00€ in 2018
var TAX_INCOME_MAXIMUM_TAX_RATE_ALLOWANCE =  54949.00;
var TAX_INCOME_WEALTH_TAX_RATE_ALLOWANCE  = 260532.00;

var taxHelperIncomeTax = new TaxComponentHelper('income_tax');
taxHelperIncomeTax.title = 'Income Tax';
taxHelperIncomeTax.components = {
    "revenue": {
        label: "Expected Yearly Revenue (before tax)",
        unit: "€",
        type: "number",
        bind: "totalNettoCostsYearly",
        value: 0
    }
}

taxHelperIncomeTax.model = function() {
    // built upon formulas given in §32a EStG (https://www.gesetze-im-internet.de/estg/__32a.html)
    var revenue = +this.revenue.value;

    var x = Math.floor(revenue);
    var y = Math.floor(revenue - TAX_INCOME_BASIC_FREE_ALLOWANCE)    / 10000;
    var z = Math.floor(revenue - TAX_INCOME_ADVANCED_FREE_ALLOWANCE) / 10000;

    var absoluteTax = 0;

    if (revenue <= TAX_INCOME_BASIC_FREE_ALLOWANCE) {
        absoluteTax = 0;
    } else if (revenue > TAX_INCOME_BASIC_FREE_ALLOWANCE   && revenue <= TAX_INCOME_ADVANCED_FREE_ALLOWANCE) {
        absoluteTax = (997.8 * y + 1400) * y;
    } else if (revenue > TAX_INCOME_ADVANCED_FREE_ALLOWANCE && revenue <= TAX_INCOME_MAXIMUM_TAX_RATE_ALLOWANCE) {
        absoluteTax = (220.13 * z + 2397) * z + 948.49;
    } else if (revenue > TAX_INCOME_MAXIMUM_TAX_RATE_ALLOWANCE && revenue <= TAX_INCOME_WEALTH_TAX_RATE_ALLOWANCE) {
        absoluteTax = 0.42 * x - 8621.75;
    } else {
        absoluteTax = 0.45 * x - 16437.7;
    }

    return app.formatCurrency(absoluteTax / revenue) * 100;
}

app.registerHelper(taxHelperIncomeTax);