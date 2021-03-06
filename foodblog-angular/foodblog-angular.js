Tasks = new Mongo.Collection("tasks");

if (Meteor.isClient) {
  angular.module("simple-todos", ['angular-meteor']);

  angular.module("simple-todos").controller("TodosListCtrl", ['$scope', '$meteor',
    function($scope, $meteor){

      $scope.$meteorSubscribe("tasks");

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

      $scope.setPrivate = function(task) {
        $meteor.call("setPrivate", task._id, ! task.private); 
      };

    }]);

  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });
  
}

if (Meteor.isServer) {
  Meteor.startup(function () {
  });

  Meteor.publish("tasks", function() {
    return Tasks.find({
      $or: [
        { private: {$ne: true} },
        { owner: this.userId }
      ]
    });
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
      owner: Meteor.userId(),
      username: Meteor.user().username
    });
  },
  deleteTask: function(taskId) {
    var task = Tasks.findOne(taskId);
    if (task.private && task.owner !== Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }
    
    Tasks.remove(taskId);
  },
  setChecked: function(taskId, setChecked) {
    var task = Tasks.findOne(taskId);
    if (task.private && task.owner !== Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }

    Tasks.update(taskId, {$set: {checked: setChecked}});
  },
  setPrivate: function(taskId, setToPrivate) {
    var task = Tasks.findOne(taskId);
    if (task.owner !== Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }

    Tasks.update(taskId, {$set: {private: setToPrivate}});
  }
});
