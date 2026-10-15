module.exports = {
  packages: {

    '@ckeditor/ckeditor5-angular': {
      ignorableDeepImportMatchers: [
        /@ckeditor\//,
      ]
    },

    'ng2-ace-editor': {
      ignorableDeepImportMatchers: [
        /brace\//,
      ]
    },
    'ng5-slider': {
      ignorableDeepImportMatchers: [
        /ng5-slider\//,
      ]
    },
    'angular-vertical-timeline': {
      ignorableDeepImportMatchers: [
        /angular-vertical-timeline\//,
      ]
    },

  },
};
