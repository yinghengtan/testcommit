/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"ITSM/ITSM_Interface/test/integration/AllJourneys"
	], function () {
		QUnit.start();
	});
});