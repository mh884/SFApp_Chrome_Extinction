/**
 * @author Mohammed Al-said
 * @link
 * @description appHealthCheck controller: Check all Formstack Remote site setting refresh token and CSP trust site
 */
$(function  () {
"use strict";

 


  var helper = {
    optionHandler: function(element, otherFileValue) {
      var optionItem;
        if (element.hasOwnProperty('dataItems')) {
        var options = element.dataItems.item;
          optionItem = "<td><table>" ;
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
    },
    getRandomColor:function() {
      var letters = '0123456789';
      var color = '#';
      for (var i = 0; i < 4; i++) {
        color += letters[Math.floor(Math.random() * 5)];
      }
      return color;
    },
    
    ifAllAnyTrHandler :function( conditionElement, rowColor) {
      var otherFileValue = $("<td></td>");
      helper.optionHandler(conditionElement, otherFileValue);
      var ifAllAnyTr = 
        "<tr style='background-color:"+rowColor+"'><td></td>" +
          "<td>" +
          conditionElement.operand1 +
          "</td>" +
          "<td>" +
          conditionElement._operator +
          "</td>" +
          otherFileValue[0].innerHTML+
          "</tr>";
        
    
      return ifAllAnyTr;
    },
    ifAllAnyOperationTrHandler:function name(section, rowColor) {
      return "<tr style='background-color:"+rowColor+"'><td>" +
      section._index +" "+
      section._op +
      " IF " +
      section._condrule +
      "</td></tr>" ;
    },
    convertXMLToJSON:function(rulesRecords) {
      var rules = [];
      for (var index = 0; index < rulesRecords.length; index++) {
        var x2js = new X2JS();
        var xml = rulesRecords[index].Rule_XML__c;
        var document = x2js.xml2js(xml);
        rules.push(document);
      }
      return rules;
    },
    createConditionTable:function(){ return $(
      '<table id="conditionTable" class="table" ><thead class="table-dark"><tr>' +
        '<th scope="col"></th>' +
        '<th scope="col">Field Name</th>' +
        '<th scope="col">Operator</th>' +
        '<th scope="col">Value</th>' +
        '</tr></thead><tbody id = "condition"></tbody></table>'
      );
    },
    getSubIfAllAnyConditionHandler:function (section, condition, callbackHTML) {
      var rowColor = helper.getRandomColor();
      var rowOperation = helper.ifAllAnyOperationTrHandler(section,rowColor);
      callbackHTML.find("tbody#condition").append(rowOperation);
      for (let conditionIndex = 0; conditionIndex < condition.length; conditionIndex++) {
        const conditionElement = condition[conditionIndex];
        var ifAllAnyTr = helper.ifAllAnyTrHandler(conditionElement,rowColor);
        callbackHTML.find("tbody#condition").append(ifAllAnyTr);
      }
    },
    getIfAllAnyConditions:function(section, condition, callbackHTML){
      if (Array.isArray(condition)) {
        helper.getSubIfAllAnyConditionHandler(section, condition, callbackHTML); 
      } else {
        var rowColor = helper.getRandomColor();
        var rowOperation = helper.ifAllAnyOperationTrHandler(section,rowColor);
        callbackHTML.find("tbody#condition").append(rowOperation);

        var ifAllAnyTr = helper.ifAllAnyTrHandler(condition, rowColor);
        callbackHTML.find("tbody#condition").append(ifAllAnyTr);
      }
    },
    createThenConditionActionTable:function(){
      return $(
        '<table class="table" ><thead class="table-dark"><tr>' + '<th scope="col">Action</th>' + '<th scope="col">Target Field Name</th>' + '<th scope="col">value</th>' + "</tr></thead><tbody id='conditionAction'></tbody></table>"
      );
    },
    createThenContainer:function() {
      return  $("<div style='margin-left: 10px;'><h3>Then</h3></div>");
    },
    getTargetTextTd:function(thenElementAction) {
      return $("<td>" + thenElementAction.target.__text + "</td>");
    },
    PopulateValueHandler:function(thenElementAction, otherFileValue) {
      if (thenElementAction.other._dtType == "") {
        otherFileValue.append(thenElementAction.other.__text);
      } else if (thenElementAction.other._dtType == "setpicklist" || thenElementAction.other._dtType == "picklist") {
        helper.optionHandler(thenElementAction, otherFileValue);
      }
      return otherFileValue;
    },
    thenActionHandler:(thenAction, thenContainer) => {
var conditionActionTable = helper.createThenConditionActionTable();
      var thenActionLength = 0;
      if (Array.isArray(thenAction)) {
        thenActionLength = thenAction.length;
      } else {
        thenActionLength = 1;
      }
      for (let thenIndex = 0; thenIndex < thenActionLength; thenIndex++) {
        var thenElementAction;

        if (thenAction.hasOwnProperty("action")) {
          thenElementAction = thenAction;
        } else {
          thenElementAction = thenAction[thenIndex];
        }

        var actionRow = helper.thenActionRow(thenElementAction);
        conditionActionTable.find("tbody#conditionAction").append(actionRow);
        thenContainer.append(conditionActionTable);
      }
},
    thenActionRow:function(thenElementAction) {
      var rowColor ="#132f8021";
      var actionRow = $("<tr style='background-color:"+rowColor+"'>"  + "<td>" + thenElementAction.action + "</td>" + "</tr>");

      var targetFieldName = "";
      var otherFieldValue = $("<td></td>");

      if (thenElementAction.other._dtType == "setpicklist" && (thenElementAction.other._isdynamic == "false" || thenElementAction.other._populate == "false")) {
        // Field name
        targetFieldName = helper.getTargetTextTd(thenElementAction);

        // Value Options
        helper.optionHandler(thenElementAction, otherFieldValue);

        actionRow.append(targetFieldName);
        actionRow.append(otherFieldValue);
      } else if (thenElementAction.other._isdynamic == "false" || thenElementAction.other._populate == "true") {
        // Field name
        // Action: populate
        targetFieldName = helper.getTargetTextTd(thenElementAction);

        // Value
        helper.PopulateValueHandler(thenElementAction, otherFieldValue);

        actionRow.append(targetFieldName);
        actionRow.append(otherFieldValue);
      } else if (thenElementAction.other._isdynamic == "" || thenElementAction.other._populate == "false") {
        // Field name
        // Action: required / not required
        targetFieldName = helper.getTargetTextTd(thenElementAction);

        actionRow.append(targetFieldName);
      }
      return actionRow;
    },
    createThenRows:function(thenAction) {
      var thenContainer = helper.createThenContainer();
      helper.thenActionHandler(thenAction, thenContainer);
     
      return thenContainer;
    },
    getRulesTable:function (rulesRecords) {
      var rules = helper.convertXMLToJSON(rulesRecords);
      var rulesContainer = $('<div></div>');
      for (var rulesIndex = 0; rulesIndex < rules.length; rulesIndex++) {
        const rule = rules[rulesIndex].rule;
        // IF section
        var sections = rule.if.section;
        var ruleContainerDiv = $("<div class='ruleContainer' style='margin-bottom: 36px; border-bottom-style: ridge;'></div>");
  
        // Field Name/ Operation / value
        var conditionTable = helper.createConditionTable();
  
        var sectionLength;
        if (Array.isArray(sections)) {
          sectionLength = sections.length;
        } else {
          sectionLength = 1;
        }
        var thenContainer;
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
          helper.getIfAllAnyConditions(section, condition, conditionTable);
          ruleContainerDiv.append(conditionTable);
  
          // Then
          thenContainer = helper.createThenRows(rule.then.result);
         
        }
        ruleContainerDiv.append(thenContainer);
        rulesContainer.append(ruleContainerDiv);
      }
      return rulesContainer;
    }
  };


  function run() {
    var formId = $Utils.getURLParameter("id");
    var sessionId = $Utils.getURLParameter("sid");
    var seerverUrl = $Utils.getURLParameter("surl");
    var query = '';
    if(formId !=null){
      query = "select id ,Name,Rule_Order__c,Rule_Script__c ,Rule_XML__c from Form_Rule__c WHERE form__c=" + "'" + formId + "'";
    }
  
    if(query != '' && seerverUrl != null && sessionId != null){
      $Utils.query(query, seerverUrl, sessionId, function (callback, data) {
        if (typeof(data) == "undefined"  || data.done == false) {
          return;
        }
    
        var rulesContainer = $("#RulesContainer");
        var rulesRecords = data.records;
  
        // create div text to show condition
        // create table header to show all the rule condition operand
        rulesContainer.append(helper.getRulesTable(rulesRecords));
  
      });
    }
  }

  run();
});
