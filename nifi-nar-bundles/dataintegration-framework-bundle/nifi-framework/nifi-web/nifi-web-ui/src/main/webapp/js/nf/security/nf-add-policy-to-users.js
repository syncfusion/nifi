/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
*/

/* global nf, d3, Slick */
nf.AddPolicyToUsers = (function () {
    var addUserPoliciesDialog = function () {
        $('#add-policies-user-dialog').modal({
           headerText: 'Add Policies',
            buttons: [{
                    buttonText: 'Add',
                    color: {
                        base: '#728E9B',
                        hover: '#004849',
                        text: '#ffffff'
                    },
                        
                   handler: {
                        click: function () {
                            $('#add-policies-user-dialog').find("#loader-icon").css("display","block");
                            updatePolicy();
                            var selectedItemName = $('#selectItem').text();
                            var selectedItemType=$("#selectItemType").text();
                            nf.SecurityManagement.RefreshGlobalPoliciesGrid(selectedItemName,selectedItemType);
                            // hide the dialog
                            $('#add-policies-user-dialog').find("#loader-icon").css("display","none");
                            $('#add-policies-user-dialog').modal('hide');
                            nf.SecurityManagement.loadSecurityUsersTable();
                            nf.SecurityManagement.loadSecurityUserGroupsTable();
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
                          $('#add-policies-user-dialog').modal('hide');
                        }
                    }
                }]
        });
    };

    // policy type listing
    var UsersPoliciesCombo = function () {
        $('#manage-policy-type-list').combo({
           options: [
                nf.Common.getPolicyTypeListing('flow'),
                nf.Common.getPolicyTypeListing('controller'),
                nf.Common.getPolicyTypeListing('provenance'),
                nf.Common.getPolicyTypeListing('restricted-components'),
                nf.Common.getPolicyTypeListing('policies'),
                nf.Common.getPolicyTypeListing('tenants'),
                nf.Common.getPolicyTypeListing('configurations'),
                nf.Common.getPolicyTypeListing('site-to-site'),
                nf.Common.getPolicyTypeListing('system'),
                nf.Common.getPolicyTypeListing('proxy'),
                nf.Common.getPolicyTypeListing('counters')],
           select: function (option) {
                var initialized = true;
                if (initialized) {
                    $('#add-policy-selected-policy-type').text(option.value);

                    // if the option is for a specific component
                    if (option.value === 'controller' || option.value === 'counters' || option.value === 'policies' || option.value === 'tenants' || option.value === 'configurations') {
                        // update the policy target and let it relaod the policy
                        $('#actions-selection').combo('setSelectedOption', {
                           'value': 'read'
                        });
                        $('#actions-selection').removeClass("disable-element");
                        
                    } else {
                        $('#actions-selection').addClass("disable-element");

                        // record the action
                        if (option.value === 'proxy' || option.value === 'restricted-components') {
                            $('#add-policy-selected-policy-action').text('write');
                        } else {
                           $('#add-policy-selected-policy-action').text('read');
                        }
                        // reload the policy
                        loadPolicy();
                    }
                }
            }
        });
    };

    var ActionSelectionCombo = function () {
        $('#actions-selection').combo({
            options: [{
                    text: 'view',
                    value: 'read'
                }, {
                   text: 'modify',
                    value: 'write'
                }],
            select: function (option) {
                var initialized = true;
                if (initialized) {
                    // record the policy action
                   $('#add-policy-selected-policy-action').text(option.value);

                    // reload the policy
                    loadPolicy();
                }
            }
        });
   };    

   var loadPolicy = function () {
      var resourceAndAction = getSelectedResourceAndAction();
      var policyDeferred;
        if (resourceAndAction.resource.startsWith('/policies')) {
            $('#admin-policy-message').show();

            policyDeferred = $.Deferred(function (deferred) {
                $.ajax({
                    type: 'GET',
                    url: '../dataintegration-api/policies/' + resourceAndAction.action + resourceAndAction.resource,
                    dataType: 'json'
                }).done(function (policyEntity) {
                    // update the refresh timestamp
                    $('#policy-last-refreshed').text(policyEntity.generated);

                    // ensure appropriate actions for the loaded policy
                    if (policyEntity.permissions.canRead === true) {
                        var policy = policyEntity.component;

                        // if the return policy is for the desired policy (not inherited, show it)
                        if (resourceAndAction.resource === policy.resource) {
                            // populate the policy details
                            populatePolicy(policyEntity);
                            $('#manageuser-policies-table').data('policy', policyEntity);
                            $('#manage-policy-type-list').data('data-policyId', policyEntity.component.id); //setter 
                        } else {
                            // reset the policy
                            resetPolicy();
                            createPolicy(false);
//                            // show an appropriate message
//                            $('#policy-message').text('No component specific administrators.');
//
//                            // we don't know if the user has permissions to the desired policy... show create button and allow the server to decide
//                            $('#add-local-admin-message').show();
                        }
                    } else {
                        // reset the policy
                        resetPolicy();
                        createPolicy(false);

//                        // show an appropriate message
//                        $('#policy-message').text('No component specific administrators.');
//                      // we don't know if the user has permissions to the desired policy... show create button and allow the server to decide
//                        $('#add-local-admin-message').show();
                    }

                   deferred.resolve();
                }).fail(function (xhr, status, error) {
                    if (xhr.status === 404) {
                        // reset the policy
                       createPolicy(false);
                        deferred.resolve();
                   } else if (xhr.status === 403) {
                        // reset the policy
                        resetPolicy();
                        // show an appropriate message
                        $('#policy-message').text('Not authorized to access the policy for the specified resource.');
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
            $('#admin-policy-message').hide();

            policyDeferred = $.Deferred(function (deferred) {
                $.ajax({
                   type: 'GET',
                    url: '../dataintegration-api/policies/' + resourceAndAction.action + resourceAndAction.resource,
                    dataType: 'json'
                }).done(function (policyEntity) {
                    // return OK so we either have access to the policy or we don't have access to an inherited policy
                    // update the refresh timestamp
                   $('#policy-last-refreshed').text(policyEntity.generated);

                    // ensure appropriate actions for the loaded policy
                    if (policyEntity.permissions.canRead === true) {
                        // populate the policy details
                        populatePolicy(policyEntity);
                        $('#manageuser-policies-table').data('policy', policyEntity);
                        $('#manage-policy-type-list').data('data-policyId', policyEntity.component.id); //setter 
                    } else {
                        // reset the policy
                        resetPolicy();

//                        // since we cannot read, the policy may be inherited or not... we cannot tell
//                        $('#policy-message').text('Not authorized to view the policy.');
//
//                        // allow option to override because we don't know if it's supported or not
//                        $('#override-policy-message').show();
                        createPolicy(true);
                    }

                    deferred.resolve();
                }).fail(function (xhr, status, error) {
                    if (xhr.status === 404) {
                        
                        createPolicy(false);

                    } else if (xhr.status === 403) {
                        // reset the policy
                        resetPolicy();

                        // show an appropriate message
                        $('#policy-message').text('Not authorized to access the policy for the specified resource.');

                        deferred.resolve();
                    } else {
                        resetPolicy();

                        deferred.reject();
                      nf.ErrorHandler.handleAjaxError(xhr, status, error);
                    }
                });
            }).promise();
        }

        return policyDeferred;
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
        var resource = $('#add-policy-selected-policy-type').text();
        var action=$('#add-policy-selected-policy-action').text();
        return {
            'action': action,
            'resource': '/' + resource
        };
    };
    var resetPolicyMessage = function () {
        $('#policy-message').text('').empty();
        $('#new-policy-message').hide();
        $('#override-policy-message').hide();
        $('#add-local-admin-message').hide();
    };


        var createPolicy = function (copyInheritedPolicy) {
        var resourceAndAction = getSelectedResourceAndAction();

        var users = [];
        var userGroups = [];
        if (copyInheritedPolicy === true) {
            var policyGrid = $('#policy-table').data('gridInstance');
            var policyData = policyGrid.getData();

            var items = policyData.getItems();
            $.each(items, function (_, item) {
                var itemCopy = $.extend({}, item);

                if (itemCopy.type === 'user') {
                    users.push(itemCopy);
                } else {
                    userGroups.push(itemCopy);
                }

                // remove the type as it was added client side to render differently and is not part of the actual schema
                delete itemCopy.type;
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
                $('#manageuser-policies-table').data('policy', policyEntity);
                $('#manage-policy-type-list').data('data-policyId', policyEntity.component.id);
            } else {
                // the request succeeded but we don't have access to the policy... reset/reload the policy
                resetPolicy();
                loadPolicy();
            }
        }).fail(nf.ErrorHandler.handleAjaxError);
    };

    var resetPolicy = function () {
        resetPolicyMessage();

        // reset button state
        $('#delete-policy-button').prop('disabled', true);
        $('#new-policy-user-button').prop('disabled', true);
        // reset the current policy
        $('#policy-table').removeData('policy');

        // populate the table with no users
       populateTable([], []);
    };

   var populateTable = function (users, userGroups) {
        var policyGrid = $('#policy-table').data('gridInstance');
       var policyData = policyGrid.getData();

        // begin the update
        policyData.beginUpdate();
       var policyUsers = [];

        // add each user
        $.each(users, function (_, user) {
            policyUsers.push($.extend({
                type: 'user'
            }, user));
        });

       // add each group
        $.each(userGroups, function (_, group) {
            policyUsers.push($.extend({
                type: 'group'
            }, group));
        });

        // set the rows
        policyData.setItems(policyUsers);

        // end the update
        policyData.endUpdate();

        // re-sort and clear selection after updating
        policyData.reSort();
        policyGrid.invalidate();
        policyGrid.getSelectionModel().setSelectedRows([]);
    };

    var updatePolicy = function () {
        var usersGrid;
        var selectedItem = $("#selectItem").text();
        var selectedItemType=$("#selectItemType").text();
        var accountData;
        if (selectedItemType === 'user')
        {
            usersGrid = $('#users-security-table').data('gridInstance');
            accountData = usersGrid.getData();
        }
        else
        {
            //for user group
            usersGrid = $('#usergroups-security-table').data('gridInstance');
            accountData = usersGrid.getData();
        }

        var selectedUser='';
        var selectedGroup='';
        var items = accountData.getItems();
        $.each(items, function (_, item) {
            var itemCopy = $.extend({}, item);

            if (itemCopy.component.identity === selectedItem) {
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

        var currentEntity = $('#manageuser-policies-table').data('policy');
        
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
            }).done(function () {
                var selectedItemName = $('#selectItem').text();
                var selectedItemType=$("#selectItemType").text();
                nf.SecurityManagement.RefreshGlobalPoliciesGrid(selectedItemName,selectedItemType);
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
    
    return{
        init: function () {
            addUserPoliciesDialog();
            UsersPoliciesCombo();
            ActionSelectionCombo();

            $('#add-policy-user-button').on('click', function () {
                var name = $('#policies-dialog-user-name').html();
                var type=$('#policies-setting-name').html();
                $('#selectItem').text(name);
                $('#selectItemType').text(type);
                $('#add-policies-user-dialog').modal('show');
                
            });
        }
    };
}());
