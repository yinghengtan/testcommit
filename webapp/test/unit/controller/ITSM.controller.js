/*global QUnit*/

sap.ui.define([
	"ITSM/ITSM_Interface/controller/ITSM.controller"
], function (Controller) {
	"use strict";

	QUnit.module("ITSM Controller");

	QUnit.test("I should test the ITSM controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});