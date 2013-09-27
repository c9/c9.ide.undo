define(function(require, exports, module) {
    "use strict";
    
    main.consumes = [
        "Plugin", "menus", "tabManager", "commands", "apf"
    ];
    main.provides = ["undo"];
    return main;

    function main(options, imports, register) {
        var Plugin      = imports.Plugin;
        var menus       = imports.menus;
        var commands    = imports.commands;
        var tabs        = imports.tabManager;
        var apf         = imports.apf;

        /***** Initialization *****/

        var plugin = new Plugin("Ajax.org", main.consumes);
        var emit   = plugin.getEmitter();

        function canDo (actionName) {
            return function () {
                var tab = tabs.focussedTab;
                return  tab && tab.document.undoManager[actionName]();
            };
        }

        var canUndo = canDo("canUndo");
        var canRedo = canDo("canRedo");

        var loaded = false;
        function load(callback){
            if (loaded) return false;
            loaded = true;

            commands.addCommand({
                name: "c9_undo",
                exec: undo,
                isAvailable : canUndo
            }, plugin);
            commands.addCommand({
                name: "c9_redo",
                exec: redo,
                isAvailable : canRedo
            }, plugin);

            menus.addItemByPath("Edit/Undo", new apf.item({
                command : "c9_undo"
            }), 100, plugin);
            menus.addItemByPath("Edit/Redo", new apf.item({
                command : "c9_redo"
            }), 200, plugin);
        }

        /***** Methods *****/
        function undo() {
            if (canUndo() && apf.isChildOf(tabs.container, apf.activeElement, true))
                tabs.focussedTab.document.undoManager.undo();
            // else if (apf.activeElement == self.trFiles) {
                //@todo the way undo is implemented doesn't work right now
                //trFiles.getActionTracker().undo();
            // }
        }

        function redo() {
            if (canRedo() && apf.isChildOf(tabs.container, apf.activeElement, true))
                tabs.focussedTab.document.undoManager.redo();
            // else if (apf.activeElement == self.trFiles) {
                //@todo the way undo is implemented doesn't work right now
                //trFiles.getActionTracker().redo();
            // }
        }


        /***** Lifecycle *****/
        plugin.on("load", function(){
            load();
        });
        plugin.on("enable", function(){

        });
        plugin.on("disable", function(){

        });
        plugin.on("unload", function(){
            loaded = false;
        });

        /***** Register and define API *****/

        /**
         * Undo module for Cloud9 IDE
         * @singleton
         */
        plugin.freezePublicAPI({
            /**
             * Reverts the last edit made to the currently focussed tab document
             */
            undo: undo,

            /**
             * Re-executes the last reverted edit in the currently focussed tab document
             */
            redo: redo
        });

        register(null, {
            undo: plugin
        });
    }
});
