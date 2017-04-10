# WebUtils
WebUtils is an **lkpm** style LabKey module that provides client/web utilities.  That includes generic TypeScript classes, React components, JavaScript libraries, and Java actions.

### External Libraries
WebUtils bundles several useful JavaScript libraries:

- Bootstrap
  - Includes the following plugins:
    - [Awesome Bootstrap Checkbox](https://github.com/flatlogic/awesome-bootstrap-checkbox)
    - [Bootstrap Datepicker](https://github.com/Eonasdan/bootstrap-datetimepicker)
- c3
- d3
  - This is a newer version than the one that LabKey uses, and is needed for c3.  It can safely clobber LabKey's version of d3 in the global namespace.
- Font Awesome
- jQuery
  - LabKey also provides an earlier version of jQuery.  This can safely clobber LabKey's version in the global namespace.
  - Plugins:
    - [Block UI](http://malsup.com/jquery/block/)
    - [FullCalendar](https://fullcalendar.io/)
    - [Typeahead](https://twitter.github.io/typeahead.js/)
- [fetch](https://github.com/github/fetch)
- Moment.js
- Knockout
  - Plugins:
    - ko.punches
    - ko.mapping
- QuillJS
- QUnit
- React
  - Plugins:
    - React-Tabs
    
    
All of these libraries are exposed through the global namespace via their default variable names.  To include them on a page, include the following resources (these paths are relative to the context root path):

* `webutils/lib/externals-min.js`
* `webutils/css/webutils.css`

Due to the fact that Bootstrap's CSS conflicts with LabKey's by default, there are two bundles for Bootstrap:

* `webutils/css/bootstrap-bundle.css`
* `webutils/css/bootstrap-in-a-box.css`

`bootstrap-bundle` is the default Bootstrap css.  `bootstrap-in-a-box.css` is the same, except that all rules are scoped to only work in a `<div>`  with an **id** of `bootstrap-box`.  The boxed version should be used on any page that uses LabKey's default template, including the title bar, so that Bootstrap doesn't disturb the look of LabKey.  The use of an **id** ensures that Bootstrap is the most specific and wins out against LabKey's styling rules.  `bootstrap-bundle` should be used on any page that doesn't load the default LabKey CSS stylesheets.

Bootstrap and Font Awesome's fonts are located in `webutils/fonts` so that they are available for the appropriate stylesheets.  You shouldn't have to worry about referencing these directly.