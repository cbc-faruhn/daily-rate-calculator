var transactionCategories = ['Other', 'Saving', 'Professional Liability Insurance', 'Tax Adviser', 'Communication', 'Website', 'Advertisement', 'Loan', 'Salary/Livelihood', 'Rent', 'Mobility', 'Electricity', 'Gas', 'Streaming', 'Food & Drink', 'Amusement/Culture'];
var transactionIndicator  = ['Month', 'per Day', 'Once'];

var transactionType = {
    // private / business expenses
    EXP_REGULAR_MISC_MONTHLY:          0,

    // income, e.g. by other customers
    INC_REGULAR_MISC_MONTHLY:         10,

    // social costs
    EXP_SOCIAL_HEALTH_INS:           100,
    EXP_SOCIAL_NURSING_CARE_INS:     200,
    EXP_SOCIAL_PENSION_INS:          300,
    EXP_SOCIAL_UNEMPLOYMENT_INS:     400,

    // costs due to the order
    EXP_CONTRACT_DAYOFFICE:         1000,
    EXP_CONTRACT_HOTEL:             2000,
    EXP_CONTRACT_TRAVEL:            3000,
    EXP_CONTRACT_OTHER_ONCE:        4000,
    EXP_CONTRACT_OTHER_PER_DAY:     5000,
    EXP_CONTRACT_OTHER_MONTHLY:     6000
};

function Transaction(type, value, category, indicator) {
    this.type      = type      || transactionType.EXP_REGULAR_MISC_MONTHLY;
    this.category  = category  || 0;
    this.value    = (!value && isNaN(value) ? null : value);
    this.indicator = indicator || 0;

    this.isTypeContractOther = this.type == transactionType.EXP_CONTRACT_OTHER_ONCE ||
                               this.type == transactionType.EXP_CONTRACT_OTHER_PER_DAY ||
                               this.type == transactionType.EXP_CONTRACT_OTHER_MONTHLY;

    switch(this.type) {
        case transactionType.EXP_SOCIAL_HEALTH_INS:
        case transactionType.EXP_SOCIAL_NURSING_CARE_INS:
        case transactionType.EXP_SOCIAL_PENSION_INS:
        case transactionType.EXP_SOCIAL_UNEMPLOYMENT_INS:
        case transactionType.EXP_CONTRACT_OTHER_MONTHLY:
            this.indicator = 0;
            break;
        case transactionType.EXP_CONTRACT_DAYOFFICE:
        case transactionType.EXP_CONTRACT_HOTEL:
        case transactionType.EXP_CONTRACT_OTHER_PER_DAY:
            this.indicator = 1;
            break;
        case transactionType.EXP_CONTRACT_TRAVEL:
        case transactionType.EXP_CONTRACT_OTHER_ONCE:
            this.indicator = 2;
            break;

        default:
            break;
    }

    if (this.type != transactionType.EXP_REGULAR_MISC_MONTHLY &&
        this.type != transactionType.INC_REGULAR_MISC_MONTHLY &&
        this.type != transactionType.EXP_CONTRACT_OTHER_ONCE &&
        this.type != transactionType.EXP_CONTRACT_OTHER_PER_DAY &&
        this.type != transactionType.EXP_CONTRACT_OTHER_MONTHLY) {
        switch(this.type) {
            case transactionType.EXP_SOCIAL_HEALTH_INS:
                this.category = 'Health Insurance';
                break;
            case transactionType.EXP_SOCIAL_NURSING_CARE_INS:
                this.category = 'Nursing Care Insurance';
                break;
            case transactionType.EXP_SOCIAL_PENSION_INS:
                this.category = 'Pension Insurance';
                break;
            case transactionType.EXP_SOCIAL_UNEMPLOYMENT_INS:
                this.category = 'Unemployment Insurance';
                break;
            case transactionType.EXP_CONTRACT_DAYOFFICE:
                this.category  = 'Day Office';
                break;
            case transactionType.EXP_CONTRACT_HOTEL:
                this.category = 'Hotel';
                break;
            case transactionType.EXP_CONTRACT_TRAVEL:
                this.category = 'Travel';
                break;

            default:
                this.category = 'unknown';
        }
    }
}