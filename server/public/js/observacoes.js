/*****************************************************************************/
/*                          I M P O R T A N T E                              */
/*****************************************************************************/
var IPADDR = '192.168.1.74';
/*****************************************************************************/
/*                          I M P O R T A N T E                              */
/*****************************************************************************/


/*************VARIÁVEIS GLOBAIS ***********/
var imagem = '';
var imagemNome = '';
/******************************************/

var dateInit;
var diffMillis = 0;

/*------- Para criar bolinhas ----*/

$(document).ready(function(){
        dateInit = new Date();
})

/*** Funcao criar observacoes ***/
function Observacoes(){
    var xhttp = new XMLHttpRequest();
    var sessaoID = window.sessionStorage.getItem("sessaoID");
    
    xhttp.open("GET", "http://"+IPADDR+":8080/api/observacao/", true);
	xhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhttp.setRequestHeader('sessaoid', sessaoID);
    
    xhttp.onreadystatechange  = function () {
                                   

                                    if (this.readyState == 4 && this.status == 200) {
                                        var fillstring = '';
                                       
                                        var resultJSON = JSON.parse(this.responseText);
                                        
                                        if(resultJSON.message != 'Error a devolver Observações'){
                                            var jsonResult = JSON.parse(resultJSON);
                                            
                                            markRadio(jsonResult[0].RECONHECIMENTO, 'reconhecimentoradio');
                                            markRadio(jsonResult[0].HUMOR, 'humorradio');
                                            markRadio(jsonResult[0].INTERESSE, 'interesseradio');
                                            markRadio(jsonResult[0].INTERACCAO, 'interaccaoradio');
                                            markRadio(jsonResult[0].NAUSEAS, 'nauseasradio');
                                            markRadio(jsonResult[0].DESEQUILIBRIOS, 'desequilibriosradio');
                                            markCheckbox(jsonResult[0].PERTURBACOES_VISUAIS, 'Olhos');
                                            document.getElementById('ObservacoesRelevantes').value = jsonResult[0].OBSERVACOES;
                                            
                                            parseTime(jsonResult[0].TEMPO);
                                        }
                                    }
                                };
     xhttp.send();
    
    document.getElementById('addsession').onclick = function()
                                                    {
                                                        UpdateObsearvacao();
                                                    };   
    
}
   

function UpdateObsearvacao(){
     var xhttp = new XMLHttpRequest();
    var sessaoID = window.sessionStorage.getItem("sessaoID");
    
    xhttp.open("PUT", "http://"+IPADDR+":8080/api/observacao/", true);
	xhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    
    var reconhecimento = checkRadios('reconhecimentoradio');
    var humor = checkRadios('humorradio');
    var interesse = checkRadios('interesseradio');
    var interaccao = checkRadios('interaccaoradio');
    var nauseas = checkRadios('nauseasradio');
    var desequilibrios = checkRadios('desequilibriosradio');
    var olhos = checkCheckbox('Olhos');
    var observacoes = document.getElementById('ObservacoesRelevantes').value;
    var cuidadorID = window.sessionStorage.getItem("email_id");

    
    var fd = "sessaoID="+sessaoID+"&reconhecimento="+reconhecimento+"&humor="+humor+"&interesse="+interesse+"&interaccao="+interaccao+"&nauseas="+nauseas+"&desequilibrios="+desequilibrios+"&perturbacoes_visuais="+olhos+"&observacoes="+observacoes+"&cuidadorID="+cuidadorID;
   
    xhttp.send(fd);
    resetModalSessao();
}

function endSession()
{
    var sessaoID = window.sessionStorage.getItem("sessaoID");
   
    if(sessaoID)
    {
        saveObservacoes(sessaoID);
        terminateSession(sessaoID);
    }
    else
    {
        AddEmptySession();
       
    }
    
    cleanSession();
}

function AddEmptySession(){
     
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", "http://"+IPADDR+":8080/api/sessoes/", true);
	xhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    
    var cuidadorID = window.sessionStorage.getItem("email_id");
    var sessaoNome = "";
    var doenteID = '- Nenhum -';
    var today = new Date();
    var dia = today.toISOString().slice(0,10);
    var videos = new Array();
    var JSONvideos = JSON.stringify(videos);
    var checkedValue = "";
    var imagem = "";
    var imagemNome = "";
    
    
    xhttp.onreadystatechange  = function () {
                                   
                                    if (this.readyState == 4 && this.status == 200) {
                                       
                                        var resultJSON = JSON.parse(this.responseText);
                                        resultJSON = JSON.parse(resultJSON);
                                        sessionID = resultJSON.insertId;
                                        
                                        terminateSession(resultJSON.insertId);
                                        saveObservacoes(resultJSON.insertId);
                                    }
    };  
    
    /* O que está entre aspas são os nomes do server: var sessaoID = req.body.-----> sessaoID <---- este;*/
    var fd = "nomesessao=" + sessaoNome + "&doenteid=" + doenteID + "&cuidadorid=" + cuidadorID + "&dia=" + dia +"&categorias=" + checkedValue + "&imagem=" + imagem + "&imagename=" + imagemNome + "&videos=" + JSONvideos;
    
    xhttp.send(fd);
}

function terminateSession(sessaoID)
{
    var xhttp = new XMLHttpRequest();
    xhttp.open("PUT", "http://"+IPADDR+":8080/api/sessoes/", true);
    xhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    
    var cuidadorID = window.sessionStorage.getItem("email_id");
    var terminado = true;

    var params = "sessaoid="+sessaoID+"&cuidadorid="+cuidadorID +"&terminado="+terminado;
    
    xhttp.onreadystatechange  = function () {
                                            if (this.readyState == 4 && this.status == 200) {
                                                console.log("ALL DONE");
                                            }
    };
    xhttp.send(params);
}


function saveObservacoes(sessaoID)
{
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", "http://"+IPADDR+":8080/api/observacao/", true);
    xhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    
    var tempo = diffMillis;
    var reconhecimento = checkRadios('reconhecimentoradio');
    var humor = checkRadios('humorradio');
    var interesse = checkRadios('interesseradio');
    var interaccao = checkRadios('interaccaoradio');
    var nauseas = checkRadios('nauseasradio');
    var desequilibrios = checkRadios('desequilibriosradio');
    var olhos = checkCheckbox('Olhos');
    var observacoes = document.getElementById('ObservacoesRelevantes').value;
    var cuidadorID = window.sessionStorage.getItem("email_id");
    
     var fd = "sessaoID="+sessaoID+"&reconhecimento="+reconhecimento+"&humor="+humor+"&interesse="+interesse+"&interaccao="+interaccao+"&nauseas="+nauseas+"&desequilibrios="+desequilibrios+"&perturbacoes_visuais="+olhos+"&observacoes="+observacoes+"&cuidadorid="+cuidadorID +"&tempo=" + tempo;
   
    xhttp.onreadystatechange  = function () {
                                            if (this.readyState == 4 && this.status == 200) {
                                                sairActividade();
                                            }
    };
    
    xhttp.send(fd);
    
    
}
 /*************** RADIOS *****************/   
function checkRadios(radioName){
    
    var result;
    var radios = document.getElementsByName(radioName);
    
    for(var i=0; radios[i]; i++){
         if (radios[i].checked) {
             result = radios[i].value;
            break;
        }
    }
    
    return result;
}


function markRadio(buttonChecked, radioNome)
{
    var radios = document.getElementsByName(radioNome);
    
    for(var i=0; radios[i]; i++){
        if(radios[i].value == buttonChecked){
            radios[i].checked = true;
            break;
        }
    }
}

/************* CHECKBOXES *****************/
function checkCheckbox(checkboxName){
    
    var result = '';
    var check = document.getElementsByName(checkboxName);
    
    for(var i=0; check[i]; i++){
         if (check[i].checked) {
             result += check[i].value+';';
        }
    }
    
    return result;
}

function markCheckbox(buttonChecked, checkboxNome)
{
    var check = document.getElementsByName(checkboxNome);
    var splitbuttonChecked = buttonChecked.split(';');
    console.log(check);
    for(var i=0; check[i]; i++){
        for(var j=0; check[j]; j++){
            if(check[i].value == splitbuttonChecked[j]){
                check[i].checked = true;
                break;
            }
        }
    }
}


/*********************************************/
function finalDate()
{
    var endDate = new Date();
    diffMillis = endDate - dateInit;
    parseTime(diffMillis);
}

function parseTime(millis)
{
    var minutes = Math.floor(millis / 60000);
    var seconds = ((millis % 60000) / 1000).toFixed(0);
    
    document.getElementById("difftime").innerHTML = "00:"+(minutes < 10 ? "0" : "") + minutes+":"+(seconds < 10 ? "0" : "") + seconds ;
}


/*----- Para o LOGIN: -----*/

$( document ).ready(function() {
    document.getElementById('observacoesForm').addEventListener("click", validateObsForm);
});


function validateObsForm(){
    
    var reconhecimento = checkRadios('reconhecimentoradio');
    var humor = checkRadios('humorradio');
    var interesse = checkRadios('interesseradio');
    var interaccao = checkRadios('interaccaoradio');
    var nauseas = checkRadios('nauseasradio');
    var desequilibrios = checkRadios('desequilibriosradio');
    var olhos = checkCheckbox('Olhos');
    var observacoes = document.getElementById('ObservacoesRelevantes').value;
    
    if(reconhecimento)
        $("#recon").html(" ");
    if(humor)
        $("#hum").html('');
    if(interesse)
        $("#interesse").html('');
     if(interaccao)
        $("#interaccao").html('');
    if(nauseas)
        $("#naus").html('');
    if(desequilibrios)
        $("#deseq").html('');
    if(olhos)
        $("#olhs").html('');
    else
         $("#olhs").html('Obrigatório!');
    
    if (reconhecimento && humor && interesse && interaccao && nauseas && desequilibrios && olhos)
    {
        $('#saveandleave').prop("disabled", false);
    }
    else {
        $('#saveandleave').prop("disabled", true);
    }
}
