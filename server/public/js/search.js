function tplawesome(e,t){res=e;for(var n=0;n<t.length;n++){res=res.replace(/\{\{(.*?)\}\}/g,function(e,r){return t[n][r]})}return res}

/********************************************************************/
/*                                                                  */
/*                      SEARCH PARA A ACTIVIDADE                    */
/*                                                                  */
/********************************************************************/
function search_list(){
    //prepara o request
    var request = gapi.client.youtube.search.list({
        part: "snippet",
        type: "video",
        q: encodeURIComponent(document.getElementById('search-input').value+" 360").replace(/%20/g, "+"),
        maxResults: 10,
        order: "relevance",
        videoEmbeddable: "true",
        videoLicense: "youtube"
    
    });
    //executa o request
    request.execute(function(response) {
        var results = response.result;
       resetSearch();
        console.log(results);
        $.each(results.items, function(index, item){
            $.get("/template/templatevideo.html", function(data){
                $('#results').append(tplawesome(data, [{"title":item.snippet.title, "videoId":item.id.videoId}]));
            });
            
        });
    });
}

/********************************************************************/
/*                                                                  */
/*                       SEARCH PARA AS SESSÕES                     */
/*                                                                  */
/********************************************************************/
function search_list_sessao(){
    //prepara o request
    var request = gapi.client.youtube.search.list({
        part: "snippet",
        type: "video",
        q: encodeURIComponent(document.getElementById('search-input').value+" 360").replace(/%20/g, "+"),
        maxResults: 10,
        order: "relevance",
        videoEmbeddable: "true",
        videoLicense: "youtube"
    
    });
    //executa o request
    request.execute(function(response) {
        var results = response.result;
        $("#results").html("");
        console.log(results);
        $.each(results.items, function(index, item){
            $.get("/template/templatevideosessao.html", function(data){
                var title = item.snippet.title;
                $('#results').append(tplawesome(data, [{"title": title, "titleEscaped":escape(title), "videoId":item.id.videoId}]));
            });
            
        });
        var closeButton = '<button type="button" class="close" aria-label="Close" onclick="resetSearch()">';
            closeButton    += '<span aria-hidden="true">&times;</span>';
            closeButton    +=  '</button>';
        $('#results').append(closeButton);
    });
}




/********************************************************************/
function init() {
    gapi.client.setApiKey("AIzaSyDLnzz-3C1gCqlUKLJznLLLWPA9FTAlwbc");
    gapi.client.load("youtube", "v3", function(){
        //nothing
    });
}

function resetSearch()
{
     $("#results").html("");
}

