var TaxSystemModelSimplifiedGerman = new TaxSystemModel();
TaxSystemModelSimplifiedGerman.components = {
    "income_tax": {
        label: "Income Tax",
        unit: "%",
        value: null
    },
    "solidarity_supplement": {
        label: "Solidarity Supplement",
        unit: "%",
        value: 5.5
    },
    "church_tax": {
        label: "Church Tax",
        unit: "%",
        value: 9
    }
}

TaxSystemModelSimplifiedGerman.model = function() {
    return (this.income_tax.value/100) * (1+(this.solidarity_supplement.value/100)+(this.church_tax.value/100));
}