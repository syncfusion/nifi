/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global nf, Slick */

nf.CreateComponentPolicy=(function (){
    
    var resetPolicyMessage = function () {
        $('#component-policy-message').text('').empty();
        $('#new-component-policy-message').hide();
        $('#override-component-policy-message').hide();
        $('#add-local-component-policy-admin-message').hide();
    };
    
    var resetPolicy=function (){
        resetPolicyMessage();
    };   

    
    var getResourceMessage = function (resource) {
        if (resource === '/policies') {
            return $('<span>Showing effective policy inherited from all policies.</span>');
        } else if (resource === '/controller') {
            return $('<span>Showing effective policy inherited from the controller.</span>');
        } else {
            // extract the group id
            var processGroupId = nf.Common.substringAfterLast(resource, '/');
            var processGroupName = processGroupId;

            // attempt to resolve the group name
            var breadcrumbs = nf.ng.Bridge.injector.get('breadcrumbsCtrl').getBreadcrumbs();
            $.each(breadcrumbs, function (_, breadcrumbEntity) {
                if (breadcrumbEntity.id === processGroupId) {
                    processGroupName = breadcrumbEntity.label;
                    return false;
                }
            });

            // build the mark up
            return $('<span>Showing effective policy inherited from Process Group </span>').append($('<span class="link"></span>').text(processGroupName).on('click', function () {
                // close the shell
                $('#shell-close-button').click();

                // load the correct group and unselect everything if necessary
                nf.CanvasUtils.enterGroup(processGroupId).done(function () {
                    nf.CanvasUtils.getSelection().classed('selected', false);

                    // inform Angular app that values have changed
                    nf.ng.Bridge.digest();
                });
            })).append('<span>.</span>');
        }
    };
    
    var populatePolicy = function (policyEntity) {
        var policy = policyEntity.component;        
        var resourceAndAction = getSelectedResourceAndAction();
        resetPolicyMessage();
        if (resourceAndAction.resource !== policy.resource) {            
            createPolicy(true);
        }
    };
    
    var getSelectedResourceAndAction = function () {
        var componentId = $('#selected-component-policy-id').text();
        var resource = $('#selected-component-policy-type').text();
        if(nf.Common.isDefinedAndNotNull(componentId)&&nf.Common.isDefinedAndNotNull(resource)&& componentId!==''&&resource!=='')
        {
            if (componentId !== '') {
                resource += ('/' + componentId);
            }
            resource='/' + resource;
        }else{
            resource=null;
        }        

        return {
            'action': $('#selected-component-policy-action').text(),
            'resource': resource
        };
    };
    
    var loadPolicy = function () {
        var resourceAndAction = getSelectedResourceAndAction();
        var policyDeferred;
        if(nf.Common.isDefinedAndNotNull(resourceAndAction.action)&&
                nf.Common.isDefinedAndNotNull(resourceAndAction.resource))
        {        
        if (resourceAndAction.resource.startsWith('/policies')) {
            policyDeferred = $.Deferred(function (deferred) {
                $.ajax({
                    type: 'GET',
                    url: '../dataintegration-api/policies/' + resourceAndAction.action + resourceAndAction.resource,
                    dataType: 'json'
                }).done(function (policyEntity) {

                    // ensure appropriate actions for the loaded policy
                    if (policyEntity.permissions.canRead === true) {
                        var policy = policyEntity.component;

                        // if the return policy is for the desired policy (not inherited, show it)
                        if (resourceAndAction.resource === policy.resource) {
                            // populate the policy details
                            populatePolicy(policyEntity);
                            $('#manage-component-policies-grid').data('policy',policyEntity);
                        } else {
                            // reset the policy
                            resetPolicy();

//                            // show an appropriate message
//                            $('#component-policy-message').text('No component specific administrators.');
//
//                            // we don't know if the user has permissions to the desired policy... show create button and allow the server to decide
//                            $('#add-local-component-policy-admin-message').show();
                            
                            createPolicy(false);
                        }
                    } else {
                        // reset the policy
                        resetPolicy();

//                        // show an appropriate message
//                        $('#component-policy-message').text('No component specific administrators.');
//
//                        // we don't know if the user has permissions to the desired policy... show create button and allow the server to decide
//                        $('#add-local-component-policy-admin-message').show();
                        
                        createPolicy(false);
                    }

                    deferred.resolve();
                }).fail(function (xhr, status, error) {
                    if (xhr.status === 404) {
                        // reset the policy
                        resetPolicy();

//                        // show an appropriate message
//                        $('#component-policy-message').text('No component specific administrators.');
//
//                        // we don't know if the user has permissions to the desired policy... show create button and allow the server to decide
//                        $('#add-local-component-policy-admin-message').show();
                        
                        createPolicy(false);

                        deferred.resolve();
                    } else if (xhr.status === 403) {
                        // reset the policy
                        resetPolicy();

                        // show an appropriate message
                        $('#component-policy-message').text('Not authorized to access the policy for the specified resource.');

                        deferred.resolve();
                    } else {
                        // reset the policy
                        resetPolicy();

                        deferred.reject();
                        nf.ErrorHandler.handleAjaxError(xhr, status, error);
                    }
                });
            }).promise();
        } else {
            policyDeferred = $.Deferred(function (deferred) {
                $.ajax({
                    type: 'GET',
                    url: '../dataintegration-api/policies/' + resourceAndAction.action + resourceAndAction.resource,
                    dataType: 'json'
                }).done(function (policyEntity) {
                    // return OK so we either have access to the policy or we don't have access to an inherited policy

                    // ensure appropriate actions for the loaded policy
                    if (policyEntity.permissions.canRead === true) {
                        // populate the policy details
                        populatePolicy(policyEntity);
                        $('#manage-component-policies-grid').data('policy',policyEntity);
                    } else {
                        // reset the policy
                        resetPolicy();

//                        // since we cannot read, the policy may be inherited or not... we cannot tell
//                        $('#component-policy-message').text('Not authorized to view the policy.');
//
//                        // allow option to override because we don't know if it's supported or not
//                        $('#override-component-policy-message').show();
                        
                        createPolicy(true);
                    }

                    deferred.resolve();
                }).fail(function (xhr, status, error) {
                    if (xhr.status === 404) {
                        // reset the policy
                        resetPolicy();

//                        // show an appropriate message
//                        $('#component-policy-message').text('No policy for the specified resource.');
//
//                        // we don't know if the user has permissions to the desired policy... show create button and allow the server to decide
//                        $('#new-component-policy-message').show();
                         
                         createPolicy(false);

                        deferred.resolve();
                    } else if (xhr.status === 403) {
                        // reset the policy
                        resetPolicy();

                        // show an appropriate message
                        $('#component-policy-message').text('Not authorized to access the policy for the specified resource.');

                        deferred.resolve();
                    } else {
                        resetPolicy();

                        deferred.reject();
                        nf.ErrorHandler.handleAjaxError(xhr, status, error);
                    }
                });
            }).promise();
        }
    }

        return policyDeferred;
    };
    
    var initCreateComponentPolicyDialog= function (){  
        $('#component-policies-combo-box').combo({
            options: [{
                text: 'view the component',
                value: 'read-component',
                description: 'Allows users to view component configuration details'
            }, {
                text: 'modify the component',
                value: 'write-component',
                description: 'Allows users to modify component configuration details'
            }, {
                text: 'view the data',
                value: 'read-data',
                description: 'Allows users to view metadata and content for this component through provenance data and flowfile queues in outbound connections'
            }, {
                text: 'modify the data',
                value: 'write-data',
                description: 'Allows users to empty flowfile queues in outbound connections and submit replays'
            }, {
                text: 'receive data via site-to-site',
                value: 'write-receive-data',
                description: 'Allows this port to receive data from these NiFi instances',
                disabled: true
            }, {
                text: 'send data via site-to-site',
                value: 'write-send-data',
                description: 'Allows this port to send data to these NiFi instances',
                disabled: true
            }, {
                text: 'view the policies',
                value: 'read-policies',
                description: 'Allows users to view the list of users who can view/modify this component'
            }, {
                text: 'modify the policies',
                value: 'write-policies',
                description: 'Allows users to modify the list of users who can view/modify this component'
            }],
            select: function (option) {
                    var resource = $('#selected-policy-item-type').text();

                    if (option.value === 'read-component') {
                        $('#selected-component-policy-action').text('read');
                    } else if (option.value === 'write-component') {
                        $('#selected-component-policy-action').text('write');
                    } else if (option.value === 'read-data') {
                        $('#selected-component-policy-action').text('read');
                        resource = ('data/' + resource);
                    } else if (option.value === 'write-data') {
                        $('#selected-component-policy-action').text('write');
                        resource = ('data/' + resource);
                    } else if (option.value === 'read-policies') {
                        $('#selected-component-policy-action').text('read');
                        resource = ('policies/' + resource);
                    } else if (option.value === 'write-policies') {
                        $('#selected-component-policy-action').text('write');
                        resource = ('policies/' + resource);
                    } else if (option.value === 'write-receive-data') {
                        $('#selected-component-policy-action').text('write');
                        resource = 'data-transfer/input-ports';
                    } else if (option.value === 'write-send-data') {
                        $('#selected-component-policy-action').text('write');
                        resource = 'data-transfer/output-ports';
                    }
                    
                    // set the resource
                    $('#selected-component-policy-type').text(resource);

                    // reload the policy
                    loadPolicy();
                }
            });
            
            $('#create-component-policies-dialog').modal({
            headerText: 'Add new policy',
            buttons: [{
                buttonText: 'Add',
                color: {
                    base: '#728E9B',
                    hover: '#004849',
                    text: '#ffffff'
                },
                handler: {
                    click: function () {
                        updatePolicy();
                    }
                }
            }, {
                buttonText: 'Cancel',
                color: {
                    base: '#E3E8EB',
                    hover: '#C7D2D7',
                    text: '#004849'
                },
                handler: {
                    click: function () {
                        $(this).modal('hide');
                    }
                }
            }],
            handler: {
                close: function () {
                }
            }
        });
    };
    
    var updatePolicy = function ()
    {
        var selectedItemName = $("#selected-account-name").text();
        var selectedItemType=$("#selected-account-type").text();
        var items;
        if (selectedItemType === 'user' )
        {
            items = $('#users-security-table').data('gridInstance').getData().getItems();
        }
        else
        {
            items = $('#usergroups-security-table').data('gridInstance').getData().getItems();
        }
        
        var selectedUser='';
        var selectedGroup='';
        $.each(items, function (_, item) {
            var itemCopy = item;
            if (itemCopy.component.identity === selectedItemName) {
                delete itemCopy.component.accessPolicies;
                delete itemCopy.uri;
                if (itemCopy.type === 'user') {
                    delete itemCopy.component.userGroups;
                    selectedUser = itemCopy;
                }
                else {
                    delete itemCopy.component.users;
                    selectedGroup = itemCopy;
                }
            }

            // remove the type as it was added client side to render differently and is not part of the actual schema
            delete itemCopy.type;
        });

        var currentEntity = $('#manage-component-policies-grid').data('policy');
        
        if (nf.Common.isDefinedAndNotNull(currentEntity)) {
            if(selectedUser !== null && selectedUser !== '' ) {
                currentEntity.component.users.push(selectedUser);
            }
            if(selectedGroup !== null && selectedGroup !== '') {
                currentEntity.component.userGroups.push(selectedGroup);
            }
            currentEntity.revision = nf.Client.getRevision(currentEntity);
        
            $.ajax({
                type: 'PUT',
                url: currentEntity.uri,
                data: JSON.stringify(currentEntity),
                dataType: 'json',
                contentType: 'application/json'
            }).done(function (policyEntity) {
                  nf.ComponentPolicy.refreshComponentPoliciesTable(selectedItemName,selectedItemType);
                  $('#create-component-policies-dialog').modal('hide');
            }).fail(function (xhr, status, error) {
                nf.ErrorHandler.handleAjaxError(xhr, status, error);
                resetPolicy();
                loadPolicy();
            }).always(function () {
                nf.Canvas.reload({
                    'transition': true
                });
            });
        } else {
            nf.Dialog.showOkDialog({
                headerText: 'Update Policy',
                dialogContent: 'No policy selected'
            });
        }  
    };
    
    var createPolicy = function (copyInheritedPolicy) {
        var resourceAndAction = getSelectedResourceAndAction();
        if(nf.Common.isDefinedAndNotNull(resourceAndAction.action)&&
                nf.Common.isDefinedAndNotNull(resourceAndAction.resource)) {
        var users = [];
        var userGroups = [];
        if (copyInheritedPolicy === true) {
            $.ajax({
                type: 'GET',
                url: '../dataintegration-api/policies/'+ resourceAndAction.action + resourceAndAction.resource,
                dataType: 'json',
                async:false
            }).done(function (currentEntity){
                users=currentEntity.component.users;
                userGroups=currentEntity.component.userGroups;
            });
        }

        var entity = {
            'revision': nf.Client.getRevision({
                'revision': {
                    'version': 0
                }
            }),
            'component': {
                'action': resourceAndAction.action,
                'resource': resourceAndAction.resource,
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
            // ensure appropriate actions for the loaded policy
            if (policyEntity.permissions.canRead === true) {
                // populate the policy details
                populatePolicy(policyEntity);
                $('#manage-component-policies-grid').data('policy',policyEntity);
            } else {
                // the request succeeded but we don't have access to the policy... reset/reload the policy
                resetPolicy();
                loadPolicy();
            }
        }).fail(nf.ErrorHandler.handleAjaxError);
                }
    };
    
    return {
        init: function (){
            initCreateComponentPolicyDialog();
        },
        
        OpenCreateComponentPoliciesDialog: function (){
            $('#selected-account-name').text($('#account-name').text());
            $('#selected-account-type').text($('#account-type').text());
            $('#create-component-policies-dialog').modal('show');
        },
        
        showComponentPolicy: function (selection) {
            
            var resource;
            var selectedComponent=$('#selected-policy-item-type').text();
            if(selectedComponent ==='controller-services' || selectedComponent === 'reporting-tasks'){
              $('#selected-component-policy-id').text($('#selected-policy-item-id').text());
                // disable site to site option and data option
                $('#component-policies-combo-box')
                    .combo('setOptionEnabled', {
                        value: 'write-receive-data'
                    }, false)
                    .combo('setOptionEnabled', {
                        value: 'write-send-data'
                    }, false)
                    .combo('setOptionEnabled', {
                        value: 'read-data'
                    }, false)
                    .combo('setOptionEnabled', {
                        value: 'write-data'
                    }, false);
              }
            else
            {
            if (selection.empty()) {
                $('#selected-component-policy-id').text(nf.Canvas.getGroupId());
                resource = 'process-groups';

                // disable site to site option
                $('#component-policies-combo-box')
                    .combo('setOptionEnabled', {
                        value: 'write-receive-data'
                    }, false)
                    .combo('setOptionEnabled', {
                        value: 'write-send-data'
                    }, false)
                    .combo('setOptionEnabled', {
                        value: 'read-data'
                    }, true)
                    .combo('setOptionEnabled', {
                        value: 'write-data'
                    }, true);
            } else {
                var d = selection.datum();
                $('#selected-component-policy-id').text(d.id);

                if (nf.CanvasUtils.isProcessor(selection)) {
                    resource = 'processors';
                } else if (nf.CanvasUtils.isProcessGroup(selection)) {
                    resource = 'process-groups';
                } else if (nf.CanvasUtils.isInputPort(selection)) {
                    resource = 'input-ports';
                } else if (nf.CanvasUtils.isOutputPort(selection)) {
                    resource = 'output-ports';
                } else if (nf.CanvasUtils.isRemoteProcessGroup(selection)) {
                    resource = 'remote-process-groups';
                } else if (nf.CanvasUtils.isLabel(selection)) {
                    resource = 'labels';
                } else if (nf.CanvasUtils.isFunnel(selection)) {
                    resource = 'funnels';
                }

                // enable site to site option
                $('#component-policies-combo-box')
                    .combo('setOptionEnabled', {
                        value: 'write-receive-data'
                    }, nf.CanvasUtils.isInputPort(selection) && nf.Canvas.getParentGroupId() === null)
                    .combo('setOptionEnabled', {
                        value: 'write-send-data'
                    }, nf.CanvasUtils.isOutputPort(selection) && nf.Canvas.getParentGroupId() === null)
                    .combo('setOptionEnabled', {
                        value: 'read-data'
                    }, !nf.CanvasUtils.isLabel(selection))
                    .combo('setOptionEnabled', {
                        value: 'write-data'
                    }, !nf.CanvasUtils.isLabel(selection));
            }
              }
            // populate the initial resource
            $('#selected-component-policy-type').text(resource);
            $('#component-policies-combo-box').combo('setSelectedOption', {
                value: 'read-component'
            });
            
            nf.CreateComponentPolicy.OpenCreateComponentPoliciesDialog();

            //return loadPolicy().always(showPolicy);
        }
    };
}());
