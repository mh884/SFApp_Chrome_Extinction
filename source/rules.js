/**
 * @author Mohammed Al-said
 * @link
 * @description appHealthCheck controller: Check all Formstack Remote site setting refresh token and CSP trust site
 */
window.rule = window.rule || (function  () {
"use strict";
  var helper = {
    optionHandler: function(element, otherFileValue) {
      var optionItem;
        if (element.hasOwnProperty('dataItems')) {
        var options = element.dataItems.item;
          optionItem = "<td data='options'><table>" ;
          for (let index = 0; index < options.length; index++) {
            const option = options[index];
            optionItem += "<tr><td data-value='"+option+"'>" + option + "</td></tr>";
        }
        optionItem += "</td></table>" ;
        } else {
        if(element.hasOwnProperty('operand2') || (element.hasOwnProperty('other') && element.other._isdynamic != "true")){
          optionItem = $("<td data-value ='"+element.operand2.__text+"'>" + element.operand2.__text + "</td>");
        }else if(element.hasOwnProperty('other') && element.other._isdynamic == "true"){
          optionItem = $("<td data-value ='"+element.target.__text+"'>" + element.target.__text + "</td>");
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
    
    conditionRowHandler :function( conditionElement, rowColor) {
      var otherFileValue = $("<td></td>");
      helper.optionHandler(conditionElement, otherFileValue);
      var conditionRow = 
        "<tr style='background-color:"+rowColor+"'><td></td>" +
          helper.getTargetFieldNameTextCol(conditionElement.operand1 )+
          "<td>" +
          conditionElement._operator +
          "</td>" +
          otherFileValue[0].innerHTML+
          "</tr>";
      return conditionRow;
    },
    conditionOperationRowHandler:function name(section, rowColor) {
      return "<tr style='background-color:"+rowColor+"'><td> <b>" +
      "<span style='text-transform:uppercase'>"+section._op + '</span>'+
      " IF " +
      section._condrule + "<br/> of the following is true"+
      "</b></td></tr>" ;
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
        '</tr></thead><tbody id= "condition"></tbody></table>'
      );
    },
    getSubConditionHandler:function (section, condition, callbackHTML) {
      var rowColor = helper.getRandomColor();
      var rowOperation = helper.conditionOperationRowHandler(section,rowColor);
      callbackHTML.find("tbody#condition").append(rowOperation);
      for (let conditionIndex = 0; conditionIndex < condition.length; conditionIndex++) {
        const conditionElement = condition[conditionIndex];
        var conditionRow = helper.conditionRowHandler(conditionElement,rowColor);
        callbackHTML.find("tbody#condition").append(conditionRow);
      }
    },
    conditionsHandler:function(section, condition, callbackHTML){
      if (Array.isArray(condition)) {
        helper.getSubConditionHandler(section, condition, callbackHTML); 
      } else {
        var rowColor = helper.getRandomColor();
        var rowOperation = helper.conditionOperationRowHandler(section,rowColor);
        callbackHTML.find("tbody#condition").append(rowOperation);

        var conditionRow = helper.conditionRowHandler(condition, rowColor);
        callbackHTML.find("tbody#condition").append(conditionRow);
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
    getTargetFieldNameTextCol:function(fieldname) {
      return "<td data-value='"+fieldname+"'>" + fieldname+ "</td>";
    },
    populateValueHandler:function(thenElementAction, otherFileValue) {
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

        var actionRow = helper.createActionRow(thenElementAction);
        conditionActionTable.find("tbody#conditionAction").append(actionRow);
        thenContainer.append(conditionActionTable);
      }
  },
    createActionRow:function(thenElementAction) {
      var rowColor ="#132f8021";
      var actionRow = $("<tr  data='conditionRow' style='background-color:"+rowColor+"'>"  + "<td data-action='"+thenElementAction.action+"'>" + thenElementAction.action + "</td>" + "</tr>");

      var targetFieldName = "";
      var otherFieldValue = $("<td></td>");

      if (thenElementAction.other._dtType == "setpicklist" && (thenElementAction.other._isdynamic == "false" || thenElementAction.other._populate == "false")) {
        // Field name
        targetFieldName = helper.getTargetFieldNameTextCol(thenElementAction.target.__text);

        // Value Options
        helper.optionHandler(thenElementAction, otherFieldValue);

        actionRow.append(targetFieldName);
        actionRow.append(otherFieldValue);
      } else if (thenElementAction.other._isdynamic == "false" || thenElementAction.other._populate == "true") {
        // Field name
        // Action: populate
        targetFieldName = helper.getTargetFieldNameTextCol(thenElementAction.target.__text);

        // Value
        helper.populateValueHandler(thenElementAction, otherFieldValue);

        actionRow.append(targetFieldName);
        actionRow.append(otherFieldValue);
      } else if (thenElementAction.other._isdynamic == "" || thenElementAction.other._populate == "false") {
        // Field name
        // Action: required / not required
        targetFieldName = helper.getTargetFieldNameTextCol(thenElementAction.target.__text);

        actionRow.append(targetFieldName);
      }
      return actionRow;
    },
    getActionRows:function(thenAction) {
      var thenContainer = helper.createThenContainer();
      helper.thenActionHandler(thenAction, thenContainer);
     
      return thenContainer;
    },
    getConditionRows:function name(sections) {
      var ruleContainerDiv = $("<div class='ruleContainer' style='margin-bottom: 36px; border-bottom-style: ridge;'></div>");

      // Field Name/ Operation / value
      var conditionTable = helper.createConditionTable();

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
        helper.conditionsHandler(section, condition, conditionTable);
        ruleContainerDiv.append(conditionTable);
      }

      return ruleContainerDiv;
    },
    getRulesTable:function (rulesRecords) {
      var rules = helper.convertXMLToJSON(rulesRecords);
      var rulesContainer = $('<div></div>');
      for (var rulesIndex = 0; rulesIndex < rules.length; rulesIndex++) {
        const rule = rules[rulesIndex].rule;
        // IF section
        var ruleContainerDiv = helper.getConditionRows(rule.if.section);
        // Then section
        var actionContainer = helper.getActionRows(rule.then.result);
        ruleContainerDiv.append(actionContainer);
        rulesContainer.append(ruleContainerDiv);
      }
      return rulesContainer;
    },
    getRuleContainer:function(element){
      if(element.className == 'ruleContainer')
      {
        return element;
      }
      console.log(element);
      if(typeof(element.parentNode) != "undefined"){
        return helper.getRuleContainer(element.parentNode);
      }else{
        return "ERROR";
      }
    },
    search:function(){
      var searchText = $("#txtSearch").val();
      helper.tagMatchedSearch(searchText);
      helper.hideUnMatchedSearch();
    },
    tagMatchedSearch:function(searchText) {
      // hide all rows
      var hideNotMatchedRuleContainers = [];
      // show all row with search text
      var dataValue = document.querySelectorAll('td[data-value*="'+searchText+'"]');
      for (let colIndex = 0; colIndex < dataValue.length; colIndex++) {
        var element = dataValue[colIndex];
        if(element.getAttribute('data-value') == searchText){
          var ruleContainer = helper.getRuleContainer(element);
          if(element.getAttribute('matched') == null){
            ruleContainer.setAttribute('matched','matched');
          }
        }
      }
    },
    hideUnMatchedSearch:function(){
      var rulesContainer = document.getElementsByClassName('ruleContainer');
      for (let ruleIndex = 0; ruleIndex < rulesContainer.length; ruleIndex++) {
        const element = rulesContainer[ruleIndex];
        if(element.getAttribute('matched') == null){
          element.classList.add('hideRule');
        }
      }
    },
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
    
        var rulesContainer = $("#rulesContainer");
        var rulesRecords = data.records;
  
        // create div text to show condition
        // create table header to show all the rule condition operand
        rulesContainer.append(helper.getRulesTable(rulesRecords));

        var buttonSearch = document.getElementById('button-search');
        buttonSearch.addEventListener('click', function(evt){
          window.rule.search();
        });
        
      });
    }
  }
run();
  return{
    search: helper.search,
    run: run,
  }
})();
