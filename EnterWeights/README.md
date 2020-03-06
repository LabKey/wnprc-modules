# Enter Weights module

## Building the module

Install the dependencies

`npm install`

Build it

`npm run-script build`

Also, `./gradlew deployApp` from the labkey root will install and build it as well.

## Testing the module

Currently, most of the functionality is tested via [selenium](https://www.labkey.org/Documentation/wiki-page.view?name=gradleSelenium); see the [seleinum WNPRC doc](https://github.com/WNPRC-EHR-Services/EHR_Documentation/blob/master/notes/SeleniumTesting.md) for internal notes.

Run the `WNPRC_EHRTest` selenium test:
`./gradlew :server:test:uiTests -Ptest=wnprc_ehrtest -Pselenium.firefox.binary=/Applications/Firefox45.app/Contents/MacOS/firefox`

There are some jest test to test a few functions, run from the module directory:

`jest test`

## Functionality
* Submit all action to submit all records into the weights and restraints datasets
* Submit for review action to assign the task to someone for review
* Save draft option to save progress
* Sliding animal info pane that shows animal demographics
* Bulk edit ability for all fields
* Ability to enter multiple rooms in bulk add
* Basic warning/validation for weights

## Implementation details
* ReactJS 16.8.1
* Typescript 3.3
* See the `package.json` file for a complete list of dependencies
