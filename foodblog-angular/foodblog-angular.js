Tasks = new Mongo.Collection("tasks");

if (Meteor.isClient) {
  angular.module("simple-todos", ['angular-meteor']);

  angular.module("simple-todos").controller("TodosListCtrl", ['$scope', '$meteor',
    function($scope, $meteor){

      $scope.tasks = $meteor.collection(function() {
        return Tasks.find($scope.getReactively('query'), {sort: {createdAt: -1}})
      });

      $scope.addTask = function(newTask) {
        $meteor.call("addTask", newTask);
      };

      $scope.deleteTask = function(task) {
        $meteor.call("deleteTask", task._id);
      };

      $scope.setChecked = function(task) {
        $meteor.call("setChecked", task._id, !task.checked);
      };

      $scope.$watch('hideCompleted', function() {
        if ($scope.hideCompleted)
          $scope.query = {checked: {$ne: true}};
        else
          $scope.query = {};
      });

      $scope.incompleteCount = function() {
        return Tasks.find({ checked: {$ne: true} }).count();
      };

    }]);

  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });
  
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}

Meteor.methods({
  addTask: function(text) {
    if (!Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }

    Tasks.insert({
      text: text,
      createdAt: new Date(),
      owner: meteor.userId(),
      username: Meteor.user().username
    });
  },
  deleteTask: function(taskId) {
    Tasks.remove(taskId);
  },
  setChecked: function(taskId, setChecked) {
    Tasks.update(taskId, {$set: {checked: setChecked}});
  }
});
