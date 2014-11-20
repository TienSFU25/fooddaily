var foodList = angular.module('foodList', []);

function foodListController($scope, $http) {
    $scope.formData = {};

    // when landing on the page, get all food list data and show them
    $http.get('/api/foodlist')
        .success(function(data) {
            $scope.list = data;
            console.log(data);
        })
        .error(function(data) {
            console.log('Error: ' + data);
        });

    // when submitting the add form, send the text to the node API
    $scope.addFood = function() {
        $http.post('/api/foodlist', $scope.formData)
            .success(function(data) {
                $scope.formData = {}; // clear the form so our user is ready to enter another
                $scope.list = data;
                console.log("THIS IS WHAT API/FOODLIST IS SENT:")
                console.log($scope.formData);
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
    };

    // delete a todo after checking it
    $scope.deleteFood = function(id) {
        $http.delete('/api/foodlist/' + id)
            .success(function(data) {
                $scope.list = data;
                console.log(data);
            })
            .error(function(data) {
                console.log('Error: ' + data);
           });
   };

}
