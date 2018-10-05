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
var savedVideosArray = new Array();
/******************************************/


/*------- Para criar bolinhas ----*/

$(document).ready(function(){
    
    CheckDate();
    
    ChamarDoentes();
    ChamarCategorias();
    document.getElementById('obs-sessao').addEventListener("click", validateObsForm);
    Sessoes();
    showPage();
})

/*** Funcao criar bolinhas ***/
function Sessoes(){
    var xhttp = new XMLHttpRequest();
    var email = window.sessionStorage.getItem("email_id");
    
    xhttp.open("GET", "http://"+IPADDR+":8080/api/sessoes/", true);
	xhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhttp.setRequestHeader('cuidadorid', email);
    
    xhttp.onreadystatechange  = function () {
                                   

                                    if (this.readyState == 4 && this.status == 200) {
                                        var fillstring = '';
                                       
                                        var resultJSON = JSON.parse(this.responseText);
                                        
                                        if(resultJSON.message != 'Error a devolver Sessoes'){
                                            var jsonResult = JSON.parse(resultJSON);
                                            var imagePath = "images/sessionimages/";
                                            var imageName;
                                            
                                            /* Popular com doentes */
                                            for(var i=0; i<jsonResult.length; i++){
                                                if (jsonResult[i].IMAGEM)
                                                    imageName = jsonResult[i].IMAGEM;
                                                else
                                                    imageName = "bolinhas_default.png";
                                                
                                                fillstring += '<div class="col-lg-4 col-sm-6 text-center mb-4">';
                                                fillstring+= '<a class="rect_utentes" href="" data-toggle="modal" data-target="#modalContactForm" data-backdrop="static" data-keyboard="false" onclick="EditSession(this.id)" id='+jsonResult[i].SESSAO_ID+'>';
                                                fillstring += '<img class="img-fluid d-block mx-auto rect" alt=""  style="background-image: url('+imagePath+imageName+')">';
                                                if(jsonResult[i].SESSAO_NOME)
                                                    fillstring+= '<h3 id="h3'+jsonResult[i].SESSAO_ID+'">'+jsonResult[i].SESSAO_NOME;
                                                else{
                                                    a = i+1;
                                                    if(jsonResult[i].PRIMEIRO_NOME)
                                                        fillstring+= '<h3 id="h3'+jsonResult[i].SESSAO_ID+'">'+jsonResult[i].PRIMEIRO_NOME+' '+jsonResult[i].ULTIMO_NOME+' '+'#'+a;
                                                    else
                                                         fillstring+= '<h3 id="h3'+jsonResult[i].SESSAO_ID+'">Sessão '+'#'+a;
                                                }
                                                //Info de terminado depois de sessão expirada
                                                if(jsonResult[i].TERMINADO == 1)
                                                    fillstring+= ' (Terminada)';
                                                fillstring += '</h3></a></div>';
                                            }
                                        }
                                    
                                   /* console.log('Aqui supostamente e o plus');
                                    /* Sinal plus */ 
                                        fillstring+='<div class="col-lg-4 col-sm-6 text-center mb-4">';
                                        fillstring+= '<a href="" data-toggle="modal" data-target="#modalContactForm" data-backdrop="static" data-keyboard="false" onclick="AddSessionModal()">';
                                        fillstring+= '<img class="img-fluid d-block mx-auto rect_plus" style="" alt="">';
                                        fillstring+= '</a>';
                                        fillstring+= '</div>';
                                        document.getElementById("rowsessoes").innerHTML = fillstring;
 
                                    }
                                };
    xhttp.send();
}


function CheckDate(){
    var xhttp = new XMLHttpRequest();
    var email = window.sessionStorage.getItem("email_id");
    
    xhttp.open("GET", "http://"+IPADDR+":8080/api/sessoes/", true);
	xhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhttp.setRequestHeader('cuidadorid', email);
     xhttp.onreadystatechange  = function () {
                                   

                                    if (this.readyState == 4 && this.status == 200) {
                                        var fillstring = '';
                                        
                                       
                                        var resultJSON = JSON.parse(this.responseText);
                                        
                                        if(resultJSON.message != 'Error a devolver Sessoes'){
                                            var jsonResult = JSON.parse(resultJSON);
    
//var GivenDate = '2018-02-22';             
                                        
                                            var TomorrowDate = new Date();
                                            var TodayDate = new Date();
                                            TomorrowDate.setDate(TomorrowDate.getDate()+1);
                                            var fillstring='';
                                            var fillstringexp='';
                                           
                                            for(i=0; i<jsonResult.length; i++){
                                                
                                                if(jsonResult[i].TERMINADO == 0 && jsonResult[i].DIA){
                                                    var DBDate = jsonResult[i].DIA;
                                                    var DBDateTypeDate = new Date(DBDate.split('T').shift());
                                                    //24h antes
                                                    //DBDateTypeDate.setDate(DBDateTypeDate.getDate());
                                                    //DBDateTypeDate.setMonth(DBDateTypeDate.getMonth());

                                                    var x = i+1;

                                                    var sessaoNome = jsonResult[i].SESSAO_NOME;
                                                        if(!sessaoNome)
                                                            sessaoNome = jsonResult[i].PRIMEIRO_NOME+' '+jsonResult[i].ULTIMO_NOME+' #'+x;

                                                    // Quase a expirar
                                                    if(DBDateTypeDate.getTime() < TomorrowDate.getTime() && DBDateTypeDate.getTime() >= TodayDate.getTime()){
                                                       //window.alert('A data de '+jsonResult[i].PRIMEIRO_NOME+' ainda está dentro do tempo');

                                                        fillstring+='<p>'+sessaoNome+'</p>';
                                                        //window.alert('A data de '+jsonResult[i].PRIMEIRO_NOME+' foi ultrapassada');
                                                    }
                                                    //Expirado
                                                    if(DBDateTypeDate.getTime() < TodayDate.getTime()){
                                                        fillstringexp = '<p>'+sessaoNome+'</p>';
                                                        TerminarSessao(jsonResult[i].SESSAO_ID);
                                                    }
                                                }
                                            }
                                            if(fillstringexp)
                                                document.getElementById('infodatasexpiradas').innerHTML = fillstringexp;
                                            if(fillstring)
                                                document.getElementById('infodatas').innerHTML = fillstring;
                                            
                                            $('#ModalTime').modal('toggle');
                                            
                                            
                                        }
                                    }
     };
    xhttp.send();
}

function TerminarSessao(sessaoID){
    var xhttp = new XMLHttpRequest();
    var email = window.sessionStorage.getItem("email_id");
    
    xhttp.open("PUT", "http://"+IPADDR+":8080/api/sessoes/", true);
	xhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
   
    
     var fd = "cuidadorid=" + email + "&sessaoid=" + sessaoID+ "&terminado=1";

    xhttp.send(fd);
    
    
}

function ChamarDoentes(){
    var xhttp = new XMLHttpRequest();
    var email = window.sessionStorage.getItem("email_id");
    
    xhttp.open("GET", "http://"+IPADDR+":8080/api/doentes/", true);
	xhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhttp.setRequestHeader('cuidadorid', email);
    
    xhttp.onreadystatechange  = function () {
                                   

                                    if (this.readyState == 4 && this.status == 200) {
                                        var fillstring = '';
                                       
                                        var resultJSON = JSON.parse(this.responseText);
                                        
                                        fillstring+='<option selected>- Nenhum -</option>';
                                        
                                        if(resultJSON.message != 'Erro a devolver doentes'){
                                            var jsonResult = JSON.parse(resultJSON);
                                            
                                            
                                            /* Popular com doentes nas opções do modal das sessões */
                                            for(var i=0; i<jsonResult.length; i++){
                                                fillstring+='<option value='+jsonResult[i].DOENTE_ID+'>';
                                                fillstring+=jsonResult[i].PRIMEIRO_NOME+' '+jsonResult[i].ULTIMO_NOME;
                                                fillstring+='</option>';
                                            }
                                        }
                                        
                                        document.getElementById("utenteid").innerHTML = fillstring;
 
                                    }
                                };
    xhttp.send();
}

function ChamarCategorias(){
    var xhttp = new XMLHttpRequest();
    var email = window.sessionStorage.getItem("email_id");
    
    xhttp.open("GET", "http://"+IPADDR+":8080/api/categorias/", true);
	xhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    
    xhttp.onreadystatechange  = function () {
                                   

                                    if (this.readyState == 4 && this.status == 200) {
                                        var fillstring = '<label for="inpututente">Temas dos vídeos</label>';
                                       
                                        var resultJSON = JSON.parse(this.responseText);
                                        
                                        
                                        if(resultJSON.message != 'Error a devolver Categorias'){
                                            var jsonResult = JSON.parse(resultJSON);
                                            
                                            
                                            /* Popular com doentes nas opções do modal das sessões */
                                            for(var i=0; i<jsonResult.length; i++){
                                                
                                                
                                                if(i % 2 == 0)
                                                    fillstring+='<div class="row">';
                                                
                                                
                                                    fillstring+='<div class="col-lg-6">';
                                                    fillstring+='<label class="checkbox-inline">';
                                                    fillstring+='<input type="checkbox" class="messageCheckbox" value="'+jsonResult[i].CATEGORIA+'"> '+jsonResult[i].CATEGORIA;
                                                    fillstring+='</label>';
                                                    fillstring+='</div>';
                                                
                                                if(i % 2 != 0 || i == jsonResult.length-1)
                                                    fillstring+='</div>'; //Fecha a row
                                            }
                                        }
                                        
                                        document.getElementById("popularcategorias").innerHTML = fillstring;
 
                                    }
                                };
    xhttp.send();
}


/* Além de mudar para Editar Sessão,
Popula também cada caixinha correspondente a cada doente
com os respectivos dados */

function EditSession(clicked_id){
    window.sessionStorage.setItem("sessaoID", clicked_id);
    
    var sessaoNome = document.getElementById('h3'+clicked_id).innerHTML;
    window.sessionStorage.setItem("sessaoNome", sessaoNome);
    
   
    //document.getElementById('utente-titulo').innerHTML = 'Editar Sessão';
    document.getElementById('addsession').innerHTML = '<i class="fas fa-save"></i> Guardar';
    
    document.getElementById('addsession').onclick = function()
                                                    {
                                                        UpdateSession();
                                                    };   
    
    //// Mostrar botão do Apagar ////
    document.getElementById('botaoAdicionar').classList.remove('col-sm-6');
    document.getElementById('botaoCancelar').classList.remove('col-sm-6');
    
    /*redefine o tamanho do botão*/
    document.getElementById('addsession').classList.add('btn-size');
    document.getElementById('cancelsession').classList.add('btn-size-terminar-cancelar');
    
    document.getElementById('botaoAdicionar').classList.add('col-sm-3');
    document.getElementById('botaoCancelar').classList.add('col-sm-3');
    document.getElementById('botaoApagar').style.display= 'block';
    document.getElementById('botaoIniciar').style.display= 'block';
    
    
    /////////////////////////////////
    
    // Aqui é necessário popular as caixas
    var xhttp = new XMLHttpRequest();
   
    var sessaoID = clicked_id;
    
    $('#addsession').prop("disabled", false);
    
    xhttp.open("GET", "http://"+IPADDR+":8080/api/sessoes/", true);
	xhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhttp.setRequestHeader('sessaoid', sessaoID);
    
    xhttp.onreadystatechange  = function () {
                                     if (this.readyState == 4 && this.status == 200) {
                                         var resultJSON = JSON.parse(this.responseText);
                                        
                                        if(resultJSON.message != 'Error a devolver Sessao'){
                                            var jsonResult = JSON.parse(resultJSON);
                                            if(jsonResult[0].TERMINADO == 1){
                                                $('#sessaoNome').prop("disabled", true);
                                                $('#diaid').prop("disabled", true);
                                                $('#utenteid').prop("disabled", true);
                                                $('#imgInp').prop("disabled", true);
                                                var disableCategorias = document.getElementsByClassName('messageCheckbox');
                                                for(var k=0; disableCategorias[k]; k++){
                                                    disableCategorias[k].disabled = true;
                                                }
                                                
                                                 document.getElementById('botaoMesmoIniciar').disabled = true;
                                                document.getElementById('tabBalancoFinal').classList.remove('disabled');
                                                
                                            }
                                            console.log('Terminado: '+jsonResult[0].TERMINADO);
                                            document.getElementById("sessaoNome").value = jsonResult[0].SESSAO_NOME;
                                            
                                            var dia =  jsonResult[0].DIA.split('T').shift();
                                            
                                            if(dia){
                                                var d = new Date(dia);
                                                //dia.split('T').shift()
                                                
                                                if(d.getDate() < 29 && d.getMonth() < 9 && d.getFullYear() < 2018)
                                                    d.setDate(d.getDate()+1);
                                                var diadata = d.getDate();
                                                var mes = d.getMonth()+1;
                                                
                                                console.log('d com set e get: '+d);
                                                
                                                if(diadata < 10 && mes < 10){
                                                    document.getElementById('diaid').value = d.getFullYear()+'-0'+mes+'-0'+diadata;
                                                }
                                                else{
                                                    if(mes < 10)
                                                        document.getElementById('diaid').value = d.getFullYear()+'-0'+mes+'-'+diadata;
                                                    else{
                                                        if(diadata < 10)
                                                            document.getElementById('diaid').value = d.getFullYear()+'-'+mes+'-0'+diadata;
                                                        else{
                                                            document.getElementById('diaid').value = d.getFullYear()+'-'+mes+'-'+diadata;
                                                        }
                                                    }
                                                }
                                
                                                
                                                console.log(d.getFullYear()+'-'+mes+'-'+diadata);
                                            }
                                            
                                            //dia.setHours(d.getHours() - 10)
                                            
                                            
                                            getCategoriasDaSessao(sessaoID);
                                            getVideosDaSessao(sessaoID);
                                            
                                            var idUtente = jsonResult[0].SESSOES_DOENTE_ID; //'- Nenhum -'

                                            if(idUtente){ //Se tiver algum nome associado (tipo travesseiro)
                                                document.getElementById("utenteid").value = idUtente;
                                            }
                                                //nomeUtente = jsonResult[0].NOME;
                                            else
                                                document.getElementById("utenteid").value = '- Nenhum -';
                                            
                                           
                                            
                                            
                                            var imagePath = "images/sessionimages/";
                                            var imageName;
                                            
                                            /*Se a pessoa não tiver escolhido imagem*/
                                            if (jsonResult[0].IMAGEM)
                                                    imageName = jsonResult[0].IMAGEM;
                                                else
                                                    imageName = "bolinhas_default.png";
                                            
                                            $('#img-upload').attr('style', "background-image: url('"+imagePath+imageName+"')");
                                            $('#imagelabel').val(jsonResult[0].IMAGEM);
                                            
                                            imagemNome = jsonResult[0].IMAGEM;
                                        }
                                     }
    };
   xhttp.send();
}

function getCategoriasDaSessao(sessao_id){
    var xhttp = new XMLHttpRequest();
    
    xhttp.open("GET", "http://"+IPADDR+":8080/api/categorias/", true);
	xhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhttp.setRequestHeader('sessaoid', sessao_id);
    xhttp.onreadystatechange  = function () {
                    
                                    if (this.readyState == 4 && this.status == 200) {
                                       
                                        var resultJSON = JSON.parse(this.responseText);
                                        
                                        
                                        if(resultJSON.message != 'Error a devolver Categorias'){
                                            var jsonResult = JSON.parse(resultJSON);
                                            
                                            var inputElements = document.getElementsByClassName('messageCheckbox');
    
                                            /* Popular com doentes nas opções do modal das sessões */
                                            for(var i=0; i<jsonResult.length; i++){
                                                for(var j=0; inputElements[j]; ++j){
                                                    if(inputElements[j].value == jsonResult[i].CATEGORIA){
                                                        inputElements[j].checked = true;
                                                        break;
                                                    }
                                                }
                                                
                                            }
                                        }
                                    
 
                                    }
                                };
    xhttp.send();
}


function getVideosDaSessao(sessao_id)
{
     var xhttp = new XMLHttpRequest();
    
    xhttp.open("GET", "http://"+IPADDR+":8080/api/videos/", true);
	xhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhttp.setRequestHeader('sessaoid', sessao_id);
    
    xhttp.onreadystatechange  = function () {
                    
                                    if (this.readyState == 4 && this.status == 200) {
                                       
                                        var resultJSON = JSON.parse(this.responseText);
                                        
                                        
                                        if(resultJSON.message != 'Error a devolver Videos'){
                                            var jsonResult = JSON.parse(resultJSON);
                                            
                                            console.log(jsonResult);
                                            for(var j=0; jsonResult[j]; ++j){
                                                 saveVideo( jsonResult[j].URL_FILE, jsonResult[j].VIDEO_TITLE);   
                                            }
                                            displaySavedVideos();  
                                        }
                                    }
    };
    
    xhttp.send();
}

function deleteVideosDaSessao(videoId)
{
    var xhttp = new XMLHttpRequest();
    xhttp.open("DELETE", "http://"+IPADDR+":8080/api/videos/", true);
	xhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    
    var sessionID = window.sessionStorage.getItem("sessaoID");
    var cuidadorID = window.sessionStorage.getItem("email_id");
    
    var fd = "videoid=" + videoId + "&sessaoid=" + sessionID +"&cuidadorid=" + cuidadorID;
    
     xhttp.send(fd);
     
}

/*Função que actualiza o doente no modal*/
function UpdateSession(){
    var xhttp = new XMLHttpRequest();
    xhttp.open("PUT", "http://"+IPADDR+":8080/api/sessoes/", true);
	xhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    
    var cuidadorID = window.sessionStorage.getItem("email_id");
    var sessaoID = window.sessionStorage.getItem("sessaoID");
    var sessaoNome = document.getElementById("sessaoNome").value;
    var doenteID = document.getElementById("utenteid").value;
    var dia = document.getElementById("diaid").value;
    
    var JSONvideos = JSON.stringify(savedVideosArray);
    
    /* Apanha os valores das Categorias */
    var checkedValue = '';
    var uncheckedValue = ''; 
    var inputElements = document.getElementsByClassName('messageCheckbox');
    for(var i=0; inputElements[i]; ++i){
      if(inputElements[i].checked){
           checkedValue+= inputElements[i].value + '-';
      }
      if(!inputElements[i].checked){
           uncheckedValue+= inputElements[i].value + '-';
      }
    }
    
    /* O que está entre aspas são os nomes do server: var sessaoID = req.body.-----> sessaoID <---- este;*/
    var fd = "nomesessao=" + sessaoNome + "&doenteid=" + doenteID + "&cuidadorid=" + cuidadorID + "&dia=" + dia +"&categorias=" + checkedValue + "&notcategorias=" + uncheckedValue + "&imagem=" + imagem + "&imagename=" + imagemNome + "&sessaoid=" + sessaoID + "&videos=" + JSONvideos;
    
    
    xhttp.onreadystatechange  = function () {
                                    if (this.readyState == 4 && this.status == 200) {
                                        Sessoes();  
                                        }
                                };
    xhttp.send(fd);
    resetModalSessao();
}
    
/*Função que actualiza o doente no modal*/
function DeleteSessao(){
    var xhttp = new XMLHttpRequest();
    xhttp.open("DELETE", "http://"+IPADDR+":8080/api/sessoes/", true);
	xhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    
    var sessionID = window.sessionStorage.getItem("sessaoID");
    
    var email = window.sessionStorage.getItem("email_id");
    
    var fd =  "cuidadorID=" + email + "&sessaoID=" + sessionID;
    
    xhttp.onreadystatechange  = function () {
                                if (this.readyState == 4 && this.status == 200) {
                                    var resultJSON = JSON.parse(this.responseText);
                                            Sessoes();
                                    }
                            };
    xhttp.send(fd);
    resetModalSessao();
}

/*Muda só o aspecto do modal*/
function AddSessionModal(){
    //document.getElementById('utente-titulo').innerHTML = 'Novo Utente';
    document.getElementById('addsession').innerHTML = '<i class="fas fa-plus-circle"></i> Adicionar';
}

/*********Para a opção Procurar********/

$(document).ready( function() {
    	$(document).on('change', '.btn-file :file', function() {
		var input = $(this),
			label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
		input.trigger('fileselect', [label]);
		});

		$('.btn-file :file').on('fileselect', function(event, label) {
		    
		    var input = $(this).parents('.input-group').find(':text'),
		        log = label;
            
		    imagemNome = label;
            
		    if( input.length ) {
		        input.val(log);
		    } else {
		        if( log ) alert(log);
		    }
		});
		function readURL(input) {
		    if (input.files && input.files[0]) {
		        var reader = new FileReader();
		        
		        reader.onload = function (e) {
		            $('#img-upload').attr('style', "background-image: url(" + e.target.result + ")");    
                    imagem = e.target.result;
                }
		        
		        reader.readAsDataURL(input.files[0]);
                
               
		    }
		}

		$("#imgInp").change(function(){
		    readURL(this);
		}); 	
	});


function AddSession(){
     
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", "http://"+IPADDR+":8080/api/sessoes/", true);
	xhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    
    var cuidadorID = window.sessionStorage.getItem("email_id");
    var sessaoNome = document.getElementById("sessaoNome").value;
    var doenteID = document.getElementById("utenteid").value;
    var dia = document.getElementById("diaid").value;
    var JSONvideos = JSON.stringify(savedVideosArray);
    
    /* Apanha os valores das Categorias */
    var checkedValue = ''; 
    var inputElements = document.getElementsByClassName('messageCheckbox');
    for(var i=0; inputElements[i]; ++i){
      if(inputElements[i].checked){
           checkedValue+= inputElements[i].value + '-';
      }
    }
    
    /* O que está entre aspas são os nomes do server: var sessaoID = req.body.-----> sessaoID <---- este;*/
    var fd = "nomesessao=" + sessaoNome + "&doenteid=" + doenteID + "&cuidadorid=" + cuidadorID + "&dia=" + dia +"&categorias=" + checkedValue + "&imagem=" + imagem + "&imagename=" + imagemNome + "&videos=" + JSONvideos;
    
    
    xhttp.onreadystatechange  = function () {
                                    if (this.readyState == 4 && this.status == 200) {
                                        Sessoes();
                                    }
                                };
    xhttp.send(fd);
    resetModalSessao();
}

/* Depois de sair da página do modal do doente
Apaga todas as entradas - não fica em "cache" */
function resetModalSessao(){
    document.getElementById("sessaoNome").value = '';
    document.getElementById("diaid").value = '';
    document.getElementById("utenteid").value = '- Nenhum -';
    /* Reset das categorias */
    var inputElements = document.getElementsByClassName('messageCheckbox');
    for(var i=0; inputElements[i]; ++i){
      inputElements[i].checked = false;
      }
    
    document.getElementById("search-input").value = '';
    imagem = '';
    imagemNome = '';
    $('#img-upload').attr('style', "background-image: url('images/userimages/bolinhas_default.png')");
    $('#imagelabel').val('');
    $('#modalContactForm').modal('toggle');
    
    //// Esconder (again) botão do Apagar ////
    document.getElementById('botaoAdicionar').classList.remove('col-sm-3');
    document.getElementById('botaoCancelar').classList.remove('col-sm-3');
    
    /*redefine o tamanho do botão*/
    document.getElementById('addsession').classList.remove('btn-size');
    document.getElementById('cancelsession').classList.remove('btn-size-terminar-cancelar');
    
    document.getElementById('botaoAdicionar').classList.add('col-sm-6');
    document.getElementById('botaoCancelar').classList.add('col-sm-6');
    document.getElementById('botaoApagar').style.display= 'none';
    document.getElementById('botaoIniciar').style.display = 'none';
    /////////////////////////////////
    window.sessionStorage.removeItem("sessaoID");
     document.getElementById('addsession').onclick = function()
                                                    {
                                                       AddSession();
                                                    }; 
    
    $('#sessaoNome').prop("disabled", false);
    $('#diaid').prop("disabled", false);
    $('#utenteid').prop("disabled", false);
    $('#imgInp').prop("disabled", false);
    var disableCategorias = document.getElementsByClassName('messageCheckbox');
    for(var k=0; disableCategorias[k]; k++){
        disableCategorias[k].disabled = false;
    }
    document.getElementById('botaoMesmoIniciar').disabled = false;
    
    window.sessionStorage.removeItem("sessaoID");
    window.sessionStorage.removeItem("sessaoNome");
    savedVideosArray = new Array();
    document.getElementById("results").innerHTML = '';
     document.getElementById('tabBalancoFinal').classList.add('disabled');
    
    document.getElementById("tabDados").classList.add("active");
    
    document.getElementById("dados-sessao").classList.add("active");
    document.getElementById("dados-sessao").classList.add("show");
    
    document.getElementById("tabObs").classList.remove("active");
    document.getElementById("obs-sessao").classList.remove("active");
    document.getElementById("obs-sessao").classList.remove("show");
}

/************* Disable do botao quando não esta preenchido *****************/
/*          COMO NADA É OBRIGATÓRIO ENTÃO NÃO É NECESSÁRIO                 */
/*                                                                         */
/***************************************************************************/

/*----- Para o Adicionar no botão plus: -----*/
/*
$( document ).ready(function() {
    document.getElementById('formaddsession').addEventListener("keyup", validateNewSession);
});


function validateNewPatient(){
    if ($('#prmeiroNome').val().length   >=   2   &&
        $('#ultimoNome').val().length  >=   2   &&
        $.isNumeric($('#idade').val()) &&
        $('#obs').val().length > 0) {
        $('#addpatient').prop("disabled", false);
    }
    else {
        $('#addpatient').prop("disabled", true);
    }
}
*/

/***************************************************************************/
/*          PREENCHIMENTO DOS VÍDEOS ESCOLHIDOS NA SESSAO                  */
/*                                                                         */
/***************************************************************************/


function saveVideoIfChecked(checkbox, videoid, titulo){
    
   
    if(checkbox.checked)
        saveVideo(videoid, titulo);
    else
       deleteFromArray(titulo, videoid);
    
    displaySavedVideos();
    
}


function saveVideo( videoid, titulo)
{
    var video = new Object();
    video.videoid = videoid;
    video.title = titulo;
    
    savedVideosArray.push(video);
}

function checkVideos()
{
  $('.vidInput').each(function(i, obj) {
        savedVideosArray.forEach(function(element) {
            if(element.videoid == obj.getAttribute('id'))
                obj.innerHTML = '::after';     
        });
    });
}
   
function displaySavedVideos()
{
     
    $("#videosSelecionados").html("");
    if(savedVideosArray.length == 0)
    {
        $('#meusVideos').hide();
    }
    else
    {
        $.each(savedVideosArray, function(index, item){
            $.get("/template/templatemeusvideos.html", function(data){
                var title = unescape(item.title);
                $('#videosSelecionados').append(tplawesome(data, [{"title":title, "videoId":item.videoid}]));
            });
            
        });
        $('#meusVideos').show();
    }
}

function deleteFromArray(titulo, videoid)
{
    var video = new Object();
    video.videoid = videoid;
    video.title = titulo;
    
    deleteVideosDaSessao(videoid);
    
    savedVideosArray.splice(savedVideosArray.indexOf(video), 1);
    
    displaySavedVideos();
}


function validateObsForm()
{
    var olhos = checkCheckbox('Olhos');
    
    if(olhos)
        $("#olhs").html('');
    else
         $("#olhs").html('Obrigatório!');
    
}


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
