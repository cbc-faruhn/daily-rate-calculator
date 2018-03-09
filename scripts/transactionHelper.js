function TransactionHelper(type) {
    this.helperType = 'transaction';
    this.type = type;
    this.title = null;
    this.components = {};
    this.model = function() {
        return 0;
    }
}