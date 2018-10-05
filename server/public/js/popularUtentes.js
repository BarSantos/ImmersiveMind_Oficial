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

/*------- Para criar bolinhas ----*/

$(document).ready(function(){
    
    Bolinhas();
})

/*** Funcao criar bolinhas ***/
function Bolinhas(){
    var xhttp = new XMLHttpRequest();
    var email = window.sessionStorage.getItem("email_id");
    
    xhttp.open("GET", "http://"+IPADDR+":8080/api/doentes/", true);
	xhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhttp.setRequestHeader('cuidadorid', email);
    
    xhttp.onreadystatechange  = function () {
                                   

                                    if (this.readyState == 4 && this.status == 200) {
                                        var fillstring = '';
                                       
                                        var resultJSON = JSON.parse(this.responseText);
                                        
                                        if(resultJSON.message != 'Erro a devolver doentes'){
                                            var jsonResult = JSON.parse(resultJSON);
                                            var imagePath = "images/userimages/";
                                            var imageName;
                                            
                                            /* Popular com doentes */
                                            for(var i=0; i<jsonResult.length; i++){
                                                if (jsonResult[i].IMAGEM)
                                                    imageName = jsonResult[i].IMAGEM;
                                                else
                                                    imageName = "bolinhas_default.png";
                                                
                                                fillstring += '<div class="col-lg-4 col-sm-6 text-center mb-4">';
                                                fillstring+= '<a class="bolinhas_utentes" href="" data-toggle="modal" data-target="#modalContactForm" data-backdrop="static" data-keyboard="false" onclick="EditUtente(this.id)" id='+jsonResult[i].DOENTE_ID+'>';
                                                fillstring += '<img class="rounded-circle img-fluid d-block mx-auto bolitas" alt=""  style="background-image: url('+imagePath+imageName+')">';
                                                fillstring+= '<h3>'+jsonResult[i].PRIMEIRO_NOME+' '+jsonResult[i].ULTIMO_NOME+'</h3></a></div>';
                                            }
                                        }
                                    
                                   /* console.log('Aqui supostamente e o plus');
                                    /* Sinal plus */ 
                                        fillstring+='<div class="col-lg-4 col-sm-6 text-center mb-4">';
                                        fillstring+= '<a href="" data-toggle="modal" data-target="#modalContactForm" data-backdrop="static" data-keyboard="false" onclick="AddUtente()">';
                                        fillstring+= '<img class="rounded-circle img-fluid d-block mx-auto bolitas_plus" style="" alt="">';
                                        fillstring+= '</a>';
                                        fillstring+= '</div>';
                                        document.getElementById("rowbolinhas").innerHTML = fillstring;
                                        showPage();
                                    }
                                };
    xhttp.send();
}

/* Além de mudar para Editar Utente,
Popula também cada caixinha correspondente a cada doente
com os respectivos dados */

function EditUtente(clicked_id){
    window.sessionStorage.setItem("doenteID", clicked_id);
    
   
    document.getElementById('utente-titulo').innerHTML = 'Editar Utente';
    document.getElementById('addpatient').innerHTML = '<i class="fas fa-save"></i> Guardar';
    
    document.getElementById('addpatient').onclick = function()
                                                    {
                                                        UpdateDoente();
                                                    };   
    
    //// Mostrar botão do Apagar ////
    document.getElementById('botaoAdicionar').classList.remove('col-sm-6');
    document.getElementById('botaoCancelar').classList.remove('col-sm-6');
    
    document.getElementById('botaoAdicionar').classList.add('col-sm-4');
    document.getElementById('botaoCancelar').classList.add('col-sm-4');
    document.getElementById('botaoApagar').style.display= 'block';
    /////////////////////////////////
    
    // Aqui é necessário popular as caixas
    var xhttp = new XMLHttpRequest();
    var email = window.sessionStorage.getItem("email_id");
    var doente_id = clicked_id;
    
    $('#addpatient').prop("disabled", false);
    
    xhttp.open("GET", "http://"+IPADDR+":8080/api/doentes/", true);
	xhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhttp.setRequestHeader('cuidadorid', email);
    xhttp.setRequestHeader('doenteid', doente_id);
    
    xhttp.onreadystatechange  = function () {
                                     if (this.readyState == 4 && this.status == 200) {
                                         var resultJSON = JSON.parse(this.responseText);
                                        
                                        if(resultJSON.message != 'Erro a devolver doente'){
                                            var jsonResult = JSON.parse(resultJSON);
                                            document.getElementById("prmeiroNome").value = jsonResult[0].PRIMEIRO_NOME;
                                            document.getElementById("ultimoNome").value = jsonResult[0].ULTIMO_NOME;
                                            document.getElementById("idade").value = jsonResult[0].IDADE;
                                            document.getElementById("obs").value = jsonResult[0].OBSERVACAO;
                                            var imagePath = "images/userimages/";
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

/*Função que actualiza o doente no modal*/
function UpdateDoente(){
    var xhttp = new XMLHttpRequest();
    xhttp.open("PUT", "http://"+IPADDR+":8080/api/doentes/", true);
	xhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    
    var doenteID = window.sessionStorage.getItem("doenteID");
    
    var primeiroNome = document.getElementById("prmeiroNome").value;
    var ultimoNome = document.getElementById("ultimoNome").value;
    var idade = document.getElementById("idade").value;
    var observacao = document.getElementById("obs").value;
    var email = window.sessionStorage.getItem("email_id");
    
    var fd = "primeiroNome=" + primeiroNome + "&ultimoNome=" + ultimoNome + "&idade=" + idade + "&observacao=" + observacao + "&cuidadorID=" + email + "&imagem=" + imagem + "&imagename=" + imagemNome + "&doenteID=" + doenteID;
    
    xhttp.onreadystatechange  = function () {
                                if (this.readyState == 4 && this.status == 200) {
                                    Bolinhas();  
                                    }
                            };
    xhttp.send(fd);
    resetModalDoente();
}
    
/*Função que actualiza o doente no modal*/
function DeleteDoente(){
    var xhttp = new XMLHttpRequest();
    xhttp.open("DELETE", "http://"+IPADDR+":8080/api/doentes/", true);
	xhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    
    var doenteID = window.sessionStorage.getItem("doenteID");
    
    var email = window.sessionStorage.getItem("email_id");
    
    var fd = "&cuidadorID=" + email + "&doenteID=" + doenteID;
    
    xhttp.onreadystatechange  = function () {
                                if (this.readyState == 4 && this.status == 200) {
                                    Bolinhas();  
                                    }
                            };
    xhttp.send(fd);
    resetModalDoente();
}

/*Muda só o aspecto do modal*/
function AddUtente(){
    document.getElementById('utente-titulo').innerHTML = 'Novo Utente';
    document.getElementById('addpatient').innerHTML = '<i class="fas fa-plus-circle"></i> Adicionar';
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


function AddPatient(){
     
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", "http://"+IPADDR+":8080/api/doentes/", true);
	xhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    
    var primeiroNome = document.getElementById("prmeiroNome").value;
    var ultimoNome = document.getElementById("ultimoNome").value;
    var idade = document.getElementById("idade").value;
    var observacao = document.getElementById("obs").value;
    var email = window.sessionStorage.getItem("email_id");
    
    var fd = "primeiroNome=" + primeiroNome + "&ultimoNome=" + ultimoNome + "&idade=" + idade + "&observacao=" + observacao + "&cuidadorID=" + email + "&imagem=" + imagem + "&imagename=" + imagemNome;
    
    
    xhttp.onreadystatechange  = function () {
                                    if (this.readyState == 4 && this.status == 200) {
                                        Bolinhas();  
                                        }
                                };
    xhttp.send(fd);
    resetModalDoente();
}

/* Depois de sair da página do modal do doente
Apaga todas as entradas - não fica em "cache" */
function resetModalDoente(){
    document.getElementById("prmeiroNome").value = '';
    document.getElementById("ultimoNome").value = '';
    document.getElementById("idade").value = '';
    document.getElementById("obs").value = '';
    imagem = '';
    imagemNome = '';
    $('#img-upload').attr('style', "background-image: url('images/userimages/bolinhas_default.png')");
    $('#imagelabel').val('');
    document.getElementById("addpatient").setAttribute("disabled", "true");
    $('#modalContactForm').modal('toggle');
    
    //// Esconder (again) botão do Apagar ////
    document.getElementById('botaoAdicionar').classList.remove('col-sm-4');
    document.getElementById('botaoCancelar').classList.remove('col-sm-4');
    
    document.getElementById('botaoAdicionar').classList.add('col-sm-6');
    document.getElementById('botaoCancelar').classList.add('col-sm-6');
    document.getElementById('botaoApagar').style.display= 'none';
    /////////////////////////////////
    window.sessionStorage.removeItem("doenteID");
     document.getElementById('addpatient').onclick = function()
                                                    {
                                                       AddPatient();
                                                    }; 
    
}

/************* Disable do botao quando não esta preenchido *****************/

/*----- Para o Adicionar no botão plus: -----*/

$( document ).ready(function() {
    document.getElementById('formaddpatient').addEventListener("keyup", validateNewPatient);
});


function validateNewPatient(){
    if ($('#prmeiroNome').val().length   >=   2   &&
        $('#ultimoNome').val().length  >=   2   &&
        $.isNumeric($('#idade').val())) {
        $('#addpatient').prop("disabled", false);
    }
    else {
        $('#addpatient').prop("disabled", true);
    }
}
