/**
 * @author Mohammed Al-said
 * @link
 * @description appHealthCheck controller: Check all Formstack Remote site setting refresh token and CSP trust site
 */
$(function () {
  "use strict";

  var formId = $Utils.getURLParameter("id");
  var sessionId = $Utils.getURLParameter("sid");
  var seerverUrl = $Utils.getURLParameter("surl");
  var query = "select id ,Name,Rule_Order__c,Rule_Script__c ,Rule_XML__c from Form_Rule__c WHERE form__c=" + "'" + formId + "'";
  function optionHandler(element, otherFileValue) {
    if (element.hasOwnProperty('dataItems')) {
		var options = element.dataItems.item;
      var optionItem = "<td><table>" ;
      for (let index = 0; index < options.length; index++) {
        const option = options[index];
        optionItem += "<tr><td>" + option + "</td></tr>";
	  }
	  optionItem += "</td></table>" ;
    } else {
		if(element.hasOwnProperty('operand2') || (element.hasOwnProperty('other') && element.other._isdynamic != "true")){
			optionItem = $("<td>" + element.operand2.__text + "</td>");
		}else if(element.hasOwnProperty('other') && element.other._isdynamic == "true"){
			optionItem = $("<td>" + element.target.__text + "</td>");
		}
	}
	otherFileValue.append(optionItem);
  }
  function getRandomColor() {
	var letters = '0123456789';
	var color = '#';
	for (var i = 0; i < 4; i++) {
	  color += letters[Math.floor(Math.random() * 5)];
	}
	return color;
  }
  function ifAllAnyTrHandler(section, conditionIndex, conditionElement, rowColor) {
	var ifAllAnyTr;

		var otherFileValue = $("<td></td>");
		optionHandler(conditionElement, otherFileValue);
		ifAllAnyTr = 
			"<tr style='background-color:"+rowColor+"'>" +
			  "<td>" +
			  section._index +
			  "." +
			  conditionIndex +
			  " " +
			  section._op +
			  " IF " +
			  section._condrule +
			  "</td>" +
			  "<td>" +
			  conditionElement.operand1 +
			  "</td>" +
			  "<td>" +
			  conditionElement._operator +
			  "</td>" +
			  otherFileValue[0].innerHTML+
			  "</tr>";
		  
	
	return ifAllAnyTr;
  }

  $Utils.query(query, seerverUrl, sessionId, function (callback, data) {
    if (data.done == false) {
      return;
    }

    var rulesContainer = $("#RulesContainer");
    var rulesRecords = data.records;
    var rules = [];
    for (var index = 0; index < rulesRecords.length; index++) {
      var x2js = new X2JS();
      var xml = rulesRecords[index].Rule_XML__c;
      var document = x2js.xml2js(xml);
      rules.push(document);
    }

    // create div text to show condition
    // create table header to show all the rule condition operand

    for (var rulesIndex = 0; rulesIndex < rules.length; rulesIndex++) {
      const rule = rules[rulesIndex].rule;
      // IF section
      var sections = rule.if.section;
      var ruleContainerDiv = $("<div></div>");

      // Field Name/ Operation / value
      var conditionTable = $(
        '<table id="conditionTable" style="width: 80%"><thead><tr>' +
          '<th scope="col"></th>' +
          '<th scope="col">Field Name</th>' +
          '<th scope="col">Operator</th>' +
          '<th scope="col">value</th>' +
          '</tr></thead><tbody id = "condition"></tbody></table>'
      );

      var sectionLength;
      if (Array.isArray(sections)) {
        sectionLength = sections.length;
      } else {
        sectionLength = 1;
      }

      for (var sectionIndex = 0; sectionIndex < sectionLength; sectionIndex++) {
        var section;
        var condition;
        if (sections.hasOwnProperty("condition")) {
          condition = sections.condition;
          section = sections;
        } else {
          section = sections[sectionIndex];
          condition = section.condition;
        }

        // IF All/Any
        //creates a new row for each condition

        if (Array.isArray(condition)) {
		  var ifAllAnySubTable = $('<table style="width:200%" id="ifAllAnySubTable" ><tbody id="ifAllAnySub">');
		  var rowColor = getRandomColor();
          for (let conditionIndex = 0; conditionIndex < condition.length; conditionIndex++) {
			const conditionElement = condition[conditionIndex];
			var ifAllAnyTr = ifAllAnyTrHandler(section, conditionIndex, conditionElement,rowColor);
            ifAllAnySubTable.find("tbody#ifAllAnySub ").append(ifAllAnyTr);
          }
          var trWrapper = $("<tr></tr>").append(ifAllAnySubTable);
          conditionTable.find("tbody#condition").append(trWrapper);
        } else {
			var rowColor = getRandomColor();
		   var ifAllAnyTr = ifAllAnyTrHandler(section, '', condition, rowColor);
          conditionTable.find("tbody#condition").append(ifAllAnyTr);
        }

        ruleContainerDiv.append(conditionTable);

        // If Then
        var thenDiv = $("<div><h3>Then</h3></div>");
        // Action/ field / value
        var conditionActionTable = $(
          '<table style="width: 60%;"><thead><tr>' + '<th scope="col">Action</th>' + '<th scope="col">Target Field Name</th>' + '<th scope="col">value</th>' + "</tr></thead><tbody id='conditionAction'></tbody></table>"
        );

        // Create row of then action
        var thenAction = rule.then.result;
        var thenActionLegth = 0;
        if (Array.isArray(thenAction)) {
          thenActionLegth = thenAction.length;
        } else {
          thenActionLegth = 1;
        }
        for (let thenIndex = 0; thenIndex < thenActionLegth; thenIndex++) {
          var thenElementAction;

          if (thenAction.hasOwnProperty("action")) {
            thenElementAction = thenAction;
          } else {
            thenElementAction = thenAction[thenIndex];
          }
		  var rowColor ="#132f8021";
          var tr = $("<tr style='background-color:"+rowColor+"'>"  + "<td>" + thenElementAction.action + "</td>" + "</tr>");

          var otherFieldName = "";
          var targetFieldName = "";
          var otherFileValue = $("<td></td>");
          var targetFieldValue = $("<td></td>");

          if (thenElementAction.other._dtType == "setpicklist" && (thenElementAction.other._isdynamic == "false" || thenElementAction.other._populate == "false")) {
            // Field name
            targetFieldName = $("<td>" + thenElementAction.target.__text + "</td>");

            // Value Options
            optionHandler(thenElementAction, otherFileValue);

            tr.append(targetFieldName);
            tr.append(otherFileValue);
          } else if (thenElementAction.other._isdynamic == "false" || thenElementAction.other._populate == "true") {
            // Field name
            // Action: populate
            targetFieldName = $("<td>" + thenElementAction.target.__text + "</td>");

            // Value
            if (thenElementAction.other._dtType == "") {
              otherFileValue = $("<td>" + thenElementAction.other.__text + "</td>");
            } else if (thenElementAction.other._dtType == "setpicklist" || thenElementAction.other._dtType == "picklist") {
              optionHandler(thenElementAction, otherFileValue);
            }
            tr.append(targetFieldName);
            tr.append(otherFileValue);
          } else if (thenElementAction.other._isdynamic == "" || thenElementAction.other._populate == "false") {
            // Field name
            // Actopm: required / not required
            targetFieldName = $("<td>" + thenElementAction.target.__text + "</td>");

            tr.append(targetFieldName);
          }

          conditionActionTable.find("tbody#conditionAction").append(tr);
          thenDiv.append(conditionActionTable);
        }
      }
      ruleContainerDiv.append(thenDiv);
      rulesContainer.append(ruleContainerDiv);
    }
  });
});
