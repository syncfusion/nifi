/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global nf, d3, Slick */

nf.SecurityManagement=(function(){
    
    var config = {
        urls: {
            users: '../dataintegration-api/tenants/users',
            userGroups: '../dataintegration-api/tenants/user-groups',
            importUMSUsers: '../dataintegration-api/syncfusion/importumsusers'
        }
    };
    var initSecurityRefreshButton=function(){
         $('#security-refresh-button').on('click', function () {
             if($('#security-tabs .tab-pane .selected-tab').text()==="User"){
                 nf.SecurityManagement.loadSecurityUsersTable();
             }else{
                 nf.SecurityManagement.loadSecurityUserGroupsTable();
             }
         });
    };
    
   var initGlobalPolicyRefreshButton = function () {
        $('#global-policy-refresh-button').on('click', function () {
            var selectedItem = $("#policies-dialog-user-name").text();
            var selectedItemType = $("#policies-setting-name").text();
            if ($("#add-policy-user-button").hasClass("disable-addbutton-element")) {	
             nf.SecurityManagement.RefreshComponentPoliciesGrid(selectedItem, selectedItemType);
            }
            nf.SecurityManagement.RefreshGlobalPoliciesGrid(selectedItem, selectedItemType);
        });
    };
    
    var deleteDialogHeader=function (){
        if($('#security-tabs .tab-pane .selected-tab').text()==="User")
            return 'Delete User';
        else
            return 'Delete User Group';
    };
    
    var initSecurityTabControl=function(){
        $('#security-tabs').tabbs({
            tabStyle: 'tab',
            selectedTabStyle: 'selected-tab',
            scrollableTabContentStyle: 'scrollable',
            tabs: [{
                name: 'User',
                tabContentId: 'users-security-tab-content'
            }, {
                name: 'Group',
                tabContentId: 'usergroups-security-tab-content'
            }],
            select: function () {
                var tab = $(this).text();
                if (tab === 'User') {
                   $('#create-new-user-button').removeClass('newusergroup-Button').addClass('newuser-Button');
                   $('#create-new-user-button').text('New User'); 
                   $("#create-new-user-button").attr('title', "New User");
                   if(nf.SecurityCommon.isUMP()){
                       $("#sync-users-button").css('display','block');
                       $("#create-new-user-button").css('display','none');
                   } else {
                       $("#sync-users-button").css('display','none');
                       $("#create-new-user-button").css('display','block');
                   }
                } else {
                   $('#create-new-user-button').removeClass('newuser-Button').addClass('newusergroup-Button');
                   $('#create-new-user-button').text('New Group'); 
                   $("#create-new-user-button").attr('title', "New Group");
                   $("#sync-users-button").css('display','none');
                   $("#create-new-user-button").css('display','block');
                }
                
                if(nf.Common.canAccessTenants()){
                	nf.SecurityManagement.loadSecurityUsersTable().done(function (){
                    	nf.SecurityManagement.resetUsersTableSize();
                	});
                	nf.SecurityManagement.loadSecurityUserGroupsTable().done(function (){
                    	nf.SecurityManagement.resetUserGroupsTableSize();
                	});
            	}
            }
        }); 
    };
    
    var initDeleteDialog = function () {
        $('#security-delete-dialog').modal({
            headerText: deleteDialogHeader(),
            buttons: [{
                buttonText: 'Delete',
                color: {
                    base: '#728E9B',
                    hover: '#004849',
                    text: '#ffffff'
                },
                handler: {
                    click: function () {
                        var userId = $('#security-id-delete-dialog').val();
                        
                        if($('#security-tabs .tab-pane .selected-tab').text()==="User")
                        {
                            // get the user
                            var usersGrid = $('#users-security-table').data('gridInstance');
                            var usersData = usersGrid.getData();
                            var user = usersData.getItemById(userId);

                            // update the user
                            $.ajax({
                                type: 'DELETE',
                                url: user.uri + '?' + $.param(nf.Client.getRevision(user)),
                                dataType: 'json'
                            }).done(function () {
                                nf.SecurityManagement.loadSecurityUsersTable();
                                nf.SecurityManagement.loadSecurityUserGroupsTable();
                            }).fail(nf.ErrorHandler.handleAjaxError);
                        }
                        else
                        {
                            // get the usergroup
                            var usergroupsGrid = $('#usergroups-security-table').data('gridInstance');
                            var usergroupsData = usergroupsGrid.getData();
                            var usergroup = usergroupsData.getItemById(userId);

                            // update the usergroup
                            $.ajax({
                                type: 'DELETE',
                                url: usergroup.uri + '?' + $.param(nf.Client.getRevision(usergroup)),
                                dataType: 'json'
                            }).done(function () {
                                nf.SecurityManagement.loadSecurityUserGroupsTable();
                                nf.SecurityManagement.loadSecurityUsersTable();
                            }).fail(nf.ErrorHandler.handleAjaxError);
                        }
                        // hide the dialog
                        $('#security-delete-dialog').modal('hide');
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
                        $('#security-delete-dialog').modal('hide');
                    }
                }
            }],
            handler: {
                close: function () {
                    // clear the current user
                    $('#security-id-delete-dialog').val('');
                    $('#security-name-delete-dialog').text('');
                }
            }
        });
    };
    
    var editUser = function (user) {
        // populate the users info
        $('#new-user-id-edit-dialog').text(user.id);
        $('#new-user-identity-edit-dialog').val(user.component.identity);
        if (user.type === 'user') {
            // list all the groups currently in the table
            buildGroupsList();
            // select each group this user belongs to
            $.each(user.component.userGroups, function (_, userGroup) {
                $('div.group-check.user-group-' + userGroup.id).removeClass('checkbox-unchecked').addClass('checkbox-checked');
            });
        }        
        // show the dialog
        $("#new-user-dialog .dialog-header").remove();
        $('#new-user-dialog').modal({headerText: 'Edit User'});
        $('#new-user-dialog').modal('show');
    };
    
    var editUserGroup = function (group) {
        // populate the users info
        $('#new-usergroup-id-edit-dialog').text(group.id);
        $('#new-usergroup-identity-edit-dialog').val(group.component.identity);
        if (group.type === 'usergroup') {
            // list all the groups currently in the table
            buildUsersList();
            // select each group this user belongs to
            $.each(group.component.users, function (_, user) {
                $('div.user-check.group-user-' + user.id).removeClass('checkbox-unchecked').addClass('checkbox-checked');
            });
        }        
        // show the dialog
        $('#new-usergroup-dialog .dialog-header').remove();
        $('#new-usergroup-dialog').modal({headerText: 'Edit User Group'});
        $('#new-usergroup-dialog').modal('show');
    };
    
    var deleteUser = function (user) {
        // populate the users info
        $('#security-id-delete-dialog').val(user.id);
        $('#security-identity-delete-dialog').text(user.component.identity);

        // show the dialog
        $("#security-delete-dialog .dialog-header").remove();
        $('#security-delete-dialog').modal({headerText:deleteDialogHeader()});
        $('#security-delete-dialog').modal('show');
    };
    
    var nfelEditor = function (args) {
            var scope = this;
            var initialValue = '';  
            var wrapper;
            var editor;
            
            this.init = function () {
                var container = $('body');
                
                var languageId = 'nfel';
                var editorClass = languageId + '-editor';
                
                // create the wrapper
                wrapper = $('<div></div>').addClass('slickgrid-nfel-editor').css({
                    'z-index': 14000,
                    'position': 'absolute',
                    'padding': '10px 20px',
                    'overflow': 'hidden',
                    'border-radius': '2px',
                    'box-shadow': 'rgba(0, 0, 0, 0.247059) 0px 2px 5px',
                    'background-color': 'rgb(255, 255, 255)',
                    'cursor': 'move',
                    'transform': 'translate3d(0px, 0px, 0px)'
                }).appendTo(container);
                
                // create the editor
                editor = $('<div></div>').addClass(editorClass).appendTo(wrapper).nfeditor({
                    languageId: languageId,
                    lineWrapping:true,
                    sensitive: false,
                    width: (args.position.width < 212) ? 212 : args.position.width,
                    minWidth: 212,
                    minHeight: 100,
                    readOnly: true,
                    resizable: true,
                    escape: function () {
                        scope.cancel();
                    }
                });
                
                var ok = $('<div class="button">Ok</div>').css({
                    'color': '#fff',
                    'background': '#728E9B'
                }).hover(function () {
                    $(this).css('background', '#004849');
                }, function () {
                    $(this).css('background', '#728E9B');
                }).on('click', scope.cancel);           
            
                $('<div></div>').css({
                    'position': 'relative',
                    'top': '10px',
                    'left': '20px',
                    'width': '212px',
                    'clear': 'both',
                    'float': 'right'
                }).append(ok).append('<div class="clear"></div>').appendTo(wrapper);
                            
                // position and focus
                scope.position(args.position);
                editor.nfeditor('focus').nfeditor('selectAll');
            };
            
            /*********** REQUIRED METHODS ***********/

            this.destroy = function() {
                editor.nfeditor('destroy');
                wrapper.remove();
            };

            this.focus = function() {
                editor.nfeditor('focus');
            };
            
            this.isValueChanged = function() {
                // return true if the value(s) being edited by the user has/have been changed
                return false;
            };
                
            this.serializeValue = function() {
                // return the value(s) being edited by the user in a serialized form
                // can be an arbitrary object
                // the only restriction is that it must be a simple object that can be passed around even
                // when the editor itself has been destroyed
                return initialValue;
            };
                
            this.loadValue = function(item) {            
                // determine the value to use when populating the text field
                if (nf.Common.isDefinedAndNotNull(args.grid.getActiveCell())) {
                    var rowIndex=args.grid.getActiveCell().row;
                    var rowItem=args.grid.getDataItem(rowIndex);
                    if($('#security-tabs .tab-pane .selected-tab').text()==="User"){
                        initialValue = rowItem.component.userGroups.map(function (group) {
                            return group.component.identity;
                        }).join(', ');
                    }else{
                        initialValue = rowItem.component.users.map(function (group) {
                            return group.component.identity;
                        }).join(', ');
                    }
                }
                
                editor.nfeditor('setValue', initialValue).nfeditor('selectAll');
            };
                
            this.applyValue = function(item,state) {
                item[args.column.field] = state;
            };
                
            this.validate = function() {
                return {
                    valid: true,
                    msg: null
                };
            };
                
                    
            /*********** OPTIONAL METHODS***********/
            
            this.cancel=function(){
                editor.nfeditor('setValue', initialValue);
                args.cancelChanges();
            };
            
            this.hide = function() {
                wrapper.hide();
            };
                
            this.show = function() {
                wrapper.show();
                editor.nfeditor('refresh');
            };
                
            this.position = function(position) {
                wrapper.css({
                    'top': position.top - 21,
                    'left': position.left - 43
                });
            };
            
            this.init();
         };
    
    var initUsersSecurityTable= function (){
        // function for formatting the user identity
        var userFormatter = function (row, cell, value, columnDef, dataContext) {
            var markup = '';
            markup += dataContext.component.identity;
            return markup;
        };

        // function for formatting the members/groups
        var userGroupFormatter = function (row, cell, value, columnDef, dataContext) {
                return dataContext.component.userGroups.map(function (group) {
                    return group.component.identity;
                }).join(', ');
        };
        
        //functon for formatting popup
        var actionFormatter = function (row, cell, value, columnDef, dataContext) {
            var markup = '';
            // ensure user can modify the user            
            if($('#policy-selected-item-container').css('display')==='none') {
                markup += '<div title="Edit" class="pointer edit-user fa fa-pencil ' + (nf.Common.canModifyTenants() ? '' : 'disabled') + '" style="margin-right: 3px;"></div>';
                markup += '<div title="Remove" class="pointer delete-user fa fa-trash ' + (nf.Common.canModifyTenants() ? '' : 'disabled') + '"></div>';
            }
            markup += '<div title="Manage Policies" class="pointer view-user-policies fa fa-key '+ (nf.Common.canAccessPolicies() ? '' : 'disabled') +'" style="margin-left: 3px;"></div>';            
            return markup;
        };
        
        // initialize the templates table
        var usersSecurityColumns = [
            {id: 'user', name: 'User', sortable: true, resizable: true, formatter: userFormatter},
            {id: 'usergroup', name: 'Groups', sortable: false, resizable: true, editor: nfelEditor, formatter: userGroupFormatter},
            {id: 'actions', name: '&nbsp;', sortable: false, resizable: false, formatter: actionFormatter,width: 100, maxWidth: 100}
        ];
        var usersSecurityOptions = {
            forceFitColumns: true,
            editable: true,
            enableTextSelectionOnCells: true,
            enableCellNavigation: true,
            enableColumnReorder: false,
            autoEdit: false,
            autoHeight: true
        };

        // initialize the dataview
        var userSecurityData = new Slick.Data.DataView({
            inlineFilters: false
        });
        
        // initialize the sort
        userSecurityGridSort({
            columnId: 'user',
            sortAsc: true
        }, userSecurityData);
        
        userSecurityData.setItems([]);
       
        // initialize the grid
        var userSecurityGrid = new Slick.Grid('#users-security-table', userSecurityData, usersSecurityColumns, usersSecurityOptions);
        userSecurityGrid.setSelectionModel(new Slick.RowSelectionModel());
        userSecurityGrid.registerPlugin(new Slick.AutoTooltips());
        userSecurityGrid.setSortColumn('user', true);
        userSecurityGrid.onSort.subscribe(function (e, args) {
            userSecurityGridSort({
                columnId: args.sortCol.id,
                sortAsc: args.sortAsc
           }, userSecurityData);
        });
        //
          $(document).on("click", "#policy-view", function(event) {
              nf.SecurityManagement.policyBasedView(); 
              nf.SecurityManagement.resetPolicyTableSize();
          });
        // configure a click listener
        userSecurityGrid.onClick.subscribe(function (e, args) {
            var target = $(e.target);

            // get the node at this row
            var item = userSecurityData.getItem(args.row);

            // determine the desired action
            if (userSecurityGrid.getColumns()[args.cell].id === 'actions') {
                if (target.hasClass('edit-user')) {
                    if(nf.Common.canModifyTenants()){
                        editUser(item);
                    }
                } else if (target.hasClass('view-user-policies')) {
                    if(nf.Common.canAccessPolicies()){                        
                        if($('#policy-selected-item-container').css('display')!=='none') {
                            nf.ComponentPolicy.OpenComponentPolicyManagementDialog(item);                        
                        }else{
                            viewUserPolicies(item);
                        }
                     }
                } else if (target.hasClass('delete-user')) {
                    if(nf.Common.canModifyTenants()){
                        deleteUser(item);
                    }
                }
            } else if (userSecurityGrid.getColumns()[args.cell].id === 'usergroup') {
                userSecurityGrid.gotoCell(args.row, args.cell, true);
            }
        });
        
        // wire up the dataview to the grid
        userSecurityData.onRowCountChanged.subscribe(function (e, args) {
            userSecurityGrid.updateRowCount();
            userSecurityGrid.render();
        });
        userSecurityData.onRowsChanged.subscribe(function (e, args) {
            userSecurityGrid.invalidateRows(args.rows);
            userSecurityGrid.render();
        });
        
         $('#users-security-table').data('gridInstance', userSecurityGrid);
     };
     
     var initUserGroupsSecurityTable= function (){
        // function for formatting the user groups
        var userGroupsFormatter = function (row, cell, value, columnDef, dataContext) {
            var markup = '';
            markup += dataContext.component.identity;
            return markup;
        };

        // function for formatting the members/groups
        var userFormatter = function (row, cell, value, columnDef, dataContext) {
                return dataContext.component.users.map(function (group) {
                    return group.component.identity;
                }).join(', ');
        };
        
        //functon for formatting popup
        var actionFormatter = function (row, cell, value, columnDef, dataContext) {
            var markup = '';
            if($('#policy-selected-item-container').css('display')==='none') {
                markup += '<div title="Edit" class="pointer edit-usergroup fa fa-pencil ' + (nf.Common.canModifyTenants() ? '' : 'disabled') + '" style="margin-right: 3px;"></div>';
                markup += '<div title="Remove" class="pointer delete-usergroup fa fa-trash ' + (nf.Common.canModifyTenants() ? '' : 'disabled') + '"></div>';
            }
            markup += '<div title="Manage Policies" class="pointer view-usergroup-policies fa fa-key ' + (nf.Common.canAccessPolicies() ? '' : 'disabled') + '" style="margin-left: 3px;"></div>';
            return markup;
        };
        
        // initialize the templates table
        var usergroupsSecurityColumns = [
            {id: 'usergroup', name: 'Group', sortable: true, resizable: true, formatter: userGroupsFormatter},
            {id: 'user', name: 'Users', sortable: false, resizable: true, editor: nfelEditor, formatter: userFormatter},
            {id: 'actions', name: '&nbsp;', sortable: false, resizable: false, formatter: actionFormatter,width: 100, maxWidth: 100}
        ];
        var usergroupsSecurityOptions = {
            forceFitColumns: true,
            editable:true,
            enableTextSelectionOnCells: true,
            enableCellNavigation: true,
            enableColumnReorder: false,
            autoEdit: false,
            autoHeight: true
        };

        // initialize the dataview
        var usergroupSecurityData = new Slick.Data.DataView({
            inlineFilters: false
        });        
        // initialize the sort
        usergroupSecurityGridSort({
            columnId: 'usergroup',
            sortAsc: true
        }, usergroupSecurityData);
        
        usergroupSecurityData.setItems([]);
       
        // initialize the grid
        var usergroupSecurityGrid = new Slick.Grid('#usergroups-security-table', usergroupSecurityData, usergroupsSecurityColumns, usergroupsSecurityOptions);
        usergroupSecurityGrid.setSelectionModel(new Slick.RowSelectionModel());
        usergroupSecurityGrid.registerPlugin(new Slick.AutoTooltips());
        usergroupSecurityGrid.setSortColumn('user', true);
        usergroupSecurityGrid.onSort.subscribe(function (e, args) {
            usergroupSecurityGridSort({
                columnId: args.sortCol.id,
                sortAsc: args.sortAsc
           }, usergroupSecurityData);
        });
        
        // wire up the dataview to the grid
        usergroupSecurityData.onRowCountChanged.subscribe(function (e, args) {
            usergroupSecurityGrid.updateRowCount();
            usergroupSecurityGrid.render();
        });
        usergroupSecurityData.onRowsChanged.subscribe(function (e, args) {
            usergroupSecurityGrid.invalidateRows(args.rows);
            usergroupSecurityGrid.render();
        });
        
        // configure a click listener
        usergroupSecurityGrid.onClick.subscribe(function (e, args) {
            var target = $(e.target);

            // get the node at this row
            var item = usergroupSecurityData.getItem(args.row);

            // determine the desired action
            if (usergroupSecurityGrid.getColumns()[args.cell].id === 'actions') {
                if (target.hasClass('edit-usergroup')) {
                    if(nf.Common.canModifyTenants()){
                        editUserGroup(item);
                    }
                } else if (target.hasClass('view-usergroup-policies')) {                    
                    if(nf.Common.canAccessPolicies()){
                        if($('#policy-selected-item-container').css('display')!=='none') {
                            nf.ComponentPolicy.OpenComponentPolicyManagementDialog(item);
                        }else{
                            viewUserPolicies(item);
                        }
                    }
                } else if (target.hasClass('delete-usergroup')) {
                    if(nf.Common.canModifyTenants()){
                        deleteUser(item);
                    }
                }
            }else if (usergroupSecurityGrid.getColumns()[args.cell].id === 'user') {
                usergroupSecurityGrid.gotoCell(args.row, args.cell, true);
            }
        });
        
         $('#usergroups-security-table').data('gridInstance', usergroupSecurityGrid);
     };
    
    var showSecurity = function () {
        if(nf.SecurityCommon.isUMP()){
            if ($('#security-tabs .tab-pane .selected-tab').text() === "User") {
                $("#sync-users-button").css('display', 'block');
                $("#create-new-user-button").css('display', 'none');
            } else {
                $("#sync-users-button").css('display', 'none');
                $("#create-new-user-button").css('display', 'block');
            }
        } 
        // show the configuration dialog
        nf.Shell.showContent('#security-management').always(function () {
            reset();
        });        
    };
    
    var reset = function () {
        $('#selected-policy-item-type').text('');
        $('#selected-policy-item-action').text('');
        $('#selected-policy-item-id').text('');
        $('div.policy-selected-item-container').hide();
        $("#create-new-user-button-Pnl").css('display','block');
    };
    
    var buildGroupsList = function () {
        var usergroupsGrid = $('#usergroups-security-table').data('gridInstance');
        var usergroupsData = usergroupsGrid.getData();
        var groupsList = $('#existing-available-groups');
        // add a row for each user
        var count = 0;
        $.each(usergroupsData.getItems(), function(_, group) {
            if (group.type === 'usergroup') {
                // checkbox
                var checkbox = $('<div class="group-check nf-checkbox checkbox-unchecked"></div>').addClass('user-group-' + group.id);
                // group id
                var groupId = $('<span class="group-id hidden"></span>').text(group.id);                
                // icon
                var groupIcon = $('<div class="fa fa-users" style="margin-top: 6px;"></div>');
                // identity
                var identity = $('<div class="available-identities"></div>').text(group.component.identity);
                // clear
                var clear = $('<div class="clear"></div>');
                // list item
                var li = $('<li></li>').append(checkbox).append(groupId).append(groupIcon).append(identity).append(clear).appendTo(groupsList);                
                if (count++ % 2 === 0) {
                    li.addClass('even');
                }
            }
        });
    };
    
    var buildUsersList = function () {
        var usersGrid = $('#users-security-table').data('gridInstance');
        var usersData = usersGrid.getData();
        var usersList = $('#existing-available-users');
        // add a row for each user
        var count = 0;
        $.each(usersData.getItems(), function(_, user) {
            if (user.type === 'user') {
                // checkbox
                var checkbox = $('<div class="user-check nf-checkbox checkbox-unchecked"></div>').addClass('group-user-' + user.id);
                // user id
                var userId = $('<span class="user-id hidden"></span>').text(user.id);
                // identity
                var identity = $('<div class="available-identities"></div>').text(user.component.identity);
                // clear
                var clear = $('<div class="clear"></div>');
                // list item
                var li = $('<li></li>').append(checkbox).append(userId).append(identity).append(clear).appendTo(usersList);
                if (count++ % 2 === 0) {
                    li.addClass('even');
                }
            }
        });
    };
    
    var initNewEditUserDialog = function () {
        $('#new-user-dialog').modal({
            headerText: function(){
                var userId = $('#new-user-id-edit-dialog').text();
                if ($.trim(userId) === '')
                    return 'New User';
                else
                    return 'Edit User';
            },
            buttons: [{
                buttonText: 'Ok',
                color: {
                    base: '#448DD5',
                    hover: '#C0D8F0',
                    text: '#ffffff',
                    border:'1px solid #ccc!important'
                },
                handler: {
                    click: function () {
                        var userId = $('#new-user-id-edit-dialog').text();
                        var userIdentity = $('#new-user-identity-edit-dialog').val();

                        // see if we should create or update this user
                        if ($.trim(userId) === '') {
                            var tenantEntity = {
                                'revision': nf.Client.getRevision({
                                    'revision': {
                                        'version': 0
                                    }
                                })
                            };
                            tenantEntity.component = {
                                'identity': userIdentity
                            };
                            createUser(tenantEntity, getSelectedGroups());                            
                        } else {
                            // update any selected policies
                            updateUser(userId, userIdentity, getSelectedGroups());
                        }
                        $('#new-user-dialog').modal('hide');
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
                        $('#new-user-dialog').modal('hide');
                    }
                }
            }],
            handler: {
                close: function () {
                    // clear the fields
                    $('#new-user-id-edit-dialog').text('');
                    $('#new-user-identity-edit-dialog').val('');
                    $('#existing-available-groups').empty();
                }
            }
        });
    };
    
    var initNewEditUserGroupDialog = function () {
        $('#new-usergroup-dialog').modal({
            headerText: function (){
                var groupId = $('#new-usergroup-id-edit-dialog').text();
                if ($.trim(groupId) === '')
                    return 'New User Group';
                else
                    return 'Edit User Group';
            },
            buttons: [{
                buttonText: 'Ok',
                color: {
                    base: '#448DD5',
                    hover: '#C0D8F0',
                    text: '#ffffff',
                    border:'1px solid #ccc!important'
                },
                handler: {
                    click: function () {
                        var groupId = $('#new-usergroup-id-edit-dialog').text();
                        var groupIdentity = $('#new-usergroup-identity-edit-dialog').val();

                        // see if we should create or update this user
                        if ($.trim(groupId) === '') {
                            var tenantEntity = {
                                'revision': nf.Client.getRevision({
                                    'revision': {
                                        'version': 0
                                    }
                                })
                            };
                            tenantEntity.component = {
                                'identity': groupIdentity,
                                'users': getSelectedUsers()
                            };
                            createGroup(tenantEntity);                            
                        } else {
                            // update any selected policies
                            updateGroup(groupId, groupIdentity, getSelectedUsers());
                        }
                        $('#new-usergroup-dialog').modal('hide');
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
                        $('#new-usergroup-dialog').modal('hide');
                    }
                }
            }],
            handler: {
                close: function () {
                    // clear the fields
                    $('#new-usergroup-id-edit-dialog').text('');
                    $('#new-usergroup-identity-edit-dialog').val('');
                    $('#existing-available-users').empty();
                }
            }
        });
    };
    
    var getSelectedUsers = function () {
        var selectedUsers = [];
        $('#existing-available-users div.user-check').filter(function () {
            return $(this).hasClass('checkbox-checked');
        }).each(function () {
            var id = $(this).next('span.user-id').text();
            selectedUsers.push({
                'id': id
            });
        });
        return selectedUsers;
    };
    
    var getSelectedGroups = function () {
        var selectedGroups = [];
        $('#existing-available-groups div.group-check').filter(function () {
            return $(this).hasClass('checkbox-checked');
        }).each(function () {
            var id = $(this).next('span.group-id').text();
            selectedGroups.push({
                'id': id
            });
        });
        return selectedGroups;
    };
    
    var createUser = function (newUserEntity, selectedGroups) {
        // get the grid and data
        var usersGrid = $('#users-security-table').data('gridInstance');
        var usergroupsGrid = $('#usergroups-security-table').data('gridInstance');
        
        var usersData = usersGrid.getData();        
        var usergroupsData = usergroupsGrid.getData();
        
        // create the user
        var userXhr = $.ajax({
            type: 'POST',
            url: config.urls.users,
            data: JSON.stringify(newUserEntity),
            dataType: 'json',
            contentType: 'application/json'
        });

        // if the user was successfully created
        userXhr.done(function (userEntity) {
            var xhrs = [];
            $.each(selectedGroups, function (_, selectedGroup) {
                var groupEntity = usergroupsData.getItemById(selectedGroup.id);
                xhrs.push(addUserToGroup(groupEntity, userEntity));
            });
            
            $.when.apply(window, xhrs).always(function () {
                nf.SecurityManagement.loadSecurityUserGroupsTable();
                nf.SecurityManagement.loadSecurityUsersTable().done(function () {
                    // select the new user
                    var row = usersData.getRowById(userEntity.id);
                    usersGrid.setSelectedRows([row]);
                    usersGrid.scrollRowIntoView(row);
                });
            }).fail(nf.ErrorHandler.handleAjaxError);
        }).fail(nf.ErrorHandler.handleAjaxError);
    };
    
    var updateUser = function (userId, userIdentity, selectedGroups) {
        // get the grid and data
        var usersGrid = $('#users-security-table').data('gridInstance');
        var usergroupsGrid = $('#usergroups-security-table').data('gridInstance');
        
        var usersData = usersGrid.getData();        
        var usergroupsData = usergroupsGrid.getData();
        
        var userEntity = usersData.getItemById(userId);

        var updatedUserEntity = {
            'revision': nf.Client.getRevision(userEntity),
            'component': {
                'id': userId,
                'identity': userIdentity
            }
        };

        // update the user
        var userXhr = $.ajax({
            type: 'PUT',
            url: userEntity.uri,
            data: JSON.stringify(updatedUserEntity),
            dataType: 'json',
            contentType: 'application/json'
        });

        userXhr.done(function (updatedUserEntity) {
        
            // determine what to add/remove
            var groupsAdded = [];
            var groupsRemoved = [];
            $.each(updatedUserEntity.component.userGroups, function(_, currentGroup) {
                var isSelected = $.grep(selectedGroups, function (group) {
                    return group.id === currentGroup.id;
                });

                // if the current group is not selected, mark it for removed
                if (isSelected.length === 0) {
                    groupsRemoved.push(currentGroup);
                }
            });
            $.each(selectedGroups, function(_, selectedGroup) {
                var isSelected = $.grep(updatedUserEntity.component.userGroups, function (group) {
                    return group.id === selectedGroup.id;
                });

                // if the selected group is not current, mark it for addition
                if (isSelected.length === 0) {
                    groupsAdded.push(selectedGroup);
                }
            });

            // update each group
            var xhrs = [];
            $.each(groupsAdded, function (_, group) {
                var groupEntity = usergroupsData.getItemById(group.id);
                xhrs.push(addUserToGroup(groupEntity, updatedUserEntity));
            });
            $.each(groupsRemoved, function (_, group) {
                var groupEntity = usergroupsData.getItemById(group.id);
                xhrs.push(removeUserFromGroup(groupEntity, updatedUserEntity));
            });

            $.when.apply(window, xhrs).always(function () {
                nf.SecurityManagement.loadSecurityUsersTable();
                nf.SecurityManagement.loadSecurityUserGroupsTable();
            }).fail(nf.ErrorHandler.handleAjaxError);
        }).fail(nf.ErrorHandler.handleAjaxError);
    };
    
    var createGroup = function (newGroupEntity) {
        // create the group
        $.ajax({
            type: 'POST',
            url: config.urls.userGroups,
            data: JSON.stringify(newGroupEntity),
            dataType: 'json',
            contentType: 'application/json'
        }).done(function (groupEntity) {
            nf.SecurityManagement.loadSecurityUsersTable();
            nf.SecurityManagement.loadSecurityUserGroupsTable().done(function () {
                // add the user
                var usergroupsGrid = $('#usergroups-security-table').data('gridInstance');
                var usergroupsData = usergroupsGrid.getData();

                // select the new user
                var row = usergroupsData.getRowById(groupEntity.id);
                usergroupsGrid.setSelectedRows([row]);
                usergroupsGrid.scrollRowIntoView(row);
            });
        }).fail(nf.ErrorHandler.handleAjaxError);
    };
    
    var updateGroup = function (groupId, groupIdentity, selectedUsers) {
        // get the grid and data
        var usersGrid = $('#users-security-table').data('gridInstance');
        var usergroupsGrid = $('#usergroups-security-table').data('gridInstance');
        
        var usersData = usersGrid.getData();        
        var usergroupsData = usergroupsGrid.getData();
        
        var groupEntity = usergroupsData.getItemById(groupId);

        var updatedGroupsEntity = {
            'revision': nf.Client.getRevision(groupEntity),
            'component': {
                'id': groupId,
                'identity': groupIdentity,
                'users': selectedUsers
            }
        };

        // update the user
        $.ajax({
            type: 'PUT',
            url: groupEntity.uri,
            data: JSON.stringify(updatedGroupsEntity),
            dataType: 'json',
            contentType: 'application/json'
        }).done(function (groupEntity) {
            nf.SecurityManagement.loadSecurityUserGroupsTable();
            nf.SecurityManagement.loadSecurityUsersTable();
        }).fail(nf.ErrorHandler.handleAjaxError);
    };
    
    var addUserToGroup = function (groupEntity, userEntity) {
        var groupMembers = [];

        // get all the current users
        $.each(groupEntity.component.users, function (_, member) {
            groupMembers.push({
                'id': member.id
            });
        });

        // add the new user
        groupMembers.push({
            'id': userEntity.id
        });

        // build the request entity
        var updatedGroupEntity = {
            'revision': nf.Client.getRevision(groupEntity),
            'component': $.extend({}, groupEntity.component, {
                'users': groupMembers
            })
        };

        // update the group
        return $.ajax({
            type: 'PUT',
            url: groupEntity.uri,
            data: JSON.stringify(updatedGroupEntity),
            dataType: 'json',
            contentType: 'application/json'
        });
    };
    
    var removeUserFromGroup = function (groupEntity, userEntity) {
        var groupMembers = [];

        // get all the current users
        $.each(groupEntity.component.users, function (_, member) {
            // do not include the specified user
            if (member.id !== userEntity.id) {
                groupMembers.push({
                    'id': member.id
                });
            }
        });

        // build the request entity
        var updatedGroupEntity = {
            'revision': nf.Client.getRevision(groupEntity),
            'component': $.extend({}, groupEntity.component, {
                'users': groupMembers
            })
        };

        // update the group
        return $.ajax({
            type: 'PUT',
            url: groupEntity.uri,
            data: JSON.stringify(updatedGroupEntity),
            dataType: 'json',
            contentType: 'application/json'
        });
    };
    
    var viewUserPolicies = function (user) {
        $('#security-management').find("#loader-icon").css("display","block");
        $('#policies-setting-name').text(user.type);
        $('#policies-dialog-user-name').text(user.component.identity);
        
        var userType = user.type;
        var selectedUserName= user.component.identity;
        if($("#policies-tabs .tab.selected-tab").text() === "Global Policies")
            nf.SecurityManagement.RefreshGlobalPoliciesGrid(selectedUserName,userType);
        else
            nf.SecurityManagement.RefreshComponentPoliciesGrid(selectedUserName,userType);
        
        // show the dialog
        $('#security-management').find("#loader-icon").css("display","none");
        $('#manage-user-policies-dialog').modal('show');
        var policiesTable;
        if($("#policies-tabs .tab.selected-tab").text() === "Global Policies")
            policiesTable = $('#manageuser-policies-table');
        else
            policiesTable = $('#manage-componentpolicies-table');
        if (policiesTable.is(':visible')) {
            var grid = policiesTable.data('gridInstance');
            if (nf.Common.isDefinedAndNotNull(grid)) {
                grid.resizeCanvas();
            }
        }
    };
    
    var userSecurityGridSort = function (sortDetails, data) {
         var aString;
         var bString;
        // defines a function for sorting
        var comparer = function (a, b) {
                if (sortDetails.columnId === 'user') {
                    aString = a.component.identity;
                    bString = b.component.identity;
                    return aString === bString ? 0 : aString > bString ? 1 : -1;
                }
            };
        // perform the sort
        data.sort(comparer, sortDetails.sortAsc);
    };
    
    var usergroupSecurityGridSort = function (sortDetails, data) {
         var aString;
         var bString;
        // defines a function for sorting
        var comparer = function (a, b) {
                if (sortDetails.columnId === 'usergroup') {
                    aString = a.component.identity;
                    bString = b.component.identity;
                    return aString === bString ? 0 : aString > bString ? 1 : -1;
                }
            };
        // perform the sort
        data.sort(comparer, sortDetails.sortAsc);
    };

       var initPolicyTabControl=function(){
        $('#policies-tabs').tabbs({
            tabStyle: 'tab',
            selectedTabStyle: 'selected-tab',
            scrollableTabContentStyle: 'scrollable',
            tabs: [{
                name: 'Global Policies',
                tabContentId: 'global-policy-tab-content'
            }, {
                name: 'Component Policies',
                tabContentId: 'component-policy-tab-content'
            }],
            select: function () {
                $('#manage-user-policies-dialog').find("#loader-icon").css("display","block");
                var tab = $(this).text();
                var selectedItem = $("#policies-dialog-user-name").text();
                var selectedItemType=$("#policies-setting-name").text();
                if (tab === 'Global Policies') {
                  $('#manage-user-policies-dialog').find("#loader-icon").css("display","none");
                  $("#add-policy-user-button").removeClass("disable-addbutton-element");
                  nf.SecurityManagement.RefreshGlobalPoliciesGrid(selectedItem,selectedItemType);
                  var userGlobalPoliciesTable = $('#manageuser-policies-table');
                  if (userGlobalPoliciesTable.is(':visible')) {
                  var globalPolicyGrid = userGlobalPoliciesTable.data('gridInstance');
                  if (nf.Common.isDefinedAndNotNull(globalPolicyGrid)) {
                  globalPolicyGrid.resizeCanvas();
                     }
                  }
                  
                } else {
                  $('#manage-user-policies-dialog').find("#loader-icon").css("display","none");
                  $("#add-policy-user-button").addClass("disable-addbutton-element");
                  nf.SecurityManagement.RefreshComponentPoliciesGrid(selectedItem,selectedItemType);
                  var userComponentPoliciesTable = $('#manage-componentpolicies-table');
                  if (userComponentPoliciesTable.is(':visible')) {
                  var componentPolicyGrid = userComponentPoliciesTable.data('gridInstance');
                  if (nf.Common.isDefinedAndNotNull(componentPolicyGrid)) {
                  componentPolicyGrid.resizeCanvas();
                     }
                  }
                }
            }
        }); 
    };


    var initUserPoliciesDialog = function () {
        $('#manage-user-policies-dialog').modal({
            headerText: 'Policies',
            buttons: [{
                    buttonText: 'Back',
                    color: {
                        base: '#728E9B',
                        hover: '#004849',
                        text: '#ffffff'
                    },
                    handler: {
                        click: function () {
                            $('#manage-user-policies-dialog').modal('hide');
                        }
                    }
                }]
        });
    };
    var initUserPoliciesTable = function () {
        // function for formatting the human readable name of the policy
       var policyDisplayNameFormatter = function (row, cell, value, columnDef, dataContext) {
            // if the user has permission to the policy
           if (dataContext.permissions.canRead === true) {
                // check if Global policy
               if (nf.Common.isUndefinedOrNull(dataContext.component.componentReference)) {
                    return globalResourceParser(dataContext);
                }
                // not a global policy... check if user has access to the component reference
                return componentResourceParser(dataContext);
            } else {
                return '<span class="unset">' + dataContext.id + '</span>';
           }
        };

        // function for formatting the actions column
       var actionsFormatter = function (row, cell, value, columnDef, dataContext) {
            var markup = '';

            if (dataContext.permissions.canRead === true) {
                if (nf.Common.isDefinedAndNotNull(dataContext.component.componentReference)) {
                    if (dataContext.component.resource.indexOf('/processors') >= 0) {
                        markup += '<div title="Go To" class="pointer go-to-component fa fa-long-arrow-right" style="float: left;"></div>';
                    } else if (dataContext.component.resource.indexOf('/controller-services') >= 0) {
                        //TODO: implement go to for CS
                    } else if (dataContext.component.resource.indexOf('/funnels') >= 0) {
                        markup += '<div title="Go To" class="pointer go-to-component fa fa-long-arrow-right" style="float: left;"></div>';
                    } else if (dataContext.component.resource.indexOf('/input-ports') >= 0) {
                        markup += '<div title="Go To" class="pointer go-to-component fa fa-long-arrow-right" style="float: left;"></div>';
                   } else if (dataContext.component.resource.indexOf('/labels') >= 0) {
                        markup += '<div title="Go To" class="pointer go-to-component fa fa-long-arrow-right" style="float: left;"></div>';
                    } else if (dataContext.component.resource.indexOf('/output-ports') >= 0) {
                        markup += '<div title="Go To" class="pointer go-to-component fa fa-long-arrow-right" style="float: left;"></div>';
                    } else if (dataContext.component.resource.indexOf('/process-groups') >= 0) {
                        markup += '<div title="Go To" class="pointer go-to-process-group fa fa-long-arrow-right" style="float: left;"></div>';
                    } else if (dataContext.component.resource.indexOf('/remote-process-groups') >= 0) {
                        markup += '<div title="Go To" class="pointer go-to-component fa fa-long-arrow-right" style="float: left;"></div>';
                    } else if (dataContext.component.resource.indexOf('/reporting-tasks') >= 0) {
                        //TODO: implement go to for RT
                    } else if (dataContext.component.resource.indexOf('/templates') >= 0) {
                        //TODO: implement go to for Templates
                    }
                }
           }

            return markup;
        };

        // function for formatting the action column
        var actionFormatter = function (row, cell, value, columnDef, dataContext) {
            var markup = '';
            if (dataContext.permissions.canRead === true) {
                markup += dataContext.component.action;
            }

           return markup;
        };
        
        var removeActionFormatter = function (row, cell, value, columnDef, dataContext) {
            var markup = '';
            var isExists=false;
            if($('#account-type').text() === 'user') {
                isExists = dataContext.isExistInGroup;
            } else {
                isExists = false;
            }
            if(!isExists)
            markup += '<div title="Remove" class="pointer delete-global-policy fa fa-trash ' + (nf.Common.canModifyPolicies() ? '' : 'disabled') + '"></div>';
            return markup;
        };

        var userPoliciesColumns = [
           {id: 'policy', name: 'Policy', sortable: true, resizable: true, formatter: policyDisplayNameFormatter, width: 150},
            {id: 'action', name: 'Access Mode', sortable: true, resizable: false, formatter: actionFormatter, width: 100, maxwidth:100},
            {id: 'removeaction', name: '&nbsp;', sortable: false, resizable: false, formatter: removeActionFormatter,width: 100, maxWidth: 100}
        ];
        
        
      

        // add the actions if we're in the shell
        if (top !== window) {
            userPoliciesColumns.push({id: 'actions', name: '&nbsp;', sortable: false, resizable: false, formatter: actionsFormatter, width: 25});
        }
        var userPoliciesOptions = {
            forceFitColumns: true,
            enableTextSelectionOnCells: true,
            enableCellNavigation: true,
            enableColumnReorder: false,
            autoEdit: false,
            autoHeight: true
        };

        // initialize the dataview
        var userPoliciesData = new Slick.Data.DataView({
            inlineFilters: false
        });
        userPoliciesData.setItems([]);

        // initialize the sort
        userPolicySort({
            columnId: 'policy',
            sortAsc: true
        }, userPoliciesData);

        // initialize the grid
        var userPoliciesGrid = new Slick.Grid('#manageuser-policies-table', userPoliciesData, userPoliciesColumns, userPoliciesOptions);
        userPoliciesGrid.setSelectionModel(new Slick.RowSelectionModel());
        userPoliciesGrid.registerPlugin(new Slick.AutoTooltips());
        userPoliciesGrid.setSortColumn('policy', true);
        userPoliciesGrid.onSort.subscribe(function (e, args) {
            userPolicySort({
                columnId: args.sortCol.id,
                sortAsc: args.sortAsc
           }, userPoliciesData);
        });
        
        
        // configure a click listener
       userPoliciesGrid.onClick.subscribe(function (e, args) {
            var target = $(e.target);

            // get the node at this row
            var item = userPoliciesData.getItem(args.row);

            // determine the desired action
            if (userPoliciesGrid.getColumns()[args.cell].id === 'removeaction') {
                if (target.hasClass('delete-global-policy')) {
                    if(nf.Common.canModifyPolicies()) {
                        promptToRemovePolicyFromUser(item);
                    }
               }
            }
        });


    var promptToRemovePolicyFromUser = function (item) {
        nf.Dialog.showYesNoDialog({
            headerText: 'Update Policy',
            dialogContent: 'Are you sure you want to remove this selelcted policy?',
            yesHandler: function () {
                removePolicyFromUser(item);
           }
        });
    };

        var removePolicyFromUser = function (item) {
        $('#manage-user-policies-dialog').find("#loader-icon").css("display","block");
        var policyGrid = $('#manageuser-policies-table').data('gridInstance');
        var policyData = policyGrid.getData();

        // begin the update
        policyData.beginUpdate();

        // remove the user
        policyData.deleteItem(item.id);

        // end the update
        policyData.endUpdate();

        // save the configuration
        updatePolicyTable(item);
    };
    
    
    
    var updatePolicyTable = function (item) {
        $('#manage-user-policies-dialog').find("#loader-icon").css("display","none");
        var selectedItem = $("#policies-dialog-user-name").text();
        var selectedItemType=$("#policies-setting-name").text();
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
                var selectedItemName = $("#policies-dialog-user-name").text();
                var selectedItemType=$("#policies-setting-name").text();
                nf.SecurityManagement.RefreshGlobalPoliciesGrid(selectedItemName,selectedItemType);                
                nf.SecurityManagement.loadSecurityUsersTable();
                nf.SecurityManagement.loadSecurityUserGroupsTable();
            }).fail(function (xhr, status, error) {
                nf.ErrorHandler.handleAjaxError(xhr, status, error);
                //nf.AddPolicyToUsers.resetPolicy();
                //nf.AddPolicyToUsers.loadPolicy();
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



        // wire up the dataview to the grid
        userPoliciesData.onRowCountChanged.subscribe(function (e, args) {
            userPoliciesGrid.updateRowCount();
            userPoliciesGrid.render();
        });
        userPoliciesData.onRowsChanged.subscribe(function (e, args) {
            userPoliciesGrid.invalidateRows(args.rows);
            userPoliciesGrid.render();
        });

        // hold onto an instance of the grid
        $('#manageuser-policies-table').data('gridInstance', userPoliciesGrid);
    };
    
        var initComponentPoliciesTable = function () {
        // function for formatting the human readable name of the policy
       var componentPolicyNameFormatter = function (row, cell, value, columnDef, dataContext) {
            // if the user has permission to the policy
           if (dataContext.permissions.canRead === true) {
                // check if Global policy
               if (nf.Common.isUndefinedOrNull(dataContext.component.componentReference)) {
                   return componentResourceParser(dataContext);
                }
                // not a global policy... check if user has access to the component reference
                return componentResourceParser(dataContext);
            } else {
                return '<span class="unset">' + dataContext.id + '</span>';
           }
        };

        // function for formatting the actions column
       var componentActionsFormatter = function (row, cell, value, columnDef, dataContext) {
            var markup = '';

            if (dataContext.permissions.canRead === true) {
                if (nf.Common.isDefinedAndNotNull(dataContext.component.componentReference)) {
                    if (dataContext.component.resource.indexOf('/processors') >= 0) {
                        markup += '<div title="Go To" class="pointer go-to-component fa fa-long-arrow-right" style="float: left;"></div>';
                    } else if (dataContext.component.resource.indexOf('/controller-services') >= 0) {
                        //TODO: implement go to for CS
                    } else if (dataContext.component.resource.indexOf('/funnels') >= 0) {
                        markup += '<div title="Go To" class="pointer go-to-component fa fa-long-arrow-right" style="float: left;"></div>';
                    } else if (dataContext.component.resource.indexOf('/input-ports') >= 0) {
                        markup += '<div title="Go To" class="pointer go-to-component fa fa-long-arrow-right" style="float: left;"></div>';
                   } else if (dataContext.component.resource.indexOf('/labels') >= 0) {
                        markup += '<div title="Go To" class="pointer go-to-component fa fa-long-arrow-right" style="float: left;"></div>';
                    } else if (dataContext.component.resource.indexOf('/output-ports') >= 0) {
                        markup += '<div title="Go To" class="pointer go-to-component fa fa-long-arrow-right" style="float: left;"></div>';
                    } else if (dataContext.component.resource.indexOf('/process-groups') >= 0) {
                        markup += '<div title="Go To" class="pointer go-to-process-group fa fa-long-arrow-right" style="float: left;"></div>';
                    } else if (dataContext.component.resource.indexOf('/remote-process-groups') >= 0) {
                        markup += '<div title="Go To" class="pointer go-to-component fa fa-long-arrow-right" style="float: left;"></div>';
                    } else if (dataContext.component.resource.indexOf('/reporting-tasks') >= 0) {
                        //TODO: implement go to for RT
                    } else if (dataContext.component.resource.indexOf('/templates') >= 0) {
                        //TODO: implement go to for Templates
                    }
                }
           }

            return markup;
        };

        // function for formatting the action column
        var componentActionFormatter = function (row, cell, value, columnDef, dataContext) {
            var markup = '';
            if (dataContext.permissions.canRead === true) {
                markup += dataContext.component.action;
            }
              return markup;
        };
        
        var componentRemoveActionFormatter = function (row, cell, value, columnDef, dataContext) {
            var markup = '';
            var markup = '';
            var isExists=false;
            if($('#account-type').text() === 'user') {
                isExists = dataContext.isExistInGroup;
            } else {
                isExists = false;
            }
            if(!isExists) {
                markup += '<div title="Remove" class="pointer delete-global-policy fa fa-trash ' + (nf.Common.canModifyPolicies() ? '' : 'disabled') + '"></div>';
            }
           return markup;
        };

        var componentPoliciesColumns = [
            {id: 'policy', name: 'Policy', sortable: true, resizable: true, formatter: componentPolicyNameFormatter, width: 150},
            {id: 'action', name: 'Access Mode', sortable: true, resizable: false, formatter: componentActionFormatter, width: 100, maxwidth:100},
            {id: 'removeaction', name: '&nbsp;', sortable: false, resizable: false, formatter: componentRemoveActionFormatter,width: 100, maxWidth: 100}
        ];
        
        
      

        // add the actions if we're in the shell
        if (top !== window) {
            componentPoliciesColumns.push({id: 'actions', name: '&nbsp;', sortable: false, resizable: false, formatter: componentActionsFormatter, width: 25});
        }
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

        // initialize the sort
        userPolicySort({
            columnId: 'policy',
            sortAsc: true
        }, componentPoliciesData);

        // initialize the grid
        var componentPoliciesGrid = new Slick.Grid('#manage-componentpolicies-table', componentPoliciesData, componentPoliciesColumns, componentPoliciesOptions);
        componentPoliciesGrid.setSelectionModel(new Slick.RowSelectionModel());
        componentPoliciesGrid.registerPlugin(new Slick.AutoTooltips());
        componentPoliciesGrid.setSortColumn('policy', true);
        componentPoliciesGrid.onSort.subscribe(function (e, args) {
            userPolicySort({
                columnId: args.sortCol.id,
                sortAsc: args.sortAsc
           }, componentPoliciesData);
        });
        
        
        // configure a click listener
       componentPoliciesGrid.onClick.subscribe(function (e, args) {
            var target = $(e.target);

            // get the node at this row
            var item = componentPoliciesData.getItem(args.row);

            // determine the desired action
            if (componentPoliciesGrid.getColumns()[args.cell].id === 'removeaction') {
                if (target.hasClass('delete-global-policy')) {
                    if(nf.Common.canModifyPolicies()) {
                        componentRemovePolicyFromUser(item);
                    }
               }
            }
        });


    var componentRemovePolicyFromUser = function (item) {
        nf.Dialog.showYesNoDialog({
            headerText: 'Update Policy',
            dialogContent: 'Are you sure you want to remove this selelcted policy?',
            yesHandler: function () {
                componentRemovePolicy(item);
           }
        });
    };

        var componentRemovePolicy = function (item) {
         $('#manage-user-policies-dialog').find("#loader-icon").css("display","block");
        var policyGrid = $('#manage-componentpolicies-table').data('gridInstance');
        var policyData = policyGrid.getData();

        // begin the update
        policyData.beginUpdate();

        // remove the user
        policyData.deleteItem(item.id);

        // end the update
        policyData.endUpdate();

        // save the configuration
        componentUpdatePolicyTable(item);
        
    };
    
    
    
    var componentUpdatePolicyTable = function (item) {
        $('#manage-user-policies-dialog').find("#loader-icon").css("display","none");
        var selectedItem = $("#policies-dialog-user-name").text();
        var selectedItemType=$("#policies-setting-name").text();
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
               delete itemCopy.component["accessPolicies"];
               delete itemCopy.uri;
                if (itemCopy.type === 'user') {
                    delete itemCopy.component["userGroups"];
                    selectedUser = itemCopy;
                }
                else {
                    delete itemCopy.component["users"];
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
                var selectedItemName = $("#policies-dialog-user-name").text();
                var selectedItemType=$("#policies-setting-name").text();
                nf.SecurityManagement.RefreshComponentPoliciesGrid(selectedItemName,selectedItemType);                
                nf.SecurityManagement.loadSecurityUsersTable();
                nf.SecurityManagement.loadSecurityUserGroupsTable();
            }).fail(function (xhr, status, error) {
                nf.ErrorHandler.handleAjaxError(xhr, status, error);
                //nf.AddPolicyToUsers.resetPolicy();
                //nf.AddPolicyToUsers.loadPolicy();
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
        $('#manage-componentpolicies-table').data('gridInstance', componentPoliciesGrid);
    };
    
    
    

    var userPolicySort = function (sortDetails, data) {
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
    
    return{
        init: function(){
            initUsersSecurityTable(); 
            initDeleteDialog();   
            initUserPoliciesDialog();
            initUserPoliciesTable();
            initComponentPoliciesTable();
            initUserGroupsSecurityTable();
            initNewEditUserDialog();
            initNewEditUserGroupDialog();            
            initSecurityTabControl();
            initPolicyTabControl();
            initSecurityRefreshButton();
            initGlobalPolicyRefreshButton();
            if (nf.Common.canModifyTenants()) {
                $('#create-new-user-button').on('click', function () {
                    if($('#create-new-user-button').hasClass('newuser-Button')){
                        var securityUsersGrid = $('#users-security-table').data('gridInstance');
                        nf.SecurityManagement.CancelCellEditor(securityUsersGrid);
                        buildGroupsList();
                        // show the dialog
                        $("#new-user-dialog .dialog-header").remove();
                        $('#new-user-dialog').modal({headerText: 'New User'});
                        $('#new-user-dialog').modal('show');
                        // set the focus automatically, only when adding a new user
                        $('#new-user-identity-edit-dialog').focus();
                    } else {
                        var securityUserGroupsGrid = $('#usergroups-security-table').data('gridInstance');
                        nf.SecurityManagement.CancelCellEditor(securityUserGroupsGrid);
                        buildUsersList();
                        // show the dialog
                        $('#new-usergroup-dialog .dialog-header').remove();
                        $('#new-usergroup-dialog').modal({headerText: 'New Group'});
                        $('#new-usergroup-dialog').modal('show');
                        // set the focus automatically, only when adding a new user
                        $('#new-usergroup-identity-edit-dialog').focus();
                    }
                });
            }
            $("#sync-users-button").on('click', function(){
                nf.Dialog.showYesNoDialog({
                    headerText: 'Import user(s)',
                    dialogContent: 'Are you sure you want to import all user(s) from User Management Server?',
                    
                    yesHandler: function() {
                        nf.SecurityManagement.ImportUMSUsers();
                    }
                });
            });
        },
        
        ImportUMSUsers: function () {
            $('#security-management').find("#loader-icon").css("display","block");

            $.ajax({
                type: 'GET',
                url: config.urls.importUMSUsers,
                async: false
            }).done(function (response) {
                var headerText;
                var dialogContent;
                if(response==="success")
                {
                    nf.SecurityManagement.loadSecurityUsersTable();
                    nf.SecurityManagement.resetUsersTableSize();
                    headerText= "Success";
                    dialogContent= "All user(s) imported successfully";
                }
                $('#security-management').find("#loader-icon").css("display","none");
                nf.Dialog.showOkDialog({
                    headerText: headerText,
                    dialogContent: dialogContent
                });
            }).fail(function (xhr, status, error) {
                nf.Dialog.showOkDialog({
                    headerText: 'Error',
                    dialogContent: nf.Common.escapeHtml(xhr.responseText)
                });
                $('#security-management').find("#loader-icon").css("display","none");
            });
            
        },
        
        OpenSecurityDialog: function (){
            showSecurity();
            nf.SecurityManagement.loadSecurityUsersTable().done(function (){
                nf.SecurityManagement.resetUsersTableSize();
            });
            nf.SecurityManagement.loadSecurityUserGroupsTable().done(function (){
                nf.SecurityManagement.resetUserGroupsTableSize();
            });
        },
    
        resetUsersTableSize: function () {
            var usersSecurityTable = $('#users-security-table');
            if (usersSecurityTable.is(':visible')) {
                var grid = usersSecurityTable.data('gridInstance');
                if (nf.Common.isDefinedAndNotNull(grid)) {
                    grid.resizeCanvas();
                }
            }
        },
    
        loadSecurityUsersTable: function () {
            var users = $.ajax({
                type: 'GET',
                url: config.urls.users,
                dataType: 'json'
            });

            var groups = $.ajax({
                type: 'GET',
                url: config.urls.userGroups,
                dataType: 'json'
            });

            return $.when(users, groups).done(function (usersResults, groupsResults) {
                var usersResponse = usersResults[0];
                var groupsResponse = groupsResults[0];
                
                nf.SecurityCommon.loadCurrentUser();
                
                // update the refresh timestamp
                $('#security-last-refreshed').text(usersResponse.generated);

                var securityUsersGrid = $('#users-security-table').data('gridInstance');
                var securityUsersData = securityUsersGrid.getData();
                
                // begin the update
                securityUsersData.beginUpdate();

                var users = [];

                // add each user
                $.each(usersResponse.users, function (_, user) {
                    users.push($.extend({
                        type: 'user'
                    }, user));
                });

                // set the rows
                securityUsersData.setItems(users);

                // end the update
                securityUsersData.endUpdate();

                // re-sort and clear selection after updating
                securityUsersData.reSort();
                securityUsersGrid.invalidate();
                securityUsersGrid.getSelectionModel().setSelectedRows([]);
            }).fail(nf.ErrorHandler.handleAjaxError);
        },
        
        resetUserGroupsTableSize: function () {
            var usergroupssSecurityTable = $('#usergroups-security-table');
            if (usergroupssSecurityTable.is(':visible')) {
                var grid = usergroupssSecurityTable.data('gridInstance');
                if (nf.Common.isDefinedAndNotNull(grid)) {
                    grid.resizeCanvas();
                }
            }
        },
        
        loadSecurityUserGroupsTable: function () {
            var users = $.ajax({
                type: 'GET',
                url: config.urls.users,
                dataType: 'json'
            });

            var groups = $.ajax({
                type: 'GET',
                url: config.urls.userGroups,
                dataType: 'json'
            });

            return $.when(users, groups).done(function (usersResults, groupsResults) {
                var usersResponse = usersResults[0];
                var groupsResponse = groupsResults[0];
                
                nf.SecurityCommon.loadCurrentUser();
                
                // update the refresh timestamp
                $('#security-last-refreshed').text(usersResponse.generated);

                var securityUserGroupsGrid = $('#usergroups-security-table').data('gridInstance');
                var securityUserGroupsData = securityUserGroupsGrid.getData();

                // begin the update
                securityUserGroupsData.beginUpdate();

                var groups = [];

                // add each user
                $.each(groupsResponse.userGroups, function (_, usergroup) {
                    groups.push($.extend({
                        type: 'usergroup'
                    }, usergroup));
                });

                // set the rows
                securityUserGroupsData.setItems(groups);

                // end the update
                securityUserGroupsData.endUpdate();

                // re-sort and clear selection after updating
                securityUserGroupsData.reSort();
                securityUserGroupsGrid.invalidate();
                securityUserGroupsGrid.getSelectionModel().setSelectedRows([]);
            }).fail(nf.ErrorHandler.handleAjaxError);
        },
        
        ShowSelectedItemPolicy:function (selection){
        $("#policy-selected-item-container .policy-selected-item-name").text($("#operation-context-name").text());
        $("#policy-selected-item-container .policy-selected-item-type").text($("#operation-context-type").text());
        var selectedIcon = $("#operation-context-logo .icon").attr("class");
        $("#policy-selected-item-container .policy-selected-item-type-icon .icon").attr('class',selectedIcon);
            $('#policy-selected-item-container').show();            
            var resource;
            if (selection.empty()) {
                $('#selected-policy-item-id').text(nf.Canvas.getGroupId());
                resource = 'process-groups';
            } else {
                var d = selection.datum();
                $('#selected-policy-item-id').text(d.id);

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
            }
            // populate the initial resource
            $('#selected-policy-item-type').text(resource);
            
            $("#create-new-user-button-Pnl").css('display','none');
            
            return nf.SecurityManagement.OpenSecurityDialog();
        },
        ShowSelectedControllerServicePolicy:function(selection){
            $('#selected-policy-item-id').text(selection.id);
            $('#selected-policy-item-name').text(selection.component.name);
            $('#selected-policy-component-permissions').text(selection.permissions.canRead);
            // populate the initial resource
            $('#selected-policy-item-type').text('controller-services');  
            $("#policy-selected-item-container .policy-selected-item-name").text(selection.component.name);
            $("#policy-selected-item-container .policy-selected-item-type").text("Controller Services");
            $("#policy-selected-item-container .policy-selected-item-type-icon .icon").attr('class','icon icon-drop');
            $('#policy-selected-item-container').show();                   
            $("#create-new-user-button-Pnl").css('display','none');            
            return nf.SecurityManagement.OpenSecurityDialog();
        },
          ShowSelectedReportingTaskPolicy:function(selection){
            $('#selected-policy-item-id').text(selection.id);
            $('#selected-policy-item-name').text(selection.component.name);
            $('#selected-policy-component-permissions').text(selection.permissions.canRead);
            // populate the initial resource
            $('#selected-policy-item-type').text('reporting-tasks');  
            $("#policy-selected-item-container .policy-selected-item-name").text(selection.component.name);
            $("#policy-selected-item-container .policy-selected-item-type").text("Reporting Tasks");
            $("#policy-selected-item-container .policy-selected-item-type-icon .icon").attr('class','icon icon-drop');
            $('#policy-selected-item-container').show();                   
            $("#create-new-user-button-Pnl").css('display','none');            
            return nf.SecurityManagement.OpenSecurityDialog();
        },
        RefreshGlobalPoliciesGrid: function (itemName, itemType) {
            var url;
            if(itemType==='user'){
                url= config.urls.users;
            }else{
                url=config.urls.userGroups;
            }
            nf.SecurityCommon.loadCurrentUser();
            var globalPoliciesGrid = $('#manageuser-policies-table').data('gridInstance');
            var globalPoliciesData = globalPoliciesGrid.getData();

            globalPoliciesData.setItems([]);
            // begin the update
            globalPoliciesData.beginUpdate();
            $.ajax({
                type: 'GET',
                url: url,
                dataType: 'json'
            }).done(function (response) {   
                var items;
                if(itemType==='user'){
                    items=response.users;
                }else{
                    items=response.userGroups;
                }
                $.each(items, function (index, value) {
                    if (value.component.identity === itemName) {
                        var selectedPolicy = value.component.accessPolicies;
                        if (nf.Common.isDefinedAndNotNull(selectedPolicy)) {
                            var globalPolicies=[];
                                 for(var i=0;i<selectedPolicy.length;i++){
                                 if (nf.Common.isUndefinedOrNull(selectedPolicy[i].component.componentReference)) {
                                 globalPolicies.push(selectedPolicy[i]);     
                               }
                              }
                            globalPoliciesData.setItems(globalPolicies);
                        }
                    }
                });
                // end the update
                globalPoliciesData.endUpdate();
                // re-sort and clear selection after updating
                globalPoliciesData.reSort();
                globalPoliciesGrid.invalidate();
                globalPoliciesGrid.getSelectionModel().setSelectedRows([]);                
                // update the refresh timestamp
                nf.SecurityManagement.loadSecurityUsersTable();
                nf.SecurityManagement.loadSecurityUserGroupsTable();
                $('#global-policy-last-refreshed').text($('#security-last-refreshed').text());
            });
        },
        
        RefreshComponentPoliciesGrid: function (itemName, itemType) {
            var url;
            if(itemType==='user'){
                url= config.urls.users;
            }else{
                url=config.urls.userGroups;
            }
            nf.SecurityCommon.loadCurrentUser();
            var componentPoliciesTableGrid = $('#manage-componentpolicies-table').data('gridInstance');
            var componentPoliciesTableData = componentPoliciesTableGrid.getData();

            componentPoliciesTableData.setItems([]);
            // begin the update
            componentPoliciesTableData.beginUpdate();
            $.ajax({
                type: 'GET',
                url: url,
                dataType: 'json'
            }).done(function (response) {   
                var items;
                if(itemType==='user'){
                    items=response.users;
                }else{
                    items=response.userGroups;
                }
                $.each(items, function (index, value) {
                    if (value.component.identity === itemName) {
                        var selectedPolicy = value.component.accessPolicies;
                        if (nf.Common.isDefinedAndNotNull(selectedPolicy)) {
                            var componentPolicies=[];
                                 for(var i=0;i<selectedPolicy.length;i++){
                                 if (!nf.Common.isUndefinedOrNull(selectedPolicy[i].component.componentReference)) {
                                 componentPolicies.push(selectedPolicy[i]);     
                               }
                              }
                            componentPoliciesTableData.setItems(componentPolicies);
                        }
                    }
                });
                // end the update
                componentPoliciesTableData.endUpdate();
                // re-sort and clear selection after updating
                componentPoliciesTableData.reSort();
                componentPoliciesTableGrid.invalidate();
                componentPoliciesTableGrid.getSelectionModel().setSelectedRows([]);                
                // update the refresh timestamp
                nf.SecurityManagement.loadSecurityUsersTable();
                nf.SecurityManagement.loadSecurityUserGroupsTable();
                $('#global-policy-last-refreshed').text($('#security-last-refreshed').text());
            });
        },
  
        
        CloseCellEditor: function (){
            var securityUsersGrid = $('#users-security-table').data('gridInstance');
            var securityUserGroupsGrid = $('#usergroups-security-table').data('gridInstance');
            securityUsersGrid.invalidate();
            securityUserGroupsGrid.invalidate();
        },
        
        CancelCellEditor: function(grid){            
            if (nf.Common.isDefinedAndNotNull(grid)) {
                var editController = grid.getEditController();
                editController.commitCurrentEdit();
            }
        },
        
         resetPolicyTableSize: function () {
            var policiesTable = $('#policy-table');
            if (policiesTable.is(':visible')) {
                var grid = policiesTable.data('gridInstance');
                if (nf.Common.isDefinedAndNotNull(grid)) {
                    grid.resizeCanvas();
                }
            }
        },
        policyBasedView:function(){
            var component=$('#selected-policy-item-type').text();
            var isComponentPolicy=$('#policy-selected-item-container').css('display');
            if(component==="controller-services"){
            nf.PolicyManagement.showControllerServicePolicy();
            }
            else if(component==="reporting-tasks"){
            nf.PolicyManagement.showReportingTaskPolicy();   
            }
            else if(isComponentPolicy!=='none'){
            var selection = nf.CanvasUtils.getSelection();
            nf.PolicyManagement.showComponentPolicy(selection);
            }
            else{
             nf.PolicyManagement.showGlobalPolicies();   
            }
        }
    };    
}());
