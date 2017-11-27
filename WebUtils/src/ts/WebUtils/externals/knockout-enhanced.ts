import * as assert from 'assert';
import * as ko from 'knockout';

// import and enable the punches plugin (for the view model binding)
import 'knockout.punches';
assert.doesNotThrow(() => ko.punches.enableAll(), 'knockout.punches did not load correctly');

// import the mapping plugin
import * as koMapping from 'knockout.mapping';
(<any>ko).mapping = koMapping;
assert.ok(ko.mapping, 'knockout.mapping did not load correctly');

export default ko;