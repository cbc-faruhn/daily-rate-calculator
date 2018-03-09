var app = new Vue({
    el: '#app',

    data: {
        transactionCategories: transactionCategories,
        transactionIndicator: transactionIndicator,
        transactionType: transactionType,
        transactions: [],
        helpers: [],
        currentHelperReference: null,
        currentHelper: null,
        currentHelperVisible: false,
    
        storage: localStorage,
    
        messages: null,
        lang: defaultLang,
        currency: defaultCurrency,
    
        tax_system: null,
    
        daily_rate: null,
        hourly_rate: null,
        contract_days: null,
        contract_hours: null,
        contract_time: 1,
    
        digits: 2,
    
        mode_calc_rate: true,
        manual_rate_change: true,
        manual_days_change: true,

        settings: ['lang', 'currency', 'mode_calc_rate'],

        languages: {
            'de': 'Deutsch',
            'en': 'English'
        },

        sourceCodeUrl: 'https://github.com/cbc-faruhn/daily-rate-calculator'
    },

    created: function() {
        if (typeof messages == 'object') {
            this.messages = messages;
        }

        if (!this.messages) {
            this.messages = jQuery.getJSON('messages.json');
        }
        document.title = this.getMessage('Daily Rate Calculator');

        // initialize Tax System Model
        this.tax_system = defaultTaxModel;
        for (let key in this.tax_system.components) {
            this.tax_system[key] = this.tax_system.components[key];
        }

        // load values from storage
        this.loadValues();

        // run first calculation
        this.calculate();
    },

    computed: {
        showRateHint: function() {
            return this.mode_calc_rate && (this.contract_days == null || this.contract_days == 0 || this.contract_days == Infinity);
        },

        showContractHint: function() {
            return !this.mode_calc_rate && (this.daily_rate == null || this.daily_rate == 0 || this.daily_rate == Infinity);
        },
        
        transactionsOther: function() {
            return this.transactions.filter(function (transaction) {
                return ((transaction.type == transactionType.EXP_REGULAR_MISC_MONTHLY ||
                         transaction.type == transactionType.INC_REGULAR_MISC_MONTHLY) &&
                        !isNaN(transaction.value));
            })
        },
        
        transactionsSocial: function() {
            return this.transactions.filter(function (transaction) {
                return ((transaction.type == transactionType.EXP_SOCIAL_HEALTH_INS ||
                         transaction.type == transactionType.EXP_SOCIAL_NURSING_CARE_INS ||
                         transaction.type == transactionType.EXP_SOCIAL_PENSION_INS ||
                         transaction.type == transactionType.EXP_SOCIAL_UNEMPLOYMENT_INS) &&
                       !isNaN(transaction.value));
            })
        },
        
        transactionsContract: function() {
            return this.transactions.filter(function (transaction) {
                return ((transaction.type == transactionType.EXP_CONTRACT_DAYOFFICE ||
                         transaction.type == transactionType.EXP_CONTRACT_HOTEL ||
                         transaction.type == transactionType.EXP_CONTRACT_TRAVEL ||
                         transaction.type == transactionType.EXP_CONTRACT_OTHER_ONCE ||
                         transaction.type == transactionType.EXP_CONTRACT_OTHER_PER_DAY ||
                         transaction.type == transactionType.EXP_CONTRACT_OTHER_MONTHLY) &&
                       !isNaN(transaction.value));
            })
        },

        tax: function() {
            return this.tax_system.model();
        },

        regularCosts: function() {
            var costs = 0;

            for (var i = 0; i < this.transactionsOther.length; i++) {
                var transaction = this.transactionsOther[i];

                if (transaction.type == transactionType.INC_REGULAR_MISC_MONTHLY) {
                    costs += -transaction.value;
                } else {
                    costs += +transaction.value;
                }
            }

            return costs;
        },

        socialCosts: function() {
            var costs = 0;
            
            for (var i = 0; i < this.transactionsSocial.length; i++) {
                var transaction = this.transactionsSocial[i];

                costs += +transaction.value;
            }

            return costs;
        },

        totalNettoCosts: function() {
            return this.regularCosts + this.socialCosts;
        },

        totalNettoCostsYearly: function() {
            return this.totalNettoCosts * 12;
        },

        totalBruttoCosts: function() {
            return this.totalNettoCosts * (1 / (1 - this.tax)) * this.contract_time;
        },

        factor: function() {
            return Math.pow(10, this.digits);
        }
    },

    watch: {
        mode_calc_rate: function(newValue, oldValue) {
            this.calculate();
        },

        transactions: function(newValue, oldValue) {
            this.reindexTransactions();
        },

        daily_rate: function(newValue, oldValue) {
            if (newValue == oldValue || !this.manual_rate_change)  {
                this.manual_rate_change = true;
                return;
            }

            this.manual_rate_change = false;
            this.hourly_rate = this.formatCurrency(this.daily_rate / 8);

            if (this.daily_rate == 0 || this.daily_rate == null) {
                this.daily_rate = 0;
                this.contract_days = 0;
            }

            this.calculate();
        },

        hourly_rate: function(newValue, oldValue) {
            if (newValue == oldValue || !this.manual_rate_change) {
                this.manual_rate_change = true;
                return;
            }

            this.manual_rate_change = false;
            this.daily_rate = this.formatCurrency(this.hourly_rate * 8);
            this.calculate();
        },

        contract_days: function(newValue, oldValue) {
            if (newValue == oldValue || !this.manual_days_change)  {
                this.manual_days_change = true;
                return;
            }
            
            this.manual_days_change = false;
            this.contract_hours = this.formatCurrency(this.contract_days * 8);

            if (this.contract_days == 0 || this.contract_days == null) {
                this.contract_days = 0;
                this.daily_rate = 0;
            }

            this.calculate();
        },

        contract_hours: function(newValue, oldValue) {
            if (newValue == oldValue || !this.manual_days_change)  {
                this.manual_days_change = true;
                return;
            }
            
            this.manual_days_change = false;
            this.contract_days = this.formatCurrency(this.contract_hours / 8);
            this.calculate();
        },

        contract_time: function(newValue, oldValue) {
            if (newValue == oldValue) return;
            
            this.calculate();
        },

        lang: function(newValue, oldValue) {
            this.saveValues();
        },

        manual_days_change: function(newValue, oldValue) {
            this.saveValues();
        }
    },

    methods: {
        electronOpenSourceCode() {
            if (this.isRunningAsApp() && typeof require != 'undefined') {
                require('electron').shell.openExternal(this.sourceCodeUrl);
            }
        },

        isRunningAsApp: function() {
            var userAgent = navigator.userAgent.toLowerCase();
            return userAgent.indexOf(' electron/') >= 0;
        },

        resetApp: function() {
            // clear storage and re-initialize app by reloading it
            this.storage.clear();
            location.reload();
        },

        exportStorage: function() {
            var storage = {};

            this.saveValues();
            for (var i = 0; i < this.storage.length; i++) {
                var key = this.storage.key(i);
                var value = this.storage.getItem(key);
                storage[key] = value;
            }

            console.log(JSON.stringify(storage));
        },

        importStorage: function(jsonSource) {
            var storage = JSON.parse(jsonSource);

            this.storage.clear();
            for (key in storage) {
                this.storage.setItem(key, storage[key]);
            }
        },

        initializeTransactions: function() {
            this.transactions.push(new Transaction(transactionType.EXP_SOCIAL_HEALTH_INS));
            this.transactions.push(new Transaction(transactionType.EXP_SOCIAL_NURSING_CARE_INS));
            this.transactions.push(new Transaction(transactionType.EXP_SOCIAL_PENSION_INS));
            this.transactions.push(new Transaction(transactionType.EXP_SOCIAL_UNEMPLOYMENT_INS));
            
            this.transactions.push(new Transaction(transactionType.EXP_CONTRACT_DAYOFFICE,        0));
            this.transactions.push(new Transaction(transactionType.EXP_CONTRACT_HOTEL,            0));
            this.transactions.push(new Transaction(transactionType.EXP_CONTRACT_TRAVEL,           0));

            this.transactions.push(new Transaction(transactionType.EXP_REGULAR_MISC_MONTHLY, null, 8));
            this.transactions.push(new Transaction(transactionType.EXP_REGULAR_MISC_MONTHLY, null, 1));
            this.transactions.push(new Transaction(transactionType.EXP_REGULAR_MISC_MONTHLY));
        },

        changeLang: function(lang) {
            this.lang = lang;
            this.calculate();
            window.location.reload(true);
        },

        loadTaxValues: function() {
            if (this.storage) {
                for (let taxComponent in this.tax_system.components) {
                    var storedValue = this.storage.getItem('tax.'+ taxComponent);
                    if (storedValue) {
                        this.tax_system[taxComponent].value = +storedValue;
                    }
                }
            }
        },

        saveTaxValues: function() {
            if (this.storage) {
                for (let taxComponent in this.tax_system.components) {
                    this.storage.setItem('tax.'+ taxComponent, this.tax_system[taxComponent].value);
                }
            }
        },

        loadTransactions: function() {
            var hasTransaction = true;

            while (hasTransaction) {
                var transaction = this.storage.getItem('transaction.'+ this.transactions.length);
                if (transaction) {
                    transaction = JSON.parse(transaction);
                    this.transactions.push(new Transaction(transaction.type, transaction.value, transaction.category));
                } else {
                    hasTransaction = false;
                }
            }

            if (this.transactions.length == 0) {
                this.initializeTransactions();
            }
            this.reindexTransactions();
        },

        saveTransactions: function() {
            for (var i = 0; i < this.transactions.length; i++) {
                this.storage.setItem('transaction.'+ i, JSON.stringify(this.transactions[i]));
            }
        },

        loadHelperValues: function() {
            for (var i = 0; i < this.helpers.length; i++) {
                var helper = this.helpers[i];
                var helperComponents = helper.components;
                for (let key in helperComponents) {
                    helper[key].value = JSON.parse(this.storage.getItem('helper.'+ helper.type +'.'+ key)) || helper[key].value;
                }
            }
        },

        saveHelperValues: function() {
            for (var i = 0; i < this.helpers.length; i++) {
                var helper = this.helpers[i];
                var helperComponents = helper.components;
                for (let key in helperComponents) {
                    this.storage.setItem('helper.'+ helper.type +'.'+ key, JSON.stringify(helper[key].value));
                }
            }
        },

        loadSettings: function() {
            for (var i = 0; i < this.settings.length; i++) {
                var key = this.settings[i];
                var keyType = typeof this[key];
                if (keyType == 'boolean' || keyType == 'number' || keyType == 'string') {
                    this[key] = JSON.parse(this.storage.getItem('setting.'+ key)) || this[key];
                }
            }
        },

        saveSettings: function() {
            for (var i = 0; i < this.settings.length; i++) {
                var key = this.settings[i];
                var keyType = typeof this[key];
                if (keyType == 'boolean' || keyType == 'number' || keyType == 'string') {
                    this.storage.setItem('setting.'+ key, JSON.stringify(this[key]));
                }
            }
        },

        loadValues: function() {
            this.loadSettings();
            this.loadTaxValues();
            this.loadTransactions();
            this.loadHelperValues();
        },

        saveValues: function() {
            // clear the storage to lose non-existent transactions
            this.storage.clear();

            this.saveSettings();
            this.saveTaxValues();
            this.saveTransactions();
            this.saveHelperValues();
        },

        reindexTransactions: function() {
            for (var i = 0; i < this.transactions.length; i++) {
                this.transactions[i].absoluteIndex = i;
            }
        },

        registerHelper: function(helper) {
            // initialize helper
            for (let key in helper.components) {
                helper[key] = helper.components[key];
            }

            helper.emitChange = function() {
                app.helperEmitValue(helper.model());
            }

            // register helper, load its stored values and refresh current form-bound values
            this.helpers.push(helper);
            this.loadHelperValues();
            this.bindHelperValues(helper);

            if (helper.helperType == 'transaction') {
                for (var i = 0; i < this.transactions.length; i++) {
                    if (this.transactions[i].type == helper.type && (this.transactions[i].value == null || isNaN(this.transactions[i].value))) {
                        this.transactions[i].value = this.formatCurrency(helper.model());
                    }
                }
            }

            if (helper.helperType == 'tax') {
                for (var component in this.tax_system) {
                    if (component == helper.type && (this.tax_system[component].value == null || isNaN(this.tax_system[component].value))) {
                        this.tax_system[component].value = this.formatCurrency(helper.model());
                    }
                }
            }
            console.log('Registered Transaction Helper for transactions of type '+ helper.type);
        },

        hasHelper: function(type) {
            // helper is registered for a transaction
            for (var i = 0; i < this.helpers.length; i++) {
                if (this.helpers[i].type == type) {
                    return true;
                }
            }

            return false;
        },

        hasDifferentHelperValue: function(type, reference) {
            if (this.hasHelper(type)) {
                var helper = this.getHelper(type);

                if (this.currentHelper != helper || this.currentHelper == helper && !this.currentHelperVisible) {
                    this.bindHelperValues(helper);
                }
                var result = this.formatCurrency(helper.model()) != reference.value;

                return result;
            }

            return false;
        },

        getHelper: function(type) {
            for (var i = 0; i < this.helpers.length; i++) {
                if (this.helpers[i].type == type) {
                    return this.helpers[i];
                }
            }

            return null;
        },

        bindHelperValues: function(helper) {
            for (let component in helper) {
                if (helper[component].bind) {
                    helper[component].value = this.formatCurrency(this[helper[component].bind]);
                }
            }
        },

        helperHideAll: function(elementID) {
            if (!elementID) {
                this.currentHelperVisible = false;
            }

            $('.btn-helper-toggle').each(function() {
                if (!elementID || $(this).attr('id') != elementID) {
                    $(this).popover('hide');
                }
            });
        },

        helperShow: function(elementID, type, reference) {
            var helper = this.getHelper(type);
            this.currentHelper = helper;
            this.currentHelperReference = reference;

            if (!this.currentHelperVisible) {
                this.bindHelperValues(helper);
            }

            if (reference.value == null || isNaN(reference.value)) {
                helper.emitChange();
                this.calculate();
            }

            $('#'+ elementID).popover('toggle');
            this.currentHelperVisible = !this.currentHelperVisible;
            this.helperHideAll(elementID);
        },

        helperRegisterPopover: function(elementID, type) {
            var helper = this.getHelper(type);

            $('#'+ elementID).popover({
                title: this.getMessage(helper.title),
                html: true,
                content: $('#helper-' + type)
            });
        },

        helperEmitValue: function(value) {
            if (!value) return;
            this.currentHelperReference.value = this.formatCurrency(value);
            this.calculate();
        },

        deleteTransaction: function(transaction) {
            this.transactions.splice(transaction.absoluteIndex, 1);
            this.calculate();
        },

        addTransaction: function(type) {
            this.transactions.push(new Transaction(type));
            this.calculate();
        },

        // provide a function to output numbers with a fixed number of decimals
        formatCurrency: function(value) {
            return Math.round(value * this.factor) / this.factor;
        },

        getMessage: function(message) {
            var translation = message;

            translation = this.messages[message] || message;
            translation = translation[this.lang] || message;

            if (!this.messages[message] || this.messages[message] && !this.messages[message][this.lang]) {
                console.log('Missing Translation for "'+ message +'"');

                if (!this.messages[message]) {
                    this.messages[message] = {};
                }

                this.messages[message][this.lang] = message;
            }

            return translation +'';
        },

        toggleCalculationPopovers: function() {
            $('#contractContainer').popover('hide');
            $('#rateContainer').popover('hide');

            if (this.mode_calc_rate) {
                //if (this.hourly_rate == null || this.hourly_rate == 0 || this.daily_rate == null || this.daily_rate == 0) {
                    $('#contractContainer').popover('show');
                //}
            } else {
                //if (this.contract_hours == null || this.contract_hours == 0 || this.contract_days == null || this.contract_days == 0) {
                    $('#rateContainer').popover('show');
                //}
            }
        },

        calculate: function() {
            if (this.mode_calc_rate) {
                this.calculateDailyRate();
            } else {
                this.calculateOrderedDays();
            }

            this.toggleCalculationPopovers();
            this.saveValues();
        },

        calculateOrderedDays: function() {
            if (this.mode_calc_rate || isNaN(this.daily_rate) || this.daily_rate == 0)
                return;

            var daily_costs    = 0;
            var monthly_costs  = 0;
            var one_time_costs = 0;
            
            for (var i = 0; i < this.transactionsContract.length; i++) {
                var transaction = this.transactionsContract[i];

                switch (transaction.type) {
                    case transactionType.EXP_CONTRACT_OTHER_ONCE:
                    case transactionType.EXP_CONTRACT_TRAVEL:
                        one_time_costs += +transaction.value;
                        break;
                    case transactionType.EXP_CONTRACT_OTHER_MONTHLY:
                        monthly_costs += +transaction.value;
                        break;
                    case transactionType.EXP_CONTRACT_OTHER_PER_DAY:
                    case transactionType.EXP_CONTRACT_DAYOFFICE:
                    case transactionType.EXP_CONTRACT_HOTEL:
                        daily_costs += +transaction.value;
                        break;
                    default:
                        alert(this.getMessage('Unknown Contract Expenses: '+ transaction.type));
                        break;
                }
            }

            this.contract_days = this.formatCurrency((this.totalBruttoCosts + one_time_costs + (monthly_costs * this.contract_time)) / (this.daily_rate - daily_costs));
        },

        calculateDailyRate: function() {
            if (!this.mode_calc_rate || isNaN(this.contract_days) || this.contract_days == 0)
                return;

            var order_costs = 0;
            
            for (var i = 0; i < this.transactionsContract.length; i++) {
                var transaction = this.transactionsContract[i];

                switch (transaction.type) {
                    case transactionType.EXP_CONTRACT_OTHER_ONCE:
                    case transactionType.EXP_CONTRACT_TRAVEL:
                        order_costs += +transaction.value;
                        break;
                    case transactionType.EXP_CONTRACT_OTHER_MONTHLY:
                        order_costs += +transaction.value * this.contract_time;
                        break;
                    case transactionType.EXP_CONTRACT_OTHER_PER_DAY:
                    case transactionType.EXP_CONTRACT_DAYOFFICE:
                    case transactionType.EXP_CONTRACT_HOTEL:
                        order_costs += +transaction.value * this.contract_days;
                        break;
                    default:
                        alert(this.getMessage('Unknown Contract Expenses: '+ transaction.type));
                        break;
                }
            }

            this.daily_rate = this.formatCurrency((order_costs + this.totalBruttoCosts) / this.contract_days);
        }
    }
})