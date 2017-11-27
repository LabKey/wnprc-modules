function registerLkInputTextArea(){
    ko.components.register('lk-input-textarea', {
        viewModel: {
            createViewModel: function(params, componentInfo) {
                var VM = {
                    input: params.inputData
                };

                return VM;
            }
        },
        template: {
            element: 'lk-input-textarea'
        }
    });
}