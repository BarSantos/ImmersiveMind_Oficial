var fs = require('fs');
var path = require('path');
var express    	= require('express');        
var app        	= express();                 
var bodyParser 	= require('body-parser');
var DB			= require('./ImmersiveMindDB.js');
var http = require('http').Server(app);

var net = require('net');
var request = require('request');
var cheerio = require('cheerio');

//app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({limit: '2000mb'}));
app.use(bodyParser.urlencoded({limit: '2000mb', extended: true}));

var port = process.env.PORT || 8080; 

app.use(express.static(path.join(__dirname, '/public')));
app.use(function(req, res, next){
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', '*');
    res.header('Access-Control-Allow-Headers', '*');
    next();
});
var router = express.Router();
app.use('/api', router);



app.engine('.html', require('ejs').__express);
app.set('views', __dirname + '/views');
app.set('view engine', 'html');

app.get('/', function(req, res, next){
	res.render('cover');
});

app.get('/frontpage', function(req, res, next){
    res.render('frontpage');
});

app.get('/patients', function(req, res, next){
    res.render('managepatients');
});

app.get('/sessions', function(req, res, next){
    res.render('managesessions');
});

app.get('/activity', function(req, res, next){
    res.render('startactivity');
});

/*	
* 	O pedido POST faz com que
*	se crie novos cuidadores
*	desvolve "Cuidador Criado"
*	caso corra correctamente e
* 	devolve "Erro a Criar Cuidador
*	caso contrário. 
*/
router.route('/cuidadores').post(
		function(req, res, next)
		{
            
			var email = req.body.cuidadorID;
			var passe = req.body.password;
			var primeiroNome = req.body.primeiroNome;
			var ultimoNome = req.body.ultimoNome;
			var profissao = req.body.profissao;
			
			console.log(email);
			console.log(passe);
			console.log(primeiroNome);
			console.log(ultimoNome);
			console.log(profissao);
			
			var createCuidadorPromise = DB.createCuidador(email, passe, primeiroNome, ultimoNome, profissao);
			promiseResolve(createCuidadorPromise, res, 'Cuidador Criado', 'Erro a Criar Cuidador');
		});

/*
*	O pedido GET tem duas funções
*	caso só seja feito com o cuidadorID 
*	tem como função fazer logout
*	caso seja feito tambem com a password
*	tem como função fazer o login 
*/
router.route('/cuidadores').get(
		function(req, res, next)
		{
			var pwd = req.headers.password;
			var cuidadorID = req.headers.cuidadorid;
            console.log(cuidadorID);
			if(pwd)
			{
				var loginPromise = DB.cuidadorLogin(cuidadorID, pwd);
				promiseWithResult(loginPromise, res,  'Logged In: ' + cuidadorID, 'Error in LogIn');
			}
			else
			{
				var logoutPromise = DB.cuidadorLogout(cuidadorID);
				promiseResolve(logoutPromise, res, 'Logged Out' , 'Error in LogOut');
			}
		});

/*
* 	O pedido POST faz com que
*	se crie novos doentes
*	devolve "Doente Criado"
*	caso corra correctamente e
* 	devolve "Erro a Criar Doente"
*	caso contrário. 
*/
router.route('/doentes').post(
		function(req, res, next)
		{
			
			var primeiroNome = req.body.primeiroNome;
			var ultimoNome = req.body.ultimoNome;
			var idade = req.body.idade;
			var observacao = req.body.observacao;
			var cuidadorID = req.body.cuidadorID;
            var imagem = req.body.imagem;
            var imageName = req.body.imagename;
            
            var base64Data = imagem.split(';base64,').pop().replace(/ /g, '+');
           
            
            console.log(base64Data);
            fs.writeFile("./public/images/userimages/" + imageName, base64Data, {encoding: 'base64'}, function(err) {
                              console.log("Imagem Doente Criada");
                            });
			
			var createDoentePromise = DB.createDoente(primeiroNome, ultimoNome, idade, observacao, cuidadorID, imageName);
			promiseResolve(createDoentePromise, res,'Doente criado' , 'Erro a criar doente');
		});

/*
*	O pedido GET tem duas funções
*	caso só seja feito com o cuidadorID
*	tem como função devolver todos os doentes
*	associados ao cuidador, caso seja feito 
*	tambem com o doenteID tem como função 
* 	devolver a informação do doente 
*/
router.route('/doentes').get(
		function(req, res, next)
		{
			var cuidadorID = req.headers.cuidadorid;
			var doenteID = req.headers.doenteid;
            console.log('Aqui é o cuidador id '+cuidadorID);
			
			if(doenteID)
			{
				var getDoenteInfoPromise = DB.getDoente(doenteID, cuidadorID);
				promiseWithResult(getDoenteInfoPromise, res, "Foi devolvido o doente", "Erro a devolver doente");
			}
			else
			{
				
				var getDoentesPromise = DB.getDoentes(cuidadorID);
                console.log("fez a promessa");
				promiseWithResult(getDoentesPromise, res, "Foram devolvidos Doentes", "Erro a devolver doentes");
			}	
		});
		

router.route('/doentes').put(
        function(req, res, next)
        {
            var primeiroNome = req.body.primeiroNome;
			var ultimoNome = req.body.ultimoNome;
			var idade = req.body.idade;
			var observacao = req.body.observacao;
			var cuidadorID = req.body.cuidadorID;
            var imagem = req.body.imagem;       //conteúdo base64
            var imageName = req.body.imagename; //meryl.jpg
            var doenteID =req.body.doenteID;
            
            if(imagem)
            {
                var base64Data = imagem.split(';base64,').pop().replace(/ /g, '+');


                console.log(base64Data);
                fs.writeFile("./public/images/userimages/" + imageName, base64Data, {encoding: 'base64'}, function(err) {
                                  console.log("Imagem Doente Criada");
                                });
            }
			var updateDoentePromise = DB.updateDoente(primeiroNome, ultimoNome, idade, observacao, cuidadorID, imageName, doenteID);
            
			promiseResolve(updateDoentePromise, res,'Doente actualizado' , 'Erro a actualizar doente');
        });

router.route('/doentes').delete(
        function(req, res, next)
        {
			var cuidadorID = req.body.cuidadorID;
            var doenteID =req.body.doenteID;
            
			
			var deleteDoentePromise = DB.deleteDoente(cuidadorID, doenteID);
            
			promiseResolve(deleteDoentePromise, res,'Doente apagado' , 'Erro a apagar doente');
        });





/*
*	O pedido GET tem duas funções
*	caso só seja feito com o doenteID
*	tem como função devolver todas as sessões
*	associados ao doente, caso seja feito 
*	tambem com o sessaoID tem como função 
* 	devolver a informação da sessão 
*/
router.route('/sessoes').get(
		function(req, res, next)
		{
			var cuidadorID = req.headers.cuidadorid;
			var doenteID = req.headers.doenteid;
			var sessaoID = req.headers.sessaoid;
			
			
			if(sessaoID)
			{
                console.log("sessao id - GET: "+ sessaoID);
				var getSessaoPromise = DB.getSessao(sessaoID);
				promiseWithResult(getSessaoPromise, res, 'Foi devolvida uma Sessao', 'Error a devolver Sessao');
			}
			else
			{
				if(doenteID)
				{
					var getSessoesPromise = DB.getSessoesDoente(doenteID);
					promiseWithResult(getSessoesPromise, res, 'Foram devolvidas Sessoes do Doente', 'Error a devolver Sessoes');
				}
				else
				{
					var getSessoesPromise = DB.getSessoesCuidador(cuidadorID);
					promiseWithResult(getSessoesPromise, res, 'Foram devolvidas Sessoes do Cuidador', 'Error a devolver Sessoes');
				}
			}
			
		});

router.route('/sessoes').put(
        function(req, res, next)
        {
            var sessaoNome = req.body.nomesessao;
			var doenteID = req.body.doenteid;
			var cuidadorId = req.body.cuidadorid;
			var dia = req.body.dia;
			var imagem = req.body.imagem;       //conteúdo base64
            var imageName = req.body.imagename; //meryl.jpg
            var categorias = req.body.categorias;
            var sessaoId = req.body.sessaoid;
            var notcategorias = req.body.notcategorias;
            var terminado = req.body.terminado;
            var videos = req.body.videos;
            
            var splitCategorias = "";
            var splitNotCategorias = "";
            
            console.log(req);
            if(terminado){
                console.log("ENTRA NO TERMINADO");
                var updateTerminarSessaoPromise = DB.terminaSessao(cuidadorId, sessaoId);
                promiseResolve(updateTerminarSessaoPromise, res, 'Sessao terminada', 'Error a terminar sessão');
            }
            else {
                if(imagem)
                {
                    var base64Data = imagem.split(';base64,').pop().replace(/ /g, '+');


                    fs.writeFile("./public/images/sessionimages/" + imageName, base64Data, {encoding: 'base64'}, function(err) {
                                      console.log("Imagem da Sessão Criada");
                                    });
                }
                if(categorias)
                 splitCategorias = categorias.split('-');
                
                if(notcategorias)
                    splitNotCategorias = notcategorias.split('-');

                if(doenteID == '- Nenhum -')
                    doenteID = null;
                if(!dia)
                    dia = null;

                console.log("THIS ARE THE NOT CATEGORIES: " + splitCategorias);
                var updateSessaoPromise = DB.updateSessao(sessaoId, sessaoNome, cuidadorId, doenteID, dia, imageName, splitCategorias, splitNotCategorias, JSON.parse(videos));
                promiseResolve(updateSessaoPromise, res, 'Sessao actualizada', 'Error a actulizar Sessao');
            }
        });

/*
* 	O pedido POST faz com que
*	se crie novas sessões
*	devolve "Sessao Criado"
*	caso corra correctamente e
* 	devolve "Error a criar Sessao"
*	caso contrário. 
*/
router.route('/sessoes').post(
		function(req, res, next)
		{
			var sessaoNome = req.body.nomesessao;
			var doenteID = req.body.doenteid;
			var cuidadorId = req.body.cuidadorid;
			var dia = req.body.dia;
			var imagem = req.body.imagem;       //conteúdo base64
            var imageName = req.body.imagename; //meryl.jpg
            var categorias = req.body.categorias;
            var videos = req.body.videos;
            
            var splitCategorias = "";
           
            if(imagem)
            {
                var base64Data = imagem.split(';base64,').pop().replace(/ /g, '+');


                fs.writeFile("./public/images/sessionimages/" + imageName, base64Data, {encoding: 'base64'}, function(err) {
                                  console.log("Imagem da Sessão Criada");
                                });
            }
            
             splitCategorias = categorias.split('-');
            
            if(doenteID == '- Nenhum -')
                doenteID = null;
            if(!dia)
                dia = null;
                
            console.log("DB - create");
			var createSessaoPromise = DB.createSessao(sessaoNome, doenteID, cuidadorId, dia, imageName, splitCategorias, JSON.parse(videos));
			promiseWithResult(createSessaoPromise, res, 'Sessao criada', 'Error a criar Sessao');
            
            
		});


router.route('/sessoes').delete(
        function(req, res, next)
        {
			var cuidadorID = req.body.cuidadorID;
            var sessaoID =req.body.sessaoID;
            
			
			var deleteSessaoPromise = DB.deleteSessao(cuidadorID, sessaoID);
            res.json({message: 'Sessao apagada'});
        });
		
/*
*	O pedido GET devolve os videos 
* 	associados a uma sessão previamente
*	criada.
*/
router.route('/videos').get(
		function(req, res, next)
		{
			var sessaoID = req.headers.sessaoid;
            var categoria = req.headers.categoria;
            
            console.log("Estou no videos.get if categoria: "+categoria);
			if(categoria){
                var getVideosDaCategoriaPromise = DB.getVideosDaCategoria(categoria);
                promiseWithResult(getVideosDaCategoriaPromise, res, 'Foram devolvidos Videos', 'Error a devolver Videos');
            }
            else{
			     var getVideoSessaoPromise = DB.getVideosDaSessao(sessaoID);
			     promiseWithResult(getVideoSessaoPromise, res, 'Foram devolvidos Videos', 'Error a devolver Videos');
            }
		});

/*
* 	O pedido POST faz com que
*	se crie novas videos
*	devolve "Video Criado"
*	caso corra correctamente e
* 	devolve "Error a criar Video"
*	caso contrário. 
*/
router.route('/videos').post(
		function(req, res, next)
		{
			var sessaoID = req.body.sessaoid;
			var tituloVideo = req.body.titulovideo;
			var videoUrlFicheiro = req.body.videoId;
			var cuidadorID = req.body.cuidadorId;
			
			var createVideoPromise = DB.insertVideoDaSessao(video_title, videoid, sessaoID, cuidadorID);
			promiseResolve(createVideoPromise, res, 'Video criado', 'Error a criar Video');
		});


router.route('/videos').delete(
        function(req, res, next)
        {
			var sessaoID = req.body.sessaoid;
            var videoID =req.body.videoid;
            var cuidadorId = req.body.cuidadorid;
            
            var deleteVideoPromise = DB.deleteVideoDaSessao(videoID, sessaoID, cuidadorId);
            promiseResolve(deleteVideoPromise, res,'Video apagado' , 'Erro a apagar video');  

        });


/****************************************************************************/
/*                                  OBSERVAÇÕES                             */  
/****************************************************************************/
/*
*	O pedido GET tem duas funções
*	caso só seja feito com o doenteID
*	tem como função devolver todas as observacoes
*	associados ao doente, caso seja feito 
*	tambem com o sessaoID tem como função 
* 	devolver as observaçoes da sessão 
*/		
router.route('/observacao').get(
		function(req, res, next)
		{
			var sessaoID = req.headers.sessaoid;

				var getObservacoesSessaoPromise =  DB.getObservacaoSessaoID(sessaoID);
				promiseWithResult(getObservacoesSessaoPromise, res, 'Foram devolvidas Observações', 'Error a devolver Observações');
		});

/*
* 	O pedido POST faz com que
*	se crie novas observações
*	devolve "Observacao Criado"
*	caso corra correctamente e
* 	devolve "Error a criar Observacao"
*	caso contrário. 
*/
router.route('/observacao').post(
		function(req, res, next)
		{
			var sessaoID = req.body.sessaoID;
            var tempo = req.body.tempo;
            var reconhecimento = req.body.reconhecimento;
            var humor = req.body.humor;
            var interesse = req.body.interesse;
            var interaccao = req.body.interaccao;
            var nauseas = req.body.nauseas;
            var desequilibrios = req.body.desequilibrios;
            var perturbacoes_visuais = req.body.perturbacoes_visuais;
            var observacoes = req.body.observacoes;
            var cuidadorID = req.body.cuidadorid;
			
            
            console.log("This is the cuidador id: " + cuidadorID);
            
			var createObservacaoPromise = DB.createObservacao(sessaoID, tempo, reconhecimento, humor, interesse, interaccao, nauseas, desequilibrios, perturbacoes_visuais, observacoes, cuidadorID);
            
			promiseResolve(createObservacaoPromise, res, 'Observacao Criada', 'Error a criar Observacao'); 
		});


router.route('/observacao').put(
		function(req, res, next)
		{
			var sessaoID = req.body.sessaoID;
            var reconhecimento = req.body.reconhecimento;
            var humor = req.body.humor;
            var interesse = req.body.interesse;
            var interaccao = req.body.interaccao;
            var nauseas = req.body.nauseas;
            var desequilibrios = req.body.desequilibrios;
            var perturbacoes_visuais = req.body.perturbacoes_visuais;
            var observacoes = req.body.observacoes;
            var cuidadorID = req.body.cuidadorID;
			
            console.log("sessaoID" + sessaoID);
            console.log("reconhecimento" + reconhecimento);
            console.log("interaccao" + interaccao);
            console.log("observacoes" + observacoes);
            console.log("cuidadorID" + cuidadorID);
            
			var updateObservacaoPromise = DB.updateObservacao(sessaoID, reconhecimento, humor, interesse, interaccao, nauseas, desequilibrios, perturbacoes_visuais, observacoes, cuidadorID);
            
			promiseResolve(updateObservacaoPromise, res, 'Observacao actualizada', 'Error a actualizar Observacao'); 
		});


/****************************************************************************/
/*                                  CATEGORIAS                              */  
/****************************************************************************/

router.route('/categorias').get(
		function(req, res, next)
		{ 
            var sessao_id = req.headers.sessaoid;
            console.log("getCategorias (sessao_id): "+sessao_id);
            if(sessao_id){
                var getCategoriasPromise =  DB.getCategoriasFromSession(sessao_id);
                promiseWithResult(getCategoriasPromise, res, 'Foram devolvidas Categorias', 'Error a devolver Categorias');
            }
            else{
			     
                var getCategoriasPromise =  DB.getCategorias();
                promiseWithResult(getCategoriasPromise, res, 'Foram devolvidas Categorias', 'Error a devolver Categorias');
            }
			
		});


function promiseWithResult(promise, res, consoleMensage, errorMensage)
{
	promise.then(function(result)
				{
					console.log(consoleMensage);
					res.json(result);
				},
			 	 function()
			  	{
			  		res.json({message: errorMensage});
			  	});	
}

function promiseResolve(promise, res, successMensage, errorMensage)
{
	promise.then(function()
				{
					console.log(successMensage);
					res.json({message: successMensage});
				},
			 	 function()
			  	{
                    console.log( 'DEU ERROR: ' + errorMensage);
			  		res.json({message: errorMensage});
			  	});	
}


app.listen(port);


/****************************** 	SOCKET CONNECTION      ********************************/

var clients = new Array();


router.route('/mobile').post(function(req, res, next){ 
            var videoUrl = req.body.videourl;
            var videoPause = req.body.pause;
            var videoPlay = req.body.play;
            var videoStop = req.body.stop;
            
            console.log("Reveived  url from Site " + videoUrl );
            console.log("Reveived  pause from Site " + videoPause );
            console.log("Reveived  play from Site " + videoPlay );
            console.log("Reveived  stop from Site " + videoStop );
        
            
            if(videoUrl)
                sendURL(videoUrl);
            if(videoPause)
                broadcast("0");
            if(videoPlay)
                broadcast("1");
            if(videoStop)
                broadcast("-1");
    
            res.json({message: "Broadcasted"});
        });




var socketServer = net.createServer(function (socket) {
    
  // Put this new client in the list
  clients.push(socket);
  console.log("Mobile Connected!!");
  // Remove the client from the list when it leaves
  socket.on('end', function () {
    clients.splice(clients.indexOf(socket), 1);
  });
  
  socket.on('error', function () {
    clients.splice(clients.indexOf(socket), 1);
  });
});

     // Send a message to all clients
function broadcast(message) 
{
    clients.forEach(function (client) {
      client.write(message);
    });
    // Log it to the server output too
}
              
function sendURL(url)
{
    url = "https://qdownloader.net/download?video="+url;  
    request(url, function(error, response, html)
				    {
                        if(!error)
				        {
                            var $ = cheerio.load(html);
					        try{   
                                var href =$("a:contains('Download')").get(1)["attribs"]["href"];
                                broadcast(href);
                            }
                            catch(err){
                                console.log('Video nao pode ser reproduzido!');
                            }
				        }
				    });
}
    
    
socketServer.listen(6321);

console.log("Server Running!!");
