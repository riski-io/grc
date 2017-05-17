'use strict';
/* global alert*/
/* global async*/
angular.module('grcApp').controller('HierarchyCtrl', function(dialogs, $timeout, RestService, $scope, spinner, Users, OrgUnits, $http, $state) {
  spinner.startSpinner();
  function buildTree(array, parent, tree) {

    tree = typeof tree !== 'undefined' ? tree : [];
    parent = typeof parent !== 'undefined' ? parent : {orgUnitId: undefined};

    var children = _.filter(array, function(child) {
      return child.parent === parent.orgUnitId;
    });

    if (!_.isEmpty(children)) {
      if (!parent.orgUnitId) {
        tree = children;
      } else {
        parent.items = children || [];
      }
      _.each(children, function(child) {
        buildTree(array, child);
      });
    } else {
      parent.items = [];
    }

    return tree;
  }

  RestService.unit.query({}, function(result) {
    spinner.stopSpinner();
    if (result && result.length) {
      $scope.list = buildTree(result);
    }
  });
  $scope.users = Users.getAllUsers();

  $scope.removeItem = function(scope) {
    var orgUnit = scope.$modelValue;
    var orgUnitId = orgUnit.orgUnitId;
    var orgName = orgUnit.orgName;
    var orgDetails = {};
    var bDelete = true;
    if (orgUnit.items && orgUnit.items.length > 0) {
      return alert(orgName + ' is associated with one or more child organisation units, Please make sure there are no child org. units attached.');
    }
    spinner.startSpinner();
    async.parallel([
      function(cb){
        var url = '/api/governance-records/filter/' + orgUnitId;
        OrgUnits.getEntities(url, { children: [] }, function (records) {
          orgDetails.records = records;
          if (records && records.length) {
            bDelete = false;
          }
          cb();
        }, function () {
          //
          cb();
        });
      },
      function(cb){
        var url = '/api/controls/filter/' + orgUnitId;
        OrgUnits.getEntities(url, { children: [] }, function (controls) {
          orgDetails.controls = controls;
          if (controls && controls.length) {
            bDelete = false;
          }
          cb();
        }, function () {
          cb();
        });
      },
      function(cb){
        var url = '/api/reviews/filter/' + orgUnitId;
        OrgUnits.getEntities(url, { children: [] }, function (reviews) {
          orgDetails.reviews = reviews;
          if (reviews && reviews.length) {
            bDelete = false;
          }
          cb();
        }, function () {
          cb();
        });
      },
      function(cb){
        var url = '/api/action-items/filter/' + orgUnitId;
        OrgUnits.getEntities(url, { children: [] }, function (actionItems) {
          orgDetails.actionItems = actionItems;
          if (actionItems && actionItems.length) {
            bDelete = false;
          }
          cb();
        }, function () {
          cb();
        });
      },
    ], function () {
      spinner.stopSpinner();
      if (!bDelete) {
        alert(orgName + ' is not allowed to remove , as it owns one or more records/controls/reviews/action items.');
      }else{
        var dialog = dialogs.create('app/confirm/confirm.html', 'CustomConfirmDialogCtrl', {}, {size: 'md', keyboard: true, backdrop: true});
        dialog.result.then(function(result) {
          if (result) {
            RestService.unit.remove({orgUnitId: scope.$modelValue.orgUnitId}, function() {
              scope.remove();
              spinner.stopSpinner();
              delete $scope.orgUnitToView;
              $state.go($state.current, {}, {reload: true});
            });
          }
        });
      }
    });
  };
  $scope.toggle = function(scope) {
    scope.toggle();
  };

  $scope.newSubItem = function(scope) {
    var nodeData = {
      items: [],
      parent: undefined
    };
    var nodeScope;
    if (scope) {
      if (!scope.$modelValue.items) {
        scope.$modelValue.items = [];
      }
      nodeScope = scope.$modelValue.items;
      nodeData.parent = scope.$modelValue.orgUnitId;
    } else {
      nodeScope = $scope.list;
    }
    var dialog = dialogs.create('app/admin/org.hierarchy/hierarchy.edit.dialog.html', 'EditHierarchyItemDialogCtrl', {node: nodeData}, {size: 'md', keyboard: true, backdrop: true});
    dialog.result.then(function(result) {
      nodeScope.push(result);
      $state.go($state.current, {}, {reload: true});
    });
  };

  $scope.viewItem = function (nodeScope) {
    spinner.startSpinner();
    var orgUnitId = nodeScope.$modelValue.orgUnitId;
    RestService.unit.get({orgUnitId : orgUnitId}, function(unit) {
      if (unit) {
        $scope.orgUnitToView = unit;
        $scope.invitation = {
          orgUnit : unit,
          role: 'member'
        };
      }
      spinner.stopSpinner();
    });
  };

  $scope.removeUser = function (orgUnitId, userId, role) {
    if (window.confirm('Are you sure you want to remove the user?') === false) {
        return;
    }
    spinner.startSpinner();
    RestService.unit.update({orgUnitId : orgUnitId , userId : userId , role : role}, function() {
      var key = role === 'manager'? 'managerList' : 'memberList';
      $scope.orgUnitToView[key] = _.filter($scope.orgUnitToView[key], function(user) {
        return user._id !== userId;
      });
      spinner.stopSpinner();
    }); 
  };

  $scope.roles = [
    {key: 'member', value: 'Member'},
    {key: 'manager', value: 'Manager'}
  ];

  $scope.searchUsers = function (name) {
    if (name && name.length > 1) {
      $scope.loading = true;
      return $http.get('/api/users/search/' + name).then(function(res) {
        var users = [];
        angular.forEach(res.data, function(item) {
          users.push(item);
        });
        $scope.loading = false;
        return users;
      }, function () {
        $scope.loading = false;
      });
    }
  };

  $scope.setReceipient = function (user) {
    $scope.invitation.recipients = [user.email];
  };

  $scope.inviteUser = function (orgUnitId) {
    spinner.startSpinner();
    $scope.errorMessages = '';
    $scope.warnings = '';
    RestService.invitation.save({orgUnitId : orgUnitId}, {invitation :$scope.invitation}, function(res) {
      var errEmails = _.union(res.invalidEmails ,res.emailErrors);
      var message = '';
      if (errEmails.length) {
        //$scope.type = 'alert-danger';
        _.forEach(errEmails , function (err) {
            message += err + '</br>';
        });
        $scope.errorMessages = message;
      }
      if (res.warnings.length) {
        //$scope.type = 'alert-success';
        message = '';
        _.forEach(res.warnings , function (warning) {
          message += warning + '</br>';
        });
        $scope.warnings = message;
        $scope.invitation.recipients = [];
        delete $scope.invitation.role;
      }
      spinner.stopSpinner();
    }, function(){
      //$scope.type = 'alert-danger';
      //$scope.errormessage = 'Invitation could not be sent, please try again later';
      spinner.stopSpinner();
    }); 
  };
  $scope.editItem = function(nodeScope) {
    var dialog = dialogs.create('app/admin/org.hierarchy/hierarchy.edit.dialog.html', 'EditHierarchyItemDialogCtrl', {node: nodeScope.$modelValue}, {size: 'md', keyboard: true, backdrop: true});
    dialog.result.then(function(result) {
      $timeout(function() {
        angular.copy(result, nodeScope.$modelValue);
      });
    });
  };

  $scope.options = {
    dropped: function(event) {
      var sourceNode = event.source.nodeScope;
      var destNodes = event.dest.nodesScope;
      if (!destNodes.isParent(sourceNode)) {
        spinner.startSpinner();
        RestService.unit.update({orgUnitId: sourceNode.$modelValue.orgUnitId}, {parent: destNodes.$parent.$modelValue ? destNodes.$parent.$modelValue.orgUnitId : null}, function() {
          sourceNode.$modelValue.parent = destNodes.$parent.$modelValue ? destNodes.$parent.$modelValue.orgUnitId : undefined;
          spinner.stopSpinner();
        });
      }
    }
  };
});

angular.module('grcApp').controller('EditHierarchyItemDialogCtrl', function(spinner, $scope, $uibModalInstance, RestService, $timeout, data) {
  $scope.node = angular.copy(data.node);
  $scope.isEdit = !!data.node.orgUnitId;

  $scope.cancel = function() {
    $uibModalInstance.dismiss();
  };
  $scope.save = function() {
    spinner.startSpinner();
    var handleSuccess = function(result) {
      $scope.type = 'alert-success';
      $scope.message = 'Hierarchy item successfuly saved';
      $timeout(function() {
        $uibModalInstance.close(result);
        spinner.stopSpinner();
      }, 2000);
    };
    var handleFail = function() {
      $scope.type = 'alert-danger';
      $scope.message = 'Cant update hierarchy item. Please try again later.';
      spinner.stopSpinner();
    };
    var node = new RestService.unit($scope.node);
    if ($scope.isEdit) {
      node.$update(handleSuccess, handleFail);
    } else {
      node.$save({}, handleSuccess, handleFail);
    }
  };
});
