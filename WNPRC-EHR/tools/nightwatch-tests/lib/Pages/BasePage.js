BasePage = function(config) {
    this.url = BASE_URL;
    this.elements = {};
    this.commands = [];
    this.sections = {};


    if ( ('relativeURL' in config) && (config.relativeURL != "") ) {
        this.url = this.url + config.relativeURL;
    }


    this.AddSection("login", {
        selector: 'div.auth-form',
        elements: {
            email: { selector: '#email' },
            password: { selector: '#password' },
            signInButton: { selector: '.auth-item a.labkey-button span' }
        }
    });

    this.AddSection("modal", {
        selector: '.x-window',
        elements: {
            okButton:     { selector: ".nightwatch-test-class-modal-button-ok"     },
            yesButton:    { selector: ".nightwatch-test-class-modal-button-yes"    },
            noButton:     { selector: ".nightwatch-test-class-modal-button-no"     },
            cancelButton: { selector: ".nightwatch-test-class-modal-button-cancel" },
            closeButton:  { selector: ".x-tool-close"                              }
        }
    });

    var bodyPanelElements = {};
    if ( ('bodyPanelElements' in config) ) {
        bodyPanelElements = config.bodyPanelElements;
    }
    this.AddSection('bodypanel', {
        selector: '#bodypanel',
        sections: bodyPanelElements
    });

    // Add the basic command set
    var BasicCommands = {
        login: function() {
            this.navigate().assert.title('Sign In');

            //this.expect.section('login').to.be.visible;

            var loginSection = this.section.login;
            loginSection.setValue('@email', 'jrichardson@primate.wisc.edu')
                    .setValue('@password', 'anduril')
                    .click('@signInButton');

            return this;
        },

        clickLink: function(selector, text) {
            var selector = 'a[href*="' + selector + '"]';

            this.waitForElementVisible(selector, 3000);

            if (typeof text != 'Undefined')
            {
                this.assert.containsText(selector, text);
            }

            this.click(selector);
            return this;
        }
    };
    this.AddCommandSet(BasicCommands);

};
BasePage.constructor = BasePage;

BasePage.prototype.AddCommand = function(name, functionCommand) {
    var commandObject = {
        name: functionCommand
    };

    this.commands.push(commandObject);
};

BasePage.prototype.AddCommandSet = function(commandSet) {
    this.commands.push(commandSet);
};

BasePage.prototype.AddElement = function(elementObj) {
    var keys = _.keys(elementObj);

    _.each(keys, function(key, index, list) {
        if (key in this.elements) {
            console.log('Replacing existing key "' + key + '" on page: ', this);
        }
        this.elements[key] = elementObj[key];
    }, this);
};

BasePage.prototype.AddSection = function(name, section) {
    this.sections[name] = section;
};

module.exports = BasePage;