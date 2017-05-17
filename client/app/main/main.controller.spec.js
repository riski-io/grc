'use strict';

describe('Component: mainComponent', function() {

  // load the controller's module
  beforeEach(module('grcApp'));
  beforeEach(module('stateMock'));

  var scope;
  var MainCtrl;
  var $httpBackend;
  var createController;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($injector) {
      $httpBackend = $injector.get('$httpBackend');
      var $rootScope = $injector.get('$rootScope');
      var $controller = $injector.get('$controller');
      createController = function() {
        return $controller('MainCtrl', {'$scope' : scope });
      };

      $httpBackend.expectGET('/build-version')
        .respond({
          'RISKI_BUILD_ID': 'd58d8fe61ba9202db84c9481f7c3efaef4b2bbd9',
        });

      $httpBackend.expectGET(/\/api\/users\/user-details\?cacheBuster=.*/)
        .respond({
          'userId': 'admin',
          'givenName': 'User',
          'familyName': 'Admin',
          'email': 'admin@example.com',
          'lastLoggedInAt': '2015-04-02T12:48:36.196Z',
          'role': 'admin',
          'provider': 'local',
          'orgMemberships': [],
          'actionItems': [{actionItemId: 'A-1'}, {actionItemId: 'A-2'}, {actionItemId: 'A-3'}, {actionItemId: 'A-4'}],
          'records': [{recordId: 'G-1', assessment: [{}, {}, {}]}, {recordId: 'G-2', assessment: [{}, {}]}, {recordId: 'G-3'}],
          'controls': [],
          'reviews': [{reviewId: 'R-1'}, {reviewId: 'R-2'}, {reviewId: 'R-3'}, {reviewId: 'R-4'}, {reviewId: 'R-5'}, {reviewId: 'R-6'}]
        });
      $httpBackend.expectGET('app/account/login/login.html')
        .respond('');
      scope = $rootScope.$new();
  }));

  it('should attach a list of things to the controller', function() {
    console.log("++++++++++++++++++++++++++++++++++++++++++++++");
    console.log(createController);
    var controller = createController();
    $httpBackend.flush();
    //expect(mainComponent.awesomeThings.length).to.equal(4);
  });
});

