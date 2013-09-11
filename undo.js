/**
 * Undo Module for the Cloud9 IDE
 *
 * @copyright 2010, Ajax.org B.V.
 * @license GPLv3 <http://www.gnu.org/licenses/gpl.txt>
 */
"use strict";
define(function(require, exports, module) {
    main.consumes = [
        "plugin", "menus", "tabs", "commands", "apf"
    ];
    main.provides = ["undo"];
    return main;

    function main(options, imports, register) {
        var Plugin      = imports.plugin;
        var menus       = imports.menus;
        var commands    = imports.commands;
        var tabs        = imports.tabs;
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
         * Finder implementation using nak
         **/
        plugin.freezePublicAPI({
            /**
             * Reverts last made change
             */
            undo: undo,

            /**
             * Re-executes last reverted change
             */
            redo: redo
        });

        register(null, {
            undo: plugin
        });
    }
});
