WebUtils.Models.Chain = Classify.newClass({
    constructor: function(config) {
        this.curStep = ko.observable(0);
        this.curStepDescription = ko.observable();

        this.chain = config.links;
    },
    methods: {
        chainLength: function() {
            return this.chain.length;
        },
        execute: function() {
            var self = this;
            this.curStep(0);

            var chain = this.chain.map(function(link){
                return function(data) {
                    self.curStepDescription(link.name);
                    console.log("Executing: " + link.name + " (" + (self.percentDone()*100) + "%) with data: ", data);
                    return link.executable(data).then(function(data){
                        self.curStep(self.curStep() + 1);
                        return Promise.resolve(data);
                    });
                }
            });

            var curPromise = chain.shift().call();
            $.each(chain, function(index, link) {
                curPromise = curPromise.then(link);
            });

            return curPromise;
        }
    },
    computeds: {
        percentDone: function() {
            return (this.curStep() / this.chainLength());
        }
    }
});