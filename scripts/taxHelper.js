function TaxComponentHelper(forComponent) {
    this.helperType = 'tax';
    this.type = forComponent;
    this.title = null;
    this.components = {};
    this.model = function() {
        return 0;
    }
}