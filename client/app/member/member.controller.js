'use strict';
/* global angular */

angular.module('grcApp')

.controller('MemberCtrl', function ($scope) {
    $scope.isLoading = true;
})
.controller('MemberInviteCtrl', function ($scope, RestService, authService , spinner, Users, $http) {
    spinner.startSpinner();
    $scope.invitation = {};
    $scope.userLoaded = false;
    authService.getCurrentUser().then(function(user){
        $scope.userLoaded = true;
        $scope.permissionAccess = true;
        if (user.role === 'manager'){
            RestService.unitByUser.query({ id: user._id }, function (results) {
                $scope.orgUnits = results;
                spinner.stopSpinner();
            });
        } else if (user.role === 'admin') {
            RestService.unit.query({}, function (results) {
                $scope.orgUnits = results;
                spinner.stopSpinner();
            });
        } else {
            spinner.stopSpinner();
            $scope.permissionAccess = false;
        }
    });
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
  $scope.sendInvitation = function (form) {
    $scope.submitted = true;
    if (form.$valid) {
        $scope.submitted = false;
        spinner.startSpinner();
        $scope.errorMessages = '';
        $scope.warnings = '';
        RestService.invitation.save({orgUnitId : $scope.invitation.orgUnit.orgUnitId}, {invitation :$scope.invitation}, function(res) {
          var errEmails = _.union(res.invalidEmails ,res.emailErrors);
          var message = '';
          if (errEmails.length) {
            //$scope.type = 'alert-danger';
            _.forEach(errEmails , function (err) {
                message += err + '</br>';
            });
            $scope.errorMessages = message;
            return spinner.stopSpinner();
          }
          if (res.warnings.length) {
            //$scope.type = 'alert-success';
            message = '';
            _.forEach(res.warnings , function (warning) {
              message += warning + '</br>';
            });
            $scope.warnings = message;
          }
          $scope.selectedUser = '';
          $('#userSearch').val('');
          $scope.invitation = {
            role : 'member',
            recipients : []
          };
          spinner.stopSpinner();
        }, function(){
          $scope.invitation = {
            role : 'member',
            recipients : []
          };
          //$scope.type = 'alert-danger';
          //$scope.message = 'Invitation could not be sent, please try again later';
          spinner.stopSpinner();
        });
    }
  };
})

.controller('MemberViewCtrl', function ($scope, $stateParams, $state, UserDetails, authService, RestService, $filter, spinner, Member, notify, notifyTemplate, dialogs) {
    $scope.invitation = {};
    $scope.isEditPosition = false;
    var currentUserRole = '';
    $scope.defaultOrgUnit = null;
    if ( $stateParams.userId  && $stateParams.userId !== 'new' ) {
        $scope.member = UserDetails.get({ id: $stateParams.userId }, function (res) {
            $scope.isLoading = false;
            currentUserRole = res.role;
            if ($scope.member.orgMemberships && $scope.member.orgMemberships.length) {
              for (var i = 0; i < $scope.member.orgMemberships.length; i++) {
                if ($scope.member.orgMemberships[i].orgUnitId === $scope.member.defaultOrgUnit) {
                  $scope.defaultOrgUnit = $scope.member.orgMemberships[i];
                }
              }
              if (!$scope.defaultOrgUnit) {
                $scope.defaultOrgUnit = $scope.member.orgMemberships[0];
              }
            }
        }, function(error){
            $scope.isLoading = false;
            $scope.type = 'alert-danger';
            $scope.message = 'User details API error';
        });
    }

    $scope.removeNonMemberOrgs = function(item) {
      return item.role;
    };

    authService.getCurrentUser().then(function(user){
      $scope.userLoaded = true;
      $scope.permissionAccess = true;
      if (user.role === 'manager'){
        RestService.unitByUser.query({ id: user._id }, function (results) {
          $scope.orgUnits = results;
        });
      } else if (user.role === 'admin') {
        RestService.unit.query({}, function (results) {
          $scope.orgUnits = results;
        });
      } else {
        $scope.permissionAccess = false;
      }
    });

    $scope.sendInvitation = function (form) {
      $scope.submitted = true;
      $scope.invitation.recipients = [];
      $scope.invitation.recipients.push($scope.member.email);
      if (form.$valid) {
        spinner.startSpinner();
        $scope.submitted = false;
        RestService.invitation.save({orgUnitId : $scope.invitation.orgUnit.orgUnitId}, {invitation :$scope.invitation}, function() {
            spinner.stopSpinner();
            notify({
                message:'Invitation has been sent successfully',
                classes: 'alert-success',
                templateUrl: notifyTemplate
            });
            delete $scope.invitation.role;
            delete $scope.invitation.orgUnit;
          }, function(err){
            spinner.stopSpinner();
            notify({
                message:'Invitation could not be sent, please try again later',
                classes: 'alert-danger',
                templateUrl: notifyTemplate
            });
          });
      }
    };

    $scope.removeMembership = function (orgUnit, userId, role) {
      if (window.confirm('Are you sure you want to remove the user?') === false) {
        return;
      }
      spinner.startSpinner();
      RestService.unit.update({orgUnitId : orgUnit.orgUnitId , userId : userId , role : $filter('lowercase')(role)}, function() {
        var index = $scope.member.orgMemberships.indexOf(orgUnit);
        if (index > - 1){
          $scope.member.orgMemberships.splice(index, 1);
        }
        spinner.stopSpinner();
      });
    };

    $scope.updateDefaultOrg = function(user){
        spinner.startSpinner();
        Member.update({ id: user._id }, { defaultOrgUnit : $scope.defaultOrgUnit.orgUnitId, role : user.role , userId : user._id}, function () {
            $scope.isEditDefaultOrg = false;
            spinner.stopSpinner();
            notify({
                message:'Default org unit has been successfully updated',
                classes: 'alert-success',
                templateUrl: notifyTemplate
            });
        }, function(){
            $scope.isEditDefaultOrg = false;
            spinner.stopSpinner();
            notify({
                message:'Error in updating default org unit, please try again later',
                classes: 'alert-danger',
                templateUrl: notifyTemplate
            });
        });
    };

    $scope.updatePosition = function(user){
        spinner.startSpinner();
        Member.update({ id: user._id }, {role : user.role , userId : user._id}, function () {
            $scope.isEditPosition = false;
            currentUserRole = user.role;
            spinner.stopSpinner();
            notify({
                message:'User position has been successfully updated',
                classes: 'alert-success',
                templateUrl: notifyTemplate
            });
        }, function(error){
            $scope.isEditPosition = false;
            spinner.stopSpinner();
            notify({
                message:'User details API error',
                classes: 'alert-danger',
                templateUrl: notifyTemplate
            });
        });
    };

    $scope.cancelUpdatePosition = function(){
        $scope.member.role = currentUserRole;
        $scope.isEditPosition = false;
    };

    $scope.editMembership = function(orgUnit, user){
      var dialog = dialogs.create('app/member/member.edit.membership.dialog.html', 'editMembershipDialogCtrl', {orgUnit: orgUnit, user: user}, {size: 'md', keyboard: false, backdrop: true});
      dialog.result.then(function(orgUnit) {
        var updatedOrgUnit = _.find($scope.member.orgMemberships, function(item) {
          return item.orgUnitId === orgUnit.orgUnitId;
        });
        updatedOrgUnit.role = orgUnit.role;
        spinner.stopSpinner();
      });
    };
})

.controller('MembershipRequestCtrl', function($scope, spinner, $http, $timeout) {
    $scope.requests = [];
    $scope.isLoading = true;
    spinner.startSpinner();
    $http.get('/api/organisation-units/invitations')
    .success(function (data) {
      $scope.requests = data;
      $scope.isLoading = false;
      spinner.stopSpinner();
    })
    .error(function () {
      $scope.isLoading = false;
      spinner.stopSpinner();
    });

    $scope.approve = function (request) {
      spinner.startSpinner();
      $http.get('/api/organisation-units/invitations/approve/'+request.invitationId)
      .success(function () {
        $scope.requests = _.without($scope.requests , request);
        $scope.message = 'Request Approved Successfully';
        $scope.type = 'alert-success';
        $timeout(function() {
            $scope.message = '';
            $scope.type = '';
        }, 5000);
        spinner.stopSpinner();
      })
      .error(function () {
        $scope.message = 'Error in approving the request, please try again later';
        $scope.type = 'alert-error';
        $timeout(function() {
            $scope.message = '';
            $scope.type = '';
        }, 5000); 
        spinner.stopSpinner();
      });
    };
})

.controller('editMembershipDialogCtrl', function($scope, $uibModalInstance, data, $filter, RestService, ChangeMembershipRole, spinner) {
    $scope.orgUnit = data.orgUnit;
    $scope.user = data.user;

    $scope.orgUnit.role = $filter('lowercase')($scope.orgUnit.role);

    $scope.updateMembershipRole = function(){
      if ($scope.orgUnit.role === $scope.orgUnit.newRole){
        $scope.type = 'alert-warning';
        $scope.message = 'New and old roles are the same. If you don\'t want change role, please click on cancel.';
        return;
      }
      spinner.startSpinner();
      ChangeMembershipRole.update({userId : $scope.user._id, orgUnitId : $scope.orgUnit.orgUnitId}, {oldRole : $scope.orgUnit.role, newRole : $scope.orgUnit.newRole}, function() {
        $scope.orgUnit.role = $scope.orgUnit.newRole;
        delete $scope.orgUnit.newRole;
        $uibModalInstance.close($scope.orgUnit);
      });
    };

    $scope.cancel = function() {
      $uibModalInstance.dismiss();
    };
})

.controller('MemberListCtrl', function ($scope, $state, $filter, User, DTOptionsBuilder, DTColumnDefBuilder) {
  $scope.isLoading = true;
  $scope.dtOptions = DTOptionsBuilder.newOptions()
    .withPaginationType('full_numbers')
    .withBootstrap();

  User.listAll(function (users) {
    $scope.users = users;
    $scope.isLoading = false;
  }, function(){
    $scope.isLoading = false;
    $scope.type = 'alert-danger';
    $scope.message = 'Get users list return error. Please contact administrator.';
  });

  $scope.goToUser = function(userId) {
      $state.go('member.view', { userId: userId });
  };

});