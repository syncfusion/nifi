/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


/* global define */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery',
                'nf.Common',
                'nf.Dialog',
                'nf.Storage'],
            function ($, nfCommon, nfDialog, nfStorage) {
                return (nf.Logout = factory($, nfCommon, nfDialog, nfStorage));
            });
    } else if (typeof exports === 'object' && typeof module === 'object') {
        module.exports = (nf.Logout =
            factory(require('jquery'),
                require('nf.Common'),
                require('nf.Dialog'),
                require('nf.Storage')));
    } else {
        nf.Logout = factory(root.$,
            root.nf.Common,
            root.nf.Dialog,
            root.nf.Storage);
    }
}(this, function ($, nfCommon, nfDialog, nfStorage) {
    'use strict';

    $(document).ready(function () {
        nfLogout.init();
    });
    
    var nfLogout = {
        init: function(){
            $("#umpLoginBtn").on('click', function() {
                window.location='/dataintegration/login';
            });
        }
    };
    
    return nfLogout;
}));