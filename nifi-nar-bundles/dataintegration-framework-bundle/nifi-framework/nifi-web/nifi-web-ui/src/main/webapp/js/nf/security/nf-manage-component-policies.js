/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global nf, Slick */
nf.ComponentPolicy=(function(){
    
    var config = {
        urls: {
            users: '../dataintegration-api/tenants/users',
            userGroups: '../dataintegration-api/tenants/user-groups'
        }
    };
    
    var initComponentPolicyRefreshButton=function(){
        $('#component-policy-refresh-button').on('click', function () {
            var selectedItem = $('#account-name').text();
            var selectedItemType = $('#account-type').text();
            nf.ComponentPolicy.refreshComponentPoliciesTable(selectedItem,selectedItemType);
         });
    };
    
    var initComponentPoliciesDialog=function (){
        
        $('#add-new-component-policy-Btn').on('click', function (){
           nf.CreateComponentPolicy.showComponentPolicy(nf.CanvasUtils.getSelection());
        });
        
        $('#manage-component-policies-dialog').modal({
            headerText: 'Policies',
            buttons: [{
                buttonText: 'Back',
                color: {
                    base: '#E3E8EB',
                    hover: '#C7D2D7',
                    text: '#004849'
                },
                handler: {
                    click: function () {
                        $('#manage-component-policies-dialog').modal('hide');
                    }
                }
            }],
            handler: {
                close: function () {
                }
            }
        });
        
    };
    
    /**
     * Initializes the user policies table.
     */
    var initComponentPoliciesTable = function () {

        // function for formatting the human readable name of the policy
        var policyDisplayNameFormatter = function (row, cell, value, columnDef, dataContext) {
            if (dataContext.permissions.canRead === true) {
                return componentResourceParser(dataContext);
            } else {
                return '<span class="unset">' + dataContext.id + '</span>';
            }
        };
        
        // function for formatting the action column
        var actionFormatter = function (row, cell, value, columnDef, dataContext) {
            var markup = '';
            if (dataContext.permissions.canRead === true) {
                markup += dataContext.component.action;
            }
            return markup;
        };
        
        // function for formatting the actions column
        var optionsFormatter = function (row, cell, value, columnDef, dataContext) {
            var markup = '';
            var isExists=false;
            if($('#account-type').text() === 'user') {
                isExists = dataContext.isExistInGroup;
            } else {
                isExists = false;
            }
            if(!isExists) {
                markup += '<div title="Remove" class="pointer delete-component-policy fa fa-trash ' + (nf.Common.canModifyPolicies() ? '' : 'disabled') + '"></div>';
            }
            return markup;
        };
        
        var componentPoliciesColumns = [
            {id: 'policy', name: 'Policy', sortable: true, resizable: true, formatter: policyDisplayNameFormatter, width: 150},
            {id: 'action', name: 'Access Mode', sortable: true, resizable: false, formatter: actionFormatter, width: 100, maxwidth:100},
            {id: 'options', name: '&nbsp;', sortable: false, resizable: false, formatter: optionsFormatter,width: 100, maxWidth: 100}
        ];

        var componentPoliciesOptions = {
            forceFitColumns: true,
            enableTextSelectionOnCells: true,
            enableCellNavigation: true,
            enableColumnReorder: false,
            autoEdit: false,
            autoHeight: true
        };

        // initialize the dataview
        var componentPoliciesData = new Slick.Data.DataView({
            inlineFilters: false
        });
        componentPoliciesData.setItems([]);
        
        componentPolicySort({
            columnId: 'policy',
            sortAsc: true
        }, componentPoliciesData);

        // initialize the grid
        var componentPoliciesGrid = new Slick.Grid('#manage-component-policies-grid', componentPoliciesData, componentPoliciesColumns, componentPoliciesOptions);
        componentPoliciesGrid.setSelectionModel(new Slick.RowSelectionModel());
        componentPoliciesGrid.registerPlugin(new Slick.AutoTooltips());
        componentPoliciesGrid.setSortColumn('policy', true);
        componentPoliciesGrid.onSort.subscribe(function (e, args) {
            componentPolicySort({
                columnId: args.sortCol.id,
                sortAsc: args.sortAsc
           }, componentPoliciesData);
        });        
        
        componentPoliciesGrid.onClick.subscribe(function (e, args) {
            var target = $(e.target);

            // get the node at this row
            var item = componentPoliciesData.getItem(args.row);

            // determine the desired action
            if (componentPoliciesGrid.getColumns()[args.cell].id === 'options') {
                if (target.hasClass('delete-component-policy')) {
                    if(nf.Common.canModifyPolicies()){
                        deleteComponentPolicy(item);
                    }
                }
            }
        });
        
        // wire up the dataview to the grid
        componentPoliciesData.onRowCountChanged.subscribe(function (e, args) {
            componentPoliciesGrid.updateRowCount();
            componentPoliciesGrid.render();
        });
        componentPoliciesData.onRowsChanged.subscribe(function (e, args) {
            componentPoliciesGrid.invalidateRows(args.rows);
            componentPoliciesGrid.render();
        });
        
        // hold onto an instance of the grid
        $('#manage-component-policies-grid').data('gridInstance', componentPoliciesGrid);
    };
    
    var componentPolicySort = function (sortDetails, data) {
         var aString;
         var bString;
        // defines a function for sorting
        var comparer = function (a, b) {
            if (a.permissions.canRead && b.permissions.canRead) {
               if (sortDetails.columnId === 'action') {
                    aString = nf.Common.isDefinedAndNotNull(a.component[sortDetails.columnId]) ? a.component[sortDetails.columnId] : '';
                    bString = nf.Common.isDefinedAndNotNull(b.component[sortDetails.columnId]) ? b.component[sortDetails.columnId] : '';
                    return aString === bString ? 0 : aString > bString ? 1 : -1;
                } else if (sortDetails.columnId === 'policy') {
                    aString = '';
                    bString = '';

                    // if the user has permission to the policy
                    if (a.permissions.canRead === true) {
                        // check if Global policy
                        if (nf.Common.isUndefinedOrNull(a.component.componentReference)) {
                           aString = globalResourceParser(a);
                        } else {
                            // not a global policy... check if user has access to the component reference
                            aString = componentResourceParser(a);
                        }
                   } else {
                        aString = a.id;
                    }

                    // if the user has permission to the policy
                   if (b.permissions.canRead === true) {
                        // check if Global policy
                        if (nf.Common.isUndefinedOrNull(b.component.componentReference)) {
                            bString = globalResourceParser(b);
                        } else {
                            // not a global policy... check if user has access to the component reference
                            bString = componentResourceParser(b);
                        }
                    } else {
                        bString = b.id;
                   }
                    return aString === bString ? 0 : aString > bString ? 1 : -1;
                }
            } else {
                if (!a.permissions.canRead && !b.permissions.canRead) {
                    return 0;
                }
                if (a.permissions.canRead) {
                    return 1;
                } else {
                    return -1;
               }
            }
        };
        // perform the sort
        data.sort(comparer, sortDetails.sortAsc);
    };
    
    var globalResourceParser = function (dataContext) {
       return 'Global policy to ' +
                nf.Common.getPolicyTypeListing(nf.Common.substringAfterFirst(dataContext.component.resource, '/')).text;
    };
    
    var componentResourceParser = function (dataContext) {
        var resource = dataContext.component.resource;
        var policyLabel = '';

        //determine policy type
        if (resource.startsWith('/policies')) {
            resource = nf.Common.substringAfterFirst(resource, '/policies');
            policyLabel += 'Admin policy for ';
        } else if (resource.startsWith('/data-transfer')) {
            resource = nf.Common.substringAfterFirst(resource, '/data-transfer');
            policyLabel += 'Site to site policy for ';
        } else if (resource.startsWith('/data')) {
            resource = nf.Common.substringAfterFirst(resource, '/data');
            policyLabel += 'Data policy for ';
        } else {
            policyLabel += 'Component policy for ';
        }

        if (resource.startsWith('/processors')) {
            policyLabel += 'processor ';
        } else if (resource.startsWith('/controller-services')) {
            policyLabel += 'controller service ';
        } else if (resource.startsWith('/funnels')) {
            policyLabel += 'funnel ';
        } else if (resource.startsWith('/input-ports')) {
            policyLabel += 'input port ';
        } else if (resource.startsWith('/labels')) {
            policyLabel += 'label ';
        } else if (resource.startsWith('/output-ports')) {
            policyLabel += 'output port ';
        } else if (resource.startsWith('/process-groups')) {
            policyLabel += 'process group ';
        } else if (resource.startsWith('/remote-process-groups')) {
            policyLabel += 'remote process group ';
        } else if (resource.startsWith('/reporting-tasks')) {
            policyLabel += 'reporting task ';
        } else if (resource.startsWith('/templates')) {
            policyLabel += 'template ';
        }

        if (dataContext.component.componentReference.permissions.canRead === true) {
            policyLabel += '<span style="font-weight: 500">' + dataContext.component.componentReference.component.name + '</span>';
        } else {
            policyLabel += '<span class="unset">' + dataContext.component.componentReference.id + '</span>';
        }

        return policyLabel;
    };
    
    var deleteComponentPolicy = function (item){
        nf.ComponentPolicy.OpenComponentPolicyDeleteDialog(item);
    };
    
    var removeComponentPolicy = function (item){
        var componentPoliciesGrid = $('#manage-component-policies-grid').data('gridInstance');
        var componentPoliciesData = componentPoliciesGrid.getData();
        componentPoliciesData.beginUpdate();
        componentPoliciesData.deleteItem(item.id);
        componentPoliciesData.endUpdate();
        updatePolicyTableAfterDelete(item);
    };
    
    var updatePolicyTableAfterDelete=function (item){
        var selectedItem = $('#account-name').text();
        var selectedItemType = $('#account-type').text();
        var accountData;
        if (selectedItemType === 'user' )
        {
            var usersGrid = $('#users-security-table').data('gridInstance');
            accountData = usersGrid.getData();
        }
        else
        {
            //for user group
            var usersGrid = $('#usergroups-security-table').data('gridInstance');
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
        
        var currentEntity;
                
        $.ajax({
            type: 'GET',
            url: '../dataintegration-api/policies/' + item.component.action + item.component.resource,
            dataType: 'json',
            async: false
        }).done(function (policyEntity) {
            currentEntity = policyEntity;
        }).fail(function () {
            nf.Dialog.showOkDialog({
                headerText: 'Error',
                dialogContent: nf.Common.escapeHtml("Error occurred while getting current entity.")
            }); 
        });
        
        if (nf.Common.isDefinedAndNotNull(currentEntity)) {
            if(selectedUser !== null && selectedUser !== '' ) {
                var userList = currentEntity.component.users;
                $.each(userList, function (_, user) {
                    var userCopy = $.extend({}, user);
                    if(userCopy.component.identity === selectedUser.component.identity) {
                        var spliceStartIndex=nf.SecurityCommon.getIndexOfItem(selectedUser.component.identity,userList);
                        currentEntity.component.users.splice(spliceStartIndex,1);
                        return false;
                    }
                });
            }
            if(selectedGroup !== null && selectedGroup !== '') {
                var groupList=currentEntity.component.userGroups;
                $.each(groupList, function (_, group) {
                    var groupCopy = $.extend({}, group);
                    if(groupCopy.component.identity === selectedGroup.component.identity) {
                        var spliceStartIndex=nf.SecurityCommon.getIndexOfItem(selectedGroup.component.identity,groupList);
                        currentEntity.component.userGroups.splice(spliceStartIndex,1);
                        return false;
                    }
                });
            }
            currentEntity.revision = nf.Client.getRevision(currentEntity);
        
            $.ajax({
                type: 'PUT',
                url: currentEntity.uri,
                data: JSON.stringify(currentEntity),
                dataType: 'json',
                contentType: 'application/json'
            }).done(function () {
                nf.ComponentPolicy.refreshComponentPoliciesTable(selectedItem,selectedItemType);
                nf.SecurityManagement.loadSecurityUsersTable();
                nf.SecurityManagement.loadSecurityUserGroupsTable();
            }).fail(function (xhr, status, error) {
                nf.ErrorHandler.handleAjaxError(xhr, status, error);
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
        init:function (){
            initComponentPoliciesDialog();
            initComponentPoliciesTable();
            initComponentPolicyRefreshButton();
        },
        
        OpenComponentPolicyDeleteDialog:function(item){
            var accountType=$('#account-type').text();
            var accountName=$('#account-name').text();
            nf.Dialog.showYesNoDialog({
            headerText: 'Delete Policy',
            dialogContent: 'Remove selected policy from '+ accountName +'?',
            yesHandler: function () {
                removeComponentPolicy(item);
            }
        });
        },
        
        OpenComponentPolicyManagementDialog:function(item){
            $('#account-type').text(item.type);
            $('#account-name').text(item.component.identity);            
            $('#manage-component-policies-dialog').modal('show');
            nf.ComponentPolicy.loadComponentPoliciesTable(item);          
            nf.ComponentPolicy.resetComponentPoliciesTableSize();            
        },
        
        loadComponentPoliciesTable:function(item){
            var componentPoliciesGrid = $('#manage-component-policies-grid').data('gridInstance');
            var componentPoliciesData = componentPoliciesGrid.getData();
            
            // begin the update
            componentPoliciesData.beginUpdate();
            
            var componentPolicies=nf.ComponentPolicy.GetComponentPolicies(item.component.accessPolicies);
            
            // set the rows
            if (nf.Common.isDefinedAndNotNull(componentPolicies)) {
                componentPoliciesData.setItems(componentPolicies);
            }

            // end the update
            componentPoliciesData.endUpdate();

            // re-sort and clear selection after updating
            componentPoliciesData.reSort();
            componentPoliciesGrid.invalidate();
            componentPoliciesGrid.getSelectionModel().setSelectedRows([]);
            
            // update the refresh timestamp
            $('#component-policy-last-refreshed').text($('#security-last-refreshed').text());
        },
        
        refreshComponentPoliciesTable:function (itemName,itemType){
            var item, url;
            nf.SecurityCommon.loadCurrentUser();
            if(itemType==='user'){
                url= config.urls.users;
                nf.SecurityManagement.loadSecurityUsersTable();
            }else{
                url=config.urls.userGroups;
                nf.SecurityManagement.loadSecurityUserGroupsTable();
            }
            $.ajax({
                type: 'GET',
                url: url,
                dataType: 'json'
            }).done(function (entity){
                var items;
                if(itemType==='user'){
                    items=entity.users;
                }else{
                    items=entity.userGroups;
                }          
                $.each(items, function(_, data) {
                    if(data.component.identity===itemName){
                        item=data;
                        return false;
                    }
                });
                if(nf.Common.isDefinedAndNotNull(item)){
                    nf.ComponentPolicy.loadComponentPoliciesTable(item);
                }
            });
        },
        
        resetComponentPoliciesTableSize: function (){
            var componentPoliciesTable = $('#manage-component-policies-grid');
            if (componentPoliciesTable.is(':visible')) {
                var grid = componentPoliciesTable.data('gridInstance');
                if (nf.Common.isDefinedAndNotNull(grid)) {
                    grid.resizeCanvas();
                }
            }
        },
        
        GetComponentPolicies: function (accessPolicies){
            var componentPolicies=[];            
            var componentId=$("#selected-policy-item-id").html();
            $.each(accessPolicies,function (index, accessPolicy){
                if(accessPolicy.component.hasOwnProperty('componentReference')){
                    if(accessPolicy.component.componentReference.id===componentId)
                        componentPolicies.push(accessPolicy);
                }
            });
            return componentPolicies;
        }
    };
}());
