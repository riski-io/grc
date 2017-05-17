'use strict';
/* global angular */

angular.module('grcApp')


.constant('actionItemsStatuses', [
    'New',
    'In Progress',
    'Closed',
    'Abandoned',
    'Unresolved'
])

.constant('actionItemPriorities', [
    'High',
    'Normal',
    'Low'
])

.constant('WysiwygConfig', {
      toolbar: [
        ['edit',['undo','redo']],
        ['headline', ['style']],
        ['style', ['bold', 'italic', 'underline', 'superscript', 'subscript', 'strikethrough', 'clear']],
        ['fontface', ['fontname']],
        ['alignment', ['ul', 'ol', 'paragraph', 'lineheight']],
        ['height', ['height']],
        ['table', ['table']],
        ['insert', ['link','hr']],
        ['view', ['fullscreen', 'codeview']],
        ['help', ['help']]
      ]
})

.constant('notifyTemplate', 'app/notify.html');