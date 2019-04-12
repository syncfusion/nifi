<%-- Licensed to the Apache Software Foundation (ASF) under one or more contributor license agreements. See the NOTICE file distributed with this work for additional information regarding copyright ownership. The ASF licenses this file to You under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0 Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License. --%>
    <link rel="stylesheet" href="../dataintegration/js/jquery/modal/jquery.modal.css" type="text/css" />
    <script type="text/javascript" src="../dataintegration/js/jquery/modal/jquery.modal.js"></script>
    <%@ page contentType="text/html" pageEncoding="UTF-8" session="false" %>
        <div id="delete-confirmation-dialog" value="show" class="hidden small-dialog">
            <div class="dialog-header"><span class="dialog-header-text">Delete Confirmation</span>
            </div>
            <div class="dialog-content">
                <div id="delete-alert-text"><span></span></div>
                <div id="delete-check">
                    <div id="span-check">
                        <input type="checkbox" class="delete-checkbox" value="alert" name="delete">
                       <div id="checkbox-text">Don't ask me again</div>
                    </div>
                </div>
            </div>

        </div>

        <script>
            function deleteConfirmation(selection) {
                this.modal = {
                    /**
                     * Gets the modal element.
                     *
                     * @returns {*|jQuery|HTMLElement}
                     */
                    getElement: function() {
                        return $('#delete-confirmation-dialog');
                    },
                    /**
                     * Initialize the modal.
                     */
                    init: function() {

                    },
                    /**
                     * Updates the modal config.
                     *
                     * @param {string} name             The name of the property to update.
                     * @param {object|array} config     The config for the `name`.
                     */
                    update: function(name, config) {
                        this.getElement().modal(name, config);
                    },
                    /**
                     * Show the modal.
                     */
                    show: function() {
                        this.getElement().modal('show');
                    },
                    /**
                     * Hide the modal.
                     */
                    hide: function() {
                        this.getElement().modal('hide');
                    }
                };

                this.modal.update('setButtonModel', [{
                    buttonText: 'Delete',
                    color: {
                        base: '#728E9B',
                        hover: '#004849',
                        text: '#ffffff'
                    },
                    handler: {
                        click: function() {
                          $('#delete-confirmation-dialog').modal('hide');
                          nf.Actions.deleteSelection(selection);
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
                        click: function() {
                          // hide the dialog
                          $('#delete-confirmation-dialog').modal('hide');
                        }
                    }
                }]);
                this.modal.show();
            }


            $(".delete-checkbox").change(function() {

                if (this.checked) {
                    $("#delete-confirmation-dialog").attr("value", "hide");
                } else {
                    $("#delete-confirmation-dialog").attr("value", "show");
                }
            });
        </script>