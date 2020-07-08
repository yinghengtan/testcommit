sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel"
], function (Controller, MessageToast, JSONModel) {
	"use strict";

	return Controller.extend("ITSM.ITSM_Interface.controller.ITSM", {
		onInit: function () {
			var oModel = this.getModel("questionnaire").getProperty("/");
			var oTotalQuestion = oModel.value.length;
			var oCustomerID = "C001";
			var oCustomerName = "Simon Solution";

			var oArrayModel = new JSONModel({
				"oEntry": [],
				"oTotalQuestions": oTotalQuestion,
				"oCustomerID"    : oCustomerID,
				"oCustomerName"	 : oCustomerName
			});

			this.getView().setModel(oArrayModel, "arrayModel");
			this._bindQuestions();
		},

		getModel: function (sModelName) {
			return (!this.getView().getModel(sModelName)) ? this.getOwnerComponent().getModel(sModelName) : this.getView().getModel(sModelName);
		},

		onSubmit: function (oEvent) {
			var oEntryModel = this.getView().getModel("arrayModel");
			var oEntry = oEntryModel.getProperty("/oEntry");
			var row = 0;
			var oStr = "";

			for (row = 0; row < oEntry.length; row++) {
				oStr = oStr + "Question ID: " + oEntry[row].questionId + " Answer ID: " + oEntry[row].answerPossibilityId + " Answer Text: " +
					oEntry[row].answerText + "\r\n";
			}

			sap.m.MessageToast.show(oStr, {
				width: "500px"
			});
		},
		_getUniqCategory: function () {
			var maxCount = 0;
			//Get Category entity set for unique record

			maxCount = 6 + 1;
			return maxCount;
		},
		_bindQuestions: function () {
			var that = this;
			var oModel = this.getModel("questionnaire").getProperty("/");
			var j, c, i;
			var maxCategory = this._getUniqCategory();

			//Display Question based on Category ID
			for (c = 1; c < maxCategory; c++) {

				// main layout
				var oLayout = new sap.ui.commons.layout.MatrixLayout();

				//Row template
				var oRowTemplate = new sap.ui.commons.layout.MatrixLayoutRow();
				var oCellTemplate = new sap.ui.commons.layout.MatrixLayoutCell();
				var oSubLayout = new sap.ui.commons.layout.MatrixLayout();

				//Question row
				for (i = 0; i < oModel.value.length; i++) {
					//Filter Category value
					if (oModel.value[i].category.id !== c) {
						continue;
					}

					//Row and column for Control (radiobutton, textbox, etc)
					var oRow = new sap.ui.commons.layout.MatrixLayoutRow();
					var oCell = new sap.ui.commons.layout.MatrixLayoutCell();

					//Answer row for question
					var oLbl = new sap.ui.commons.Label();
					var oCB = new sap.ui.commons.CheckBox();
					var oTF = new sap.ui.commons.TextField();
					var oRBG1 = new sap.ui.commons.RadioButtonGroup();

					//Get ID to find View Object (Panel) for load question and answer 
					var oCategory = oModel.value[i].category.id;
					var oContent = this.byId("idPanel_C" + oCategory);

					//User select indicator
					var bSingleSelect = false;

					//Display Label for Question
					oLbl = new sap.ui.commons.Label({
						text: oModel.value[i].question,
						required: true
					});

					this._updateSublayout(oCell, oRow, oSubLayout, oLbl);

					//add sub layout to main layout
					oCellTemplate.addContent(oSubLayout);
					oRowTemplate.addCell(oCellTemplate);
					oLayout.addRow(oRowTemplate);
					
					//Display possible answer
					if (oModel.value[i].type === "freetext") {
						oRow = new sap.ui.commons.layout.MatrixLayoutRow();
						oCell = new sap.ui.commons.layout.MatrixLayoutCell();
						oTF = new sap.ui.commons.TextField({
							id: "ques-" + i + "-m_ans-" + j,
							width: "1000px",
							change: function (oEvent) {
								//get changed value and updated the json data
								var _oCbId = oEvent.getSource().getIdForLabel();
								var aInd = _oCbId.split("-");
								var indQuest = aInd[1];
								var indAns = aInd[3];

								that._updateModel(indQuest, indAns, "FT", oEvent.getSource().getValue());
							}
						});
						this._updateSublayout(oCell, oRow, oSubLayout, oTF);
					} else {
						for (j = 0; j < oModel.value[i].possibilities.length; j++) {
							oRow = new sap.ui.commons.layout.MatrixLayoutRow();
							oCell = new sap.ui.commons.layout.MatrixLayoutCell();

							if (oModel.value[i].type === "multi") {
								oCB = new sap.ui.commons.CheckBox({
									id: "ques-" + i + "-m_ans-" + j,
									text: oModel.value[i].possibilities[j].answerPossibility,
									change: function (oEvent) {
										//get changed value and updated the json data
										var _oCbId = oEvent.getSource().getIdForLabel();
										var aInd = _oCbId.split("-");
										var indQuest = aInd[1];
										var indAns = aInd[3];
										that._updateModel(indQuest, indAns, "CB");
									}
								});

								this._updateSublayout(oCell, oRow, oSubLayout, oCB);

							} else if (oModel.value[i].type === "single") {
								//Check whether is first record
								if (j === 0) {
									oRBG1 = new sap.ui.commons.RadioButtonGroup({
										select: function (oEvent) {
											//get changed value and updated the json data
											var _oRbgId = oEvent.getSource().getSelectedItem().getId();
											var aInd = _oRbgId.split("-");
											var indQuest = aInd[1];
											var indAns = aInd[3];

											that._updateModel(indQuest, indAns, "RB");
										}
									});
								}
								//Radio button need to update layout after all answers is fully populated
								bSingleSelect = true;
								var oItem = new sap.ui.core.Item({
									id: "ques-" + i + "-s_ans-" + j,
									text: oModel.value[i].possibilities[j].answerPossibility,
									key: oModel.value[i].possibilities[j].id
								});
								oRBG1.addItem(oItem);
								oRBG1.setSelectedIndex(null);
							}
						}
						//Update Radio button
						if (bSingleSelect) {
							this._updateSublayout(oCell, oRow, oSubLayout, oRBG1);
						}
					}

					//Update layout
					oContent.addContent(oLayout);
				}

			}

		},
		_updateSublayout: function (bCell, bRow, bSubLayout, bControl) {
			bCell.addContent(bControl);
			bRow.addCell(bCell);
			bSubLayout.addRow(bRow);
		},
		_updateModel: function (bQuestion, bAnswer, bType, bText) {
			var oModel = this.getModel("questionnaire").getProperty("/");
			var oEntryModel = this.getView().getModel("arrayModel");

			var oEntry = oEntryModel.getProperty("/oEntry");
			var oTotalQuestion = oEntryModel.getProperty("/oTotalQuestions");

			var oDuplicateEntry = [];
			var oUniEntry = [];

			var oFlagRow, oFlagRmw, oFlagInd, row;

			//Question Type For Radion Button And Free Text
			if ((bType === "RB") || (bType === "FT")) {
				for (row = 0; row < oEntry.length; row++) {
					//Check question wherther exist in Array
					if (oEntry[row].questionId === oModel.value[bQuestion].id) {
						oFlagRow = row;
						oFlagInd = "X";
						row = oEntry.length + 1;
					}
				}
				//Remove the exist question in Array
				if (oFlagInd === "X") {
					oEntry.splice(oFlagRow, 1);
				}

				//Question Type For Check Box
			} else if (bType === "CB") {
				for (row = 0; row < oEntry.length; row++) {

					if ((oEntry[row].questionId === oModel.value[bQuestion].id) &&
						(oEntry[row].answerPossibilityId === oModel.value[bQuestion].possibilities[bAnswer].id)) {
						oFlagRow = row;
						oFlagInd = "X";
						row = oEntry.length + 1;
					}
				}
				//Remove exist record
				if (oFlagInd === "X") {
					oEntry.splice(oFlagRow, 1);
					oFlagRmw = "X";
				}
			}

			//Check indicator for Remove 
			if (oFlagRmw !== "X") {
				if (bType === "FT") {
					if (String(bText) !== "") {
						oEntry.push({
							questionId: oModel.value[bQuestion].id,
							answerText: String(bText)
						});
					}

				} else {
					oEntry.push({
						questionId: oModel.value[bQuestion].id,
						answerPossibilityId: oModel.value[bQuestion].possibilities[bAnswer].id,
						answerText: oModel.value[bQuestion].possibilities[bAnswer].answerPossibility
					});
				}

			}

			//Update latest Array into JSON
			oEntryModel.setProperty("/oEntry", oEntry);

			//Push all Question into one array to find unique record
			for (row = 0; row < oEntry.length; row++) {
				oDuplicateEntry.push({
					questionId: oEntry[row].questionId
				});
			}

			//Remove duplicate 
			oUniEntry = this._removeDuplicates(oDuplicateEntry);

			//Update progress bar by using unique question
			this._updateProgressBar(oUniEntry.length, oTotalQuestion);
		},

		_removeDuplicates: function (arr) {
			var clean = [];
			var cleanLen = 0;
			var arrLen = arr.length;

			for (var i = 0; i < arrLen; i++) {
				var el = arr[i];
				var duplicate = false;

				for (var j = 0; j < cleanLen; j++) {
					if (el.questionId !== clean[j].questionId) {
						continue;
					} else {
						duplicate = true;
						break;
					}
				}
				if (duplicate) {
					continue;
				} else {
					clean[cleanLen++] = el;
				}
			}
			return clean;
		},

		_updateProgressBar: function (bAns, bQues) {
			var oPercentage;
			var oAns = bAns;
			var oQues = bQues;
			var oPrgsInd = this.byId("prgsInd");

			oPercentage = oAns / oQues;
			oPercentage = (oPercentage * 100).toFixed(2);

			oPrgsInd.setPercentValue(String(oPercentage));
			oPrgsInd.setDisplayValue(oPercentage + "%");

		}

	});
});