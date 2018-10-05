/*****************************************************************************/
/*                          I M P O R T A N T E                              */
/*****************************************************************************/
var IPADDR = '192.168.1.74';
/*****************************************************************************/
/*                          I M P O R T A N T E                              */
/*****************************************************************************/

/** Activa a página depois de loaded **/
function showPage() {
  document.getElementById("loader").style.display = "none";
  document.getElementById("allPageActivity").style.display = "block";
}

/* Funcao para registar um novo cuidador para o servidor*/
function RegistaCuidador() {
    var email = document.getElementById('emailregistar').value;
    var passe = document.getElementById('passwordregistar').value;
    var primeiroNome = document.getElementById('primeironomecuidador').value;
    var ultimoNome = document.getElementById('ultimonomecuidador').value;
    var profissao = document.getElementById('profissao').value;
    
    var fd = "cuidadorID=" + email + "&password=" + passe +"&primeiroNome=" + primeiroNome + "&ultimoNome=" + ultimoNome +"&profissao=" + profissao;
   /* fd.append("cuidadorID", email);
    fd.append("password", passe);
    fd.append("primeiroNome", primeiroNome);
    fd.append("ultimoNome", ultimoNome);
    fd.append("profissao", profissao);
    */
    var xhttp = new XMLHttpRequest();
	    xhttp.open("POST", "http://"+IPADDR+":8080/api/cuidadores/", true);
	xhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhttp.onreadystatechange  = function () {
                                    if (this.readyState == 4 && this.status == 200) {
                                        if(JSON.parse(xhttp.responseText).message == 'Cuidador Criado')
                                        {
                                            // Cuidador criado com sucesso (Registado)
                                            document.getElementById('msnregisto').innerHTML= 'Obrigado por se juntar à nossa plataforma!';
                                            document.getElementById('img-registo').src = "images/SmileFaceSuccess.png";
                                            document.getElementById('btnpopupregisto').innerHTML = 'Entrar na plataforma';
                                            document.getElementById('btnpopupregisto').classList.remove('button-popup-fail');
                                            document.getElementById('btnpopupregisto').classList.add('button-popup-success');
                                            document.getElementById('btnpopupregisto').onclick = function(){
                                                Login(document.getElementById('emailregistar').value, document.getElementById('passwordregistar').value);
                                            };
                                        }
                                    }
                                };
    xhttp.send(fd);


 
}

function LoginCuidador() {
    var email = document.getElementById('emaillogin').value;
    var passe = document.getElementById('passwordlogin').value;
    Login(email, passe);
}

function Login(email, passe){
     
    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", "http://"+IPADDR+":8080/api/cuidadores/", true);
	xhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhttp.setRequestHeader('cuidadorid', email);
    xhttp.setRequestHeader('password', passe);
    
    xhttp.onreadystatechange  = function () {
                                    if (this.readyState == 4 && this.status == 200) {   
                                        var resultJSON = JSON.parse(this.responseText);
                                        if(resultJSON.message == 'Error in LogIn')
                                        {
                                            // O cuidador provavelmente nao existe na BD
                                            $("#myModal").modal();
                                            
                                        }
                                        else{
                                            
                                            var jsonResult = JSON.parse(resultJSON);
                        
                                            window.sessionStorage.setItem("email_id", jsonResult[0].EMAIL_ID); 
                                            window.sessionStorage.setItem("primeiro_nome", jsonResult[0].PRIMEIRO_NOME);
                                            window.sessionStorage.setItem("ultimo_nome", jsonResult[0].ULTIMO_NOME);
                                            location.href = "frontpage";
                                        }
                                    }
                                };
    
    
    xhttp.send();
}

/*** LOGOUT popup ***/
function Logout(){
    var xhttp = new XMLHttpRequest();
    var email = window.sessionStorage.getItem("email_id");
    xhttp.open("GET", "http://"+IPADDR+":8080/api/cuidadores/", true);
	xhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhttp.setRequestHeader('cuidadorid', email);
    
    xhttp.onreadystatechange  = function () {
                                    if (this.readyState == 4 && this.status == 200) {   
                        
                                            window.sessionStorage.removeItem("email_id");
                                            window.sessionStorage.removeItem("primeiro_nome");
                                            window.sessionStorage.removeItem("ultimo_nome");
                                            window.sessionStorage.removeItem("sessaoID");
                                            window.sessionStorage.removeItem("doenteID");
                                           window.sessionStorage.removeItem("sessaoNome");
                                        /* Volta para a página principal */
                                            location.href = "/";
                                        
                                    }
                                };
    xhttp.send();
}

/************* Disable do botao quando não esta preenchido *****************/

/*----- Para o REGISTAR: -----*/

$( document ).ready(function() {
    document.getElementById('registernav').addEventListener("keyup", validateRegistar);
});


function validateRegistar(){
    var emailregex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    var passregex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    
    if (emailregex.test($('#emailregistar').val())  &&
        $('#primeironomecuidador').val().length  >   1   &&
        $('#ultimonomecuidador').val().length    >   1 &&
        passregex.test($('#passwordregistar').val())) {
        $('#buttonregistar').prop("disabled", false);
    }
    else {
        $('#buttonregistar').prop("disabled", true);
    }
}

/*----- Para o LOGIN: -----*/

$( document ).ready(function() {
    document.getElementById('loginnav').addEventListener("keyup", validateLogin);
});


function validateLogin(){
    var emailregex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    
    if (emailregex.test($('#emaillogin').val())   &&
        $('#passwordlogin').val().length  >   0) {
        $('#buttonlogin').prop("disabled", false);
    }
    else {
        $('#buttonlogin').prop("disabled", true);
    }
}
/*******************************************************************************/

/*------- Para aparecer o primeiro e ultimo nome no canto superior direito da pagina ----*/

$(document).ready(function(){
    var primeiro_nome = window.sessionStorage.getItem("primeiro_nome");
    var ultimo_nome = window.sessionStorage.getItem("ultimo_nome");
    
    document.getElementById('primeiroultimonome').innerHTML = "Olá, "+primeiro_nome+" "+ultimo_nome;
    showPage();
})