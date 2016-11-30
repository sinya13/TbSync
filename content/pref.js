/* Copyright (c) 2012 Mark Nethersole
   See the file LICENSE.txt for licensing information. */
"use strict";

if (typeof tzpush === "undefined") {
    var tzpush = {};
}

var tzpush = {
    prefs: Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.tzpush."),
/*    hthost: "",
//    PASSWORD: "",
    SERVER: "",
    USER: "",
//    NEWPASSWORD: "",
    select: "",*/

    onopen: function() {
//        this.updateprefs();
//        document.getElementById('passbox').value = this.PASSWORD;
        //Check, if a new deviceID needs to be generated
        if (this.prefs.getCharPref("deviceId") === "") this.prefs.setCharPref("deviceId", Date.now());
        this.localAbs();
    },

    onclose: function() {
    },

/*    getpassword: function() {
        let USER = this.prefs.getCharPref("user");
        let HOST = "http://";
        if (this.prefs.getBoolPref("https") === true) HOST = "https://";

        HOST = HOST + this.prefs.getCharPref("host");
        let SERVER = HOST + "/Microsoft-Server-ActiveSync";

        let myLoginManager = Components.classes["@mozilla.org/login-manager;1"].getService(Components.interfaces.nsILoginManager);
        let logins = myLoginManager.findLogins({}, HOST, SERVER, null);
        for (let i = 0; i < logins.length; i++) {
            if (logins[i].username === USER) {
                return logins[i].password;
            }
        }

        //uups, no password found - we should ask for it - this will be triggered by the 401 AUTH Error
        return "";
    }, */

/*    updateprefs: function() {

        var addressUrl = this.prefs.getCharPref("abname");
        var SSL = this.prefs.getBoolPref("https");
        var host = this.prefs.getCharPref("host");
        if (SSL === true) {
            this.hthost = "https://" + host;
            this.SERVER = "https://" + host + "/Microsoft-Server-ActiveSync";
        } else {
            this.hthost = "http://" + host;
            this.SERVER = "http://" + host + "/Microsoft-Server-ActiveSync";
        }

        this.USER = this.prefs.getCharPref("user");
//        this.PASSWORD = this.getpassword();
//        this.NEWPASSWORD = ''; 

        var deviceId = this.prefs.getCharPref("deviceId");
        if (deviceId === "") {
            deviceId = Date.now();
            this.prefs.setCharPref("deviceId", deviceId);
        }
        var polkey = this.prefs.getCharPref("polkey");
        var synckey = this.prefs.getCharPref("synckey");
    }, */

    localAbs: function() {
        //clear list of address books
        let count = -1;
        while (document.getElementById('localContactsFolder').children.length > 0) {
            document.getElementById('localContactsFolder').removeChild(document.getElementById('localContactsFolder').firstChild);
        }

        //fill list of address books - ignore LDAP, Mailinglists and history
        let selected = -1;
        let abManager = Components.classes["@mozilla.org/abmanager;1"].getService(Components.interfaces.nsIAbManager);
        let allAddressBooks = abManager.directories;
        while (allAddressBooks.hasMoreElements()) {
            let addressBook = allAddressBooks.getNext();
            if (addressBook instanceof Components.interfaces.nsIAbDirectory && !addressBook.isRemote && !addressBook.isMailList && addressBook.fileName !== 'history.mab') {
                var ab = document.createElement('listitem');
                ab.setAttribute('label', addressBook.dirName);
                ab.setAttribute('value', addressBook.URI);
                count = count + 1;

                //is this book the selected one? 
                if (this.prefs.getCharPref('abname') === addressBook.URI) {
                    selected = count;
                }
                document.getElementById('localContactsFolder').appendChild(ab);
            }
        }

        if (selected !== -1) document.getElementById('localContactsFolder').selectedIndex = selected;
    },

    reset: function() {
        this.prefs.setCharPref("polkey", '0');
        this.prefs.setCharPref("folderID", "");
        this.prefs.setCharPref("synckey", "");
        this.prefs.setCharPref("LastSyncTime", "-1");
        this.prefs.setCharPref("deviceId", Date.now());
        this.prefs.setCharPref("autosync", "0");

        /* Clear ServerId and LastModDate of all cards in addressbook selected for sync - WHY ??? */
        var abManager = Components.classes["@mozilla.org/abmanager;1"].getService(Components.interfaces.nsIAbManager);
        var addressBook = abManager.getDirectory(this.prefs.getCharPref("abname"));
        var cards = addressBook.childCards;
        while (cards.hasMoreElements()) {
            let card = cards.getNext();
            if (card instanceof Components.interfaces.nsIAbCard) {
                card.setProperty('ServerId', '');
                card.setProperty("LastModifiedDate", '');
                addressBook.modifyCard(card);
            }
        }

        /* Looks like a cleanup of cards marked for cleanup - WHY ??? */
        Components.utils.import("resource://gre/modules/FileUtils.jsm");
        var file = FileUtils.getFile("ProfD", ["DeletedCards"]);
        var entries = file.directoryEntries;
        while (entries.hasMoreElements()) {
            var entry = entries.getNext();
            entry.QueryInterface(Components.interfaces.nsIFile);
            entry.remove("true");
        }
    },

    softreset: function() {
        this.prefs.setCharPref("go", "resync");
    },

    toggelgo: function() {
        if (this.prefs.getCharPref("go") === "0") {
            this.prefs.setCharPref("go", "1");
        } else {
            this.prefs.setCharPref("go", "0");
        }
    }, 

    cape: function() {
        function openTBtab(tempURL) {
            var tabmail = null;
            var mail3PaneWindow =
                Components.classes["@mozilla.org/appshell/window-mediator;1"]
                .getService(Components.interfaces.nsIWindowMediator)
                .getMostRecentWindow("mail:3pane");
            if (mail3PaneWindow) {
                tabmail = mail3PaneWindow.document.getElementById("tabmail");
                mail3PaneWindow.focus();
                tabmail.openTab("contentTab", {
                    contentPage: tempURL
                });
            }
            return (tabmail != null);
        }

        openTBtab("http://www.c-a-p-e.co.uk");
    },

    notes: function() {
        function openTBtab(tempURL) {
            var tabmail = null;
            var mail3PaneWindow =
                Components.classes["@mozilla.org/appshell/window-mediator;1"]
                .getService(Components.interfaces.nsIWindowMediator)
                .getMostRecentWindow("mail:3pane");
            if (mail3PaneWindow) {
                tabmail = mail3PaneWindow.document.getElementById("tabmail");
                mail3PaneWindow.focus();
                tabmail.openTab("contentTab", {
                    contentPage: tempURL
                });
            }
            return (tabmail != null);
        }

        openTBtab("chrome://tzpush/content/notes.html");
    },

/*    updatepass: function() {
        this.NEWPASSWORD = document.getElementById('passbox').value;
        this.setpassword();
    }, */

    setselect: function(value) {
        this.prefs.setCharPref('abname', value);
    }

};