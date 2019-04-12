/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
/* global nfErrorHandler, nfClient, nf */

nf.InheritComponentPolicy = (function () {

    var getComponentPolicyItems = function (getResonseDataURI, createdComponentData) {
        var actions = ["read", "write"];
        var resources = [getResonseDataURI, "/data" + getResonseDataURI];
        var action,resource;
        $.each(actions, function(actionIndex, actionValue)
        {            
            action=actionValue;
            $.each(resources, function(resourceIndex, resourceValue){
                resource=resourceValue;
                $.ajax({
                    type: 'GET',
                    url: '../dataintegration-api/policies/' + action + resource,
                    dataType: 'json',
                    async: false
                }).done(function (response) {
                    if (response.component.componentReference.id !== createdComponentData.component.id) 
                        createInheritedPolicy(action, resource, response.component.users, response.component.userGroups);
                }).fail(nf.ErrorHandler.handleAjaxError);
            });
        });
    };
    var getControllerPolicies = function (getResonseDataURI, createdComponentData) {
        var actions = ["read", "write"];
        var resources = [getResonseDataURI];
        var action,resource;
        $.each(actions, function(actionIndex, actionValue)
        {            
            action=actionValue;
            $.each(resources, function(resourceIndex, resourceValue){
                resource=resourceValue;
                $.ajax({
                    type: 'GET',
                    url: '../dataintegration-api/policies/' + action + '/controller',
                    dataType: 'json',
                    async: false
                }).done(function (response) {
                  if (response.component.id !== createdComponentData.component.id) 
                  createInheritedPolicy(action, resource, response.component.users, response.component.userGroups);
                }).fail(nf.ErrorHandler.handleAjaxError);
            });
        });
    };

    var createInheritedPolicy = function (action, resource, users, userGroups) {
       
        var entity = {
            'revision': nf.Client.getRevision({
                'revision': {
                    'version': 0
                }
            }),
            'component': {
                'action': action,
                'resource': resource,
                'users': users,
                'userGroups': userGroups
            }
        };

        $.ajax({
            type: 'POST',
            url: '../dataintegration-api/policies',
            data: JSON.stringify(entity),
            dataType: 'json',
            contentType: 'application/json'
        }).done(function (policyEntity) {
        }).fail(nf.ErrorHandler.handleAjaxError);
    };

   return{
        inheritComponentPolicy: function (componentName, createdComponentData) {
               if(componentName.startsWith("/controller-services")||componentName.startsWith("/reporting-tasks")){
                   getControllerPolicies(componentName, createdComponentData);
                  }
            else
                getComponentPolicyItems(componentName, createdComponentData);
        }
    };
}());
