/**
 * @author Mohammed Al-said

 * @description Content page script.
 */
(function(){

    "use strict";

    //this is the HTML ID that will be used to identify the extensions badge on the page
    //if a valid "sobject id" is found in the URL
    var randomCmpId = (chrome.runtime.id+'_'+Math.random()).replace('.','');
    
    //stores current url: triggers content script only on "url" change
    var _currentUrl = window.location.href;
    var fsModal = $(`<div class="modal" id='fsModel' tabindex="-1" role="dialog">
                <div class="modal-dialog modal-dialog-scrollabl modal-xl" role="document">
                <div class="modal-content" style="height: 500px;">
                    <div class="modal-header">
                    <h3 class="modal-title">Rules</h3>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                    </button>
                    </div>
                    <div class="modal-body">
                        <iframe style="width: 100%; height: 100%; border: none;" src="">
                    </div>
                </div><!-- /.modal-content -->
                </div><!-- /.modal-dialog -->
                </div>`);
    //handler for the response to background message (to get a session id)
    var responseHandler = function(message){

        //gets an object id from page url (if any)
        var objectId = $Utils.getSFIdFromURL(message.session.isLex);

        var appContainer = document.getElementById(randomCmpId);

        if(appContainer){
            appContainer.remove();
        }

        if(!objectId) return;
        
        appContainer = document.createElement('div');
        appContainer.id = randomCmpId;
        appContainer.title = 'Click to show all Rules';
        appContainer.className = 'fs-badge';
        window.document.body.appendChild(appContainer);
        var url = $Utils.getHealthCheckURL(message.session.domainAPI,
            message.session.sid,
            objectId);


        fsModal.find('iframe').attr('src',url);
        window.document.body.appendChild(fsModal[0]);
        appContainer.addEventListener('click', function(evt){


            $("#fsModel").modal("show");
            $("#fsModel").draggable({
                handle: ".modal-header"
            }); 
            $("#fsModel .modal-content").resizable();
            $('#fsModel iframe').attr('src',url);
        });
    };


    //first session info request
    chrome.runtime.sendMessage({action: window.$Constants.MESSAGES.GET_ORG_ID_BKG}, responseHandler);
    
    //this interval is necessary because LEX doesn't always refreshes the page when
    //moving in the LEX app, so we need to trigger the data retrievement periodically,
    //checking the page url
    setInterval(function(){
        //if current url has not changed since last execution, returns
        if(_currentUrl === window.location.href) return;

        chrome.runtime.sendMessage({action: window.$Constants.MESSAGES.GET_ORG_ID_BKG}, responseHandler);

        //resets current url var
        _currentUrl = window.location.href;
    }, 2000);

}());