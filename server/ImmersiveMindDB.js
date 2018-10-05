var mysql = require('mysql');
var crypto = require('crypto');
var Q = require("q");


const connection = mysql.createConnection
				({
					host		: 'localhost',
					user		: 'immersivemind',
					insecureAuth: true,
					database	: 'IMMERSIVEMIND'	 
				});

connection.connect();

function hashPassword(password)
{
	var hash = crypto.createHash('sha256');
	hash.update(password);
	return hash.digest('hex');
}

/*
*	Esta função faz queies simples
*	devolve uma PROMISE que fica num 
*	estado de RESOLVIDA se tudo estiver
*	bem ou é REJEITADA cc
*/
function makeQuery(query, arguments)
{
	var defer = Q.defer();
	connection.query(query, arguments,function (err, result)
									  {
							 		  	if(err || result.length <= 0)
								 			defer.reject();
							 			else
								 			defer.resolve(JSON.stringify(result));
							 		  });
	return defer;
}

/****************************************************************************/
/*                                  CUIDADORES                              */  
/****************************************************************************/

/*
*	Esta função verifica se o cuidador 
* 	está logged in, caso esteja devolve
*	TRUE, caso não esteja devolve FALSE
*/

function checkIfCuidadorIsLogged(cuidadorID)
{
	var checkQuery = "SELECT * "
					+"FROM CUIDADORES "
					+"WHERE LOGGED_IN = TRUE "
					+"AND EMAIL_ID = ?";
	
	var defer = makeQuery(checkQuery, cuidadorID);
	
	return defer.promise;
}

/*
*	Esta função é responsavel por 
*	criar cuidadores, como parametros
* 	é lhe dado o EMAIL_ID e a PASSWORD
* 	que o cuidador quiser.
*	
*	devolve uma PROMISE que fica num 
*	estado de RESOLVIDA se tudo estiver
*	bem ou é REJEITADA cc
*/ 
exports.createCuidador = function (email, passe, primeiroNome, ultimoNome, profissao)
{
	
	var insertQuery = "INSERT INTO CUIDADORES SET ?";  
	email = (email)? email : null;
	primeiroNome = (primeiroNome)? primeiroNome : null;
	ultimoNome = (ultimoNome)? ultimoNome : null;
	profissao = (profissao)? profissao : null;
	
	var toInsert = {EMAIL_ID: email,
					PRIMEIRO_NOME: primeiroNome,
					ULTIMO_NOME: ultimoNome,
					PROFISSAO: profissao,
					PASSWORD: hashPassword(passe),
					LOGGED_IN: false};
			
	var defer =  makeQuery(insertQuery, toInsert);
	return defer.promise;
}

/*
*	Esta função é responsavel por 
*	fazer o login, como parametros
* 	é lhe dado o EMAIL_ID que pode
*	ser o nome do cuidador e a PASSWORD
* 	do respectivo cuidador
*	
*	devolve uma PROMISE que fica num 
*	estado de RESOLVIDA se tudo estiver
*	bem ou é REJEITADA cc
*/ 

exports.cuidadorLogin = function (cuidadorID, password)
{	
	var defer = Q.defer();
		
	var logQuery = "SELECT EMAIL_ID, PRIMEIRO_NOME, ULTIMO_NOME "  
				   +"FROM CUIDADORES "
				   +"WHERE PASSWORD = ? "
				   +"AND EMAIL_ID = ? ";
				   
	var toCheck = [hashPassword(password), cuidadorID];
	connection.query(logQuery,
					 toCheck ,
					 function (err, result, fields)
					 {
					 	if(err || result.length <= 0)
				 			defer.reject();
					 	else
					 	{	
						 	var loginQuery = "UPDATE CUIDADORES "
						 					+"SET LOGGED_IN = ? "
						 					+"WHERE EMAIL_ID = ?";
					 		
					 		connection.query(loginQuery, 
					 						[true, result[0].EMAIL_ID]);
					 						
	 						defer.resolve(JSON.stringify(result));
				 	 	}	
					}
	);
	
	return defer.promise;
}

/*
*	Esta função é responsavel por 
*	fazer o logout, como parametros
* 	é lhe dado o EMAIL_ID que pode
*	ser o nome do cuidador
*	
*	devolve uma PROMISE que fica num 
*	estado de RESOLVIDA se tudo estiver
*	bem ou é REJEITADA cc
*/ 
exports.cuidadorLogout = function (cuidadorID)
{
	 
	
	var logoutQuery = "UPDATE CUIDADORES "
 					+"SET LOGGED_IN = ? "
 					+"WHERE EMAIL_ID = ? ";
 					
	var defer = makeQuery(logoutQuery, [false, cuidadorID]);
	
	return defer.promise;
}

/****************************************************************************/
/*                                  DOENTES                                 */  
/****************************************************************************/

exports.createDoente = function(firstName, lastName, age, obs, cuidadorID, imageName)
{
	
	var insertQuery = "INSERT INTO DOENTES SET ?";
	var toInsert = {PRIMEIRO_NOME: firstName,
					ULTIMO_NOME: lastName,
					IDADE: parseInt(age),
					OBSERVACAO: obs,
					EMAIL_ID: cuidadorID,
                    IMAGEM: imageName
                   };
	
	return doQueryIfLogged(insertQuery, toInsert, cuidadorID);								  
}

exports.getDoentes = function(cuidadorID)
{
	var getDoentesQuery = "SELECT DOENTE_ID, "
						+ "PRIMEIRO_NOME, "
						+ "ULTIMO_NOME, "
                        + "IMAGEM "
						+ "FROM DOENTES "
						+ "WHERE EMAIL_ID = ? "
                        +"ORDER BY PRIMEIRO_NOME ASC, ULTIMO_NOME ASC";
						
	var defer = makeQuery(getDoentesQuery, cuidadorID);
	return defer.promise;	  
}

exports.getDoente = function(doenteID, cuidadorID)
{
	var getDoenteQuery = "SELECT * "
					   + "FROM DOENTES "
					   + "WHERE DOENTE_ID = ? "
					   + "AND EMAIL_ID = ?";
    
	var defer = makeQuery(getDoenteQuery, [doenteID, cuidadorID]);
		
	return defer.promise;
}

exports.updateDoente = function(firstName, lastName, age, obs, cuidadorID, imageName, doenteID)
{
   /* var updateDoenteQuery   = "UPDATE DOENTES "
                            + "SET ? "
                            + "WHERE DOENTE_ID = ?";
    
    var toUpdate = {PRIMEIRO_NOME: firstName,
					ULTIMO_NOME: lastName,
					IDADE: parseInt(age),
					OBSERVACAO: obs,
					EMAIL_ID: cuidadorID,
                    IMAGE: imageName,
                    DOENTE_ID: doenteID
                   };
	
    */
   var updateDoenteQuery   = "UPDATE doentes "
                            + "SET "
                            + "PRIMEIRO_NOME = ?, "
                            + "ULTIMO_NOME = ?, "
                            + "IDADE = ?, "
                            + "OBSERVACAO = ?, "
                            + "IMAGEM = ? "
                            + "WHERE DOENTE_ID = ?";
    
    age = parseInt(age);
    var toUpdate = [firstName,
					lastName,
					age,
					obs,
                    imageName,
                    doenteID
                   ];

    return doQueryIfLogged(updateDoenteQuery, toUpdate, cuidadorID);
}

exports.deleteDoente = function(cuidadorID, doenteID)
{
    var deleteDoenteQuery   = "DELETE "
                            + "FROM DOENTES "
                            + "WHERE DOENTE_ID = ?";
    
    return doQueryIfLogged(deleteDoenteQuery, doenteID, cuidadorID);
    
}

/****************************************************************************/
/*                                  SESSÕES                                 */  
/****************************************************************************/
exports.createSessao = function(nomeSessao, doenteID, cuidadorID, dia, imagem, categorias, videos)
{
	var insertQuery = "INSERT INTO SESSOES SET ?";
    
	var toInsert = {SESSAO_NOME: nomeSessao,
					DOENTE_ID: doenteID,
					EMAIL_ID: cuidadorID,
					DIA: dia,
					IMAGEM: imagem,
                    TERMINADO: 0};
    
    console.log("This is the day: " + dia);
	var promise = categoriasIfLogged(insertQuery, toInsert, cuidadorID, categorias, false, null, videos);
        
	return promise;						
}

exports.getSessoesDoente = function(doenteID)
{
	var getSessoesQuery = "SELECT SESSAO_NOME, SESSOES.IMAGEM, SESSOES.DOENTE_ID AS SESSOES_DOENTE_ID, TERMINADO "
						+ "FROM SESSOES, DOENTES "
						+ "WHERE SESSOES.DOENTE_ID = ? "
						+ "AND DOENTES.DOENTE_ID = ?"; //Não sei se é irrelevante, experimentar
	
	var defer = makeQuery(getSessoesQuery, [doenteID, doenteID]);
	
	return defer.promise;


}

exports.getSessoesCuidador = function(cuidadorID)
{
	var getSessoesQuery = "SELECT SESSAO_ID, SESSAO_NOME, SESSOES.IMAGEM, SESSOES.DOENTE_ID AS SESSOES_DOENTE_ID, PRIMEIRO_NOME, ULTIMO_NOME, DIA, TERMINADO "
						+ "FROM SESSOES "
						+ "LEFT JOIN DOENTES ON "
						+ "DOENTES.DOENTE_ID = SESSOES.DOENTE_ID "
						+ "WHERE SESSOES.EMAIL_ID = ?";
	
	var defer = makeQuery(getSessoesQuery, cuidadorID);
	
	return defer.promise;
}

exports.terminaSessao = function(cuidadorID, sessaoID)
{
    var updateTerminarSessaoQuery   = "UPDATE sessoes "
                                    + "SET "
                                    + "TERMINADO = 1 "
                                    + "WHERE SESSAO_ID = ?";
    
    return doQueryIfLogged(updateTerminarSessaoQuery, sessaoID, cuidadorID); 
}

exports.getSessao = function(sessaoID)
{
	var getSessaoQuery = "SELECT SESSOES.*, SESSOES.DOENTE_ID AS SESSOES_DOENTE_ID, TERMINADO, PRIMEIRO_NOME, ULTIMO_NOME "
						+ "FROM SESSOES "
                        + "LEFT JOIN DOENTES ON "
                        + "DOENTES.DOENTE_ID = SESSOES.DOENTE_ID "
						+ "WHERE SESSAO_ID = ? ";
						
	var defer = makeQuery(getSessaoQuery, sessaoID);
	
	return defer.promise;
}

/* AQUI SERVE PARA EDITAR UMA SESSÃO EXISTENTE */
exports.updateSessao = function(sessaoID, sessaoNome, cuidadorID, doenteID, dia, imageName, categorias, notCAtegorias, videos)
{

   var updateSessaoQuery   = "UPDATE sessoes "
                            + "SET "
                            + "SESSAO_NOME = ?, "
                            + "DOENTE_ID = ?, "
                            + "DIA = ?, "
                            + "IMAGEM = ? "
                            + "WHERE SESSAO_ID = ?";
    

    var toUpdate = [sessaoNome,
					doenteID,
					dia,
                    imageName,
                    sessaoID
                   ];


    return categoriasIfLogged(updateSessaoQuery, toUpdate, cuidadorID, categorias, sessaoID, notCAtegorias, videos);
}

exports.deleteSessao = function(cuidadorID, sessaoID)
{
    deleteSessaoContemCategorias(sessaoID);
    deleteVideosDaSessao(sessaoID);
    deleteObservacaoDaSessao(sessaoID);

    var deleteSessaoQuery   = "DELETE "
                            + "FROM SESSOES "
                            + "WHERE SESSAO_ID = ?";
    
     connection.query(deleteSessaoQuery, sessaoID);
	//return doQueryIfLogged(deleteSessaoQuery, sessaoID, cuidadorID);  
}



/****************************************************************************/
/*                                  CATEGORIAS                              */  
/****************************************************************************/

exports.getCategorias = function()
{
    
	var getCategoriasQuery      = "SELECT * "
                                + "FROM CATEGORIAS "
                                + "ORDER BY CATEGORIA";
						
	var defer = makeQuery(getCategoriasQuery, 0);
	
	return defer.promise;
}
/****************************************************************************/
/*                            SESSAO_CONTEM_CATEGORIAS                      */  
/****************************************************************************/

function associateCategoriesToSessions(categoria)
{
    var associateQuery  = "INSERT INTO SESSAO_CONTEM_CATEGORIAS "
                        + "VALUES (LAST_INSERT_ID(), ?)";
    
    makeQuery(associateQuery, categoria);
}

function updateCategoriesToSessions(categoria, sessaoID)
{
    var associateQuery  = "INSERT INTO SESSAO_CONTEM_CATEGORIAS "
                        + "VALUES (?, ?)";
    
    makeQuery(associateQuery, [sessaoID, categoria]);
}


function removeCategoriesToSessions(categoria, sessaoID)
{
    var associateQuery  = "DELETE "
                        + "FROM SESSAO_CONTEM_CATEGORIAS "
                        + "WHERE SESSAO_ID = ? "
                        + "AND CATEGORIA = ? ";
    
    console.log("DELETE ID: " + sessaoID + " CATEGORIA: " + categoria);
    makeQuery(associateQuery, [sessaoID, categoria]);
}




exports.getCategoriasFromSession = function(sessaoID){
    
    var getCategoriasFromSessionQuery   = "SELECT DISTINCT CATEGORIA "
                                        + "FROM SESSAO_CONTEM_CATEGORIAS "
                                        + "WHERE SESSAO_ID = ? ";
    
    var defer = makeQuery(getCategoriasFromSessionQuery, sessaoID);
    
    return defer.promise;
}

function deleteSessaoContemCategorias (sessaoID)
{
    var deleteSessaoQuery   = "DELETE "
                            + "FROM SESSAO_CONTEM_CATEGORIAS "
                            + "WHERE SESSAO_ID = ?";
    
    connection.query(deleteSessaoQuery, sessaoID);
    
}

/****************************************************************************/
/*                                  VÍDEOS                                  */  
/****************************************************************************/


/*
*	Tens que ver ou aqui passas o URL do Youtube
*	e aqui vais buscar o URL do Ficheiro ou
*	entao dás logo o URL do ficheiro
*/
exports.createVideo = function(sessaoID, tituloVideo, videoUrlThumbnail, videoUrlFicheiro, cuidadorID)
{
	var insertQuery = "INSERT INTO VIDEOS SET ?";
	
	//Caso se ponha o URL do youtube tem de se tratar do URL_FILE aqui
	// videoUrlFicheiro = fetchUrlFile(youtubeURL);
	
	var toInsert = {SESSAO_ID: sessaoID,
					VIDEO_TITLE: tituloVideo,
					URL_THUMBNAIL: videoUrlThumbnail, 
					URL_FILE: videoUrlFicheiro};
					
	return doQueryIfLogged(insertQuery, toInsert, cuidadorID);
		
}

exports.getVideosDaSessao = function(sessaoID)
{
	var getVideosDaSessaoQuery = "SELECT DISTINCT VIDEO_TITLE, URL_FILE, URL_THUMBNAIL "
					+ "FROM VIDEOS "
					+ "WHERE SESSAO_ID = ? ";
						
	var defer = makeQuery(getVideosDaSessaoQuery, sessaoID);
	
	return defer.promise;
}

exports.getVideosDaCategoria = function(categoria)
{
	var getVideosDaCategoriaQuery  = "SELECT * "
					               + "FROM VIDEOS "
					               + "WHERE CATEGORIA = ? ";
						
	var defer = makeQuery(getVideosDaCategoriaQuery, categoria);
	
	return defer.promise;
}

function insertVideoToSession(video_title, thumbnail, video_url)
{
    var insertVideoToSessionQuery   = "INSERT INTO VIDEOS "
                                    + "VALUES (?, NULL, LAST_INSERT_ID(), ?, ?)";
    
    
    var insertParams = [video_title,
                        thumbnail,
                       video_url];
    
    makeQuery(insertVideoToSessionQuery, insertParams);
}

function addVideoToSession(video_title, thumbnail, video_url, sessaoID)
{
    var insertVideoToSessionQuery   = "INSERT INTO VIDEOS "
                                    + "VALUES (?, NULL, ?, ?, ?)";
    
    
    var insertParams = [video_title,
                        sessaoID,
                        thumbnail,
                       video_url];
    
    makeQuery(insertVideoToSessionQuery, insertParams);
}

exports.insertVideoDaSessao  = function(video_title, videoid, sessaoID, cuidadorID)
{
    var insertVideoToSessionQuery   = "INSERT INTO VIDEOS "
                                    + "VALUES (?, NULL, ?, ?, ?)";
    
    var thumbnail = "https://i.ytimg.com/vi/"+videoid+"/hqdefault.jpg";
    
    var insertParams = [video_title,
                        sessaoID,
                        thumbnail,
                       videoid];
    
   return doQueryIfLogged(insertVideoToSessionQuery, insertParams, cuidadorID);
}

exports.deleteVideoDaSessao = function(videoID, sessaoID, cuidadorID)
{
    var deleteVideosQuery   = "DELETE "
                            + "FROM VIDEOS "
                            + "WHERE SESSAO_ID = ? "
                            + "AND URL_FILE = ?";
    
    var params = [sessaoID,videoID];
    
   return doQueryIfLogged(deleteVideosQuery, params, cuidadorID); 
}

function deleteVideosDaSessao (sessaoID)
{
    var deleteVideosQuery   = "DELETE "
                            + "FROM VIDEOS "
                            + "WHERE SESSAO_ID = ? ";
    
    connection.query(deleteVideosQuery, sessaoID);
    
}

/****************************************************************************/
/*                                  OBSERVAÇÕES                             */  
/****************************************************************************/

exports.createObservacao = function(sessaoID, elapseTime, reconhecimento, humor, interesse, interaccao, nauseas, desequilibrios, pertubacoesVisuais, observacoes, cuidadorID)
{
	
	
	var insertQuery = "INSERT INTO OBSERVACOES SET ?";
	var toInsert = {SESSAO_ID: sessaoID, 
                    TEMPO: elapseTime,
					RECONHECIMENTO: reconhecimento,
					HUMOR: humor,
                    INTERESSE: interesse,
                    INTERACCAO: interaccao,
                    NAUSEAS: nauseas,
                    DESEQUILIBRIOS: desequilibrios,
                    PERTURBACOES_VISUAIS: pertubacoesVisuais,
					OBSERVACOES: observacoes};
					
	return doQueryIfLogged(insertQuery, toInsert, cuidadorID);
}

exports.updateObservacao = function(sessaoID, reconhecimento, humor, interesse, interaccao, nauseas, desequilibrios, pertubacoesVisuais, observacoes, cuidadorID)
{
	
	var updateQuery =  "UPDATE OBSERVACOES "
                    + "SET "
                    + "RECONHECIMENTO = ?, "
                    + "HUMOR = ?, "
                    + "INTERESSE = ?, "
                    + "INTERACCAO = ?, "
                    + "NAUSEAS = ?, "
                    + "DESEQUILIBRIOS = ?, "
                    + "PERTURBACOES_VISUAIS = ?, "
                    + "OBSERVACOES = ? "
                    + "WHERE SESSAO_ID = ?";
    

	var toUpdate = [reconhecimento,
					humor,
                    interesse,
                    interaccao,
                    nauseas,
                    desequilibrios,
                    pertubacoesVisuais,
					observacoes,
                    sessaoID];

   /* var defer = makeQuery(updateQuery, toUpdate);
	return defer.promise;*/
    console.log("update obs: "+cuidadorID);
    return doQueryIfLogged(updateQuery, toUpdate, cuidadorID);
}


exports.getObservacaoSessaoID = function(sessaoID)
{
	var getObservacaoQuery = "SELECT * "
					+ "FROM OBSERVACOES "
					+ "WHERE SESSAO_ID = ? ";
						
	var defer = makeQuery(getObservacaoQuery, sessaoID);
	
	return defer.promise;
}

function deleteObservacaoDaSessao (sessaoID)
{
    var deleteObservacaoQuery   = "DELETE "
                                + "FROM OBSERVACOES "
                                + "WHERE SESSAO_ID = ? ";
    
    connection.query(deleteObservacaoQuery, sessaoID);
    
}
/****************************************************************************/
/*                                  SE LOGGED                               */  
/****************************************************************************/

function doQueryIfLogged(query, params, cuidadorID)
{
	var defer = Q.defer();
	var checkLoggedInPromise = checkIfCuidadorIsLogged(cuidadorID);
	
	checkLoggedInPromise.done(function()
								{
									connection.query(query, params);
									defer.resolve();
								},
							  function()
							  	{
							  		console.log("Não Está logged");
					  				defer.reject();
							  	});
	return defer.promise;	
}



function categoriasIfLogged(query, params, cuidadorID, categorias, sessaoID, notCategorias, videos)
{
	var defer = Q.defer();
	var checkLoggedInPromise = checkIfCuidadorIsLogged(cuidadorID);
	checkLoggedInPromise.done(function()
								{
                                
									connection.query(query, params,function (err, result)
									  {
							 		  	if(err || result.length <= 0){
                                            result = "";
                                        }
							 			else
								 			result = JSON.stringify(result);
                                        
                                        defer.resolve(result);
							 		  });

                                    if(sessaoID)
                                    {
                                        for(var i = 0; notCategorias[i]; i++)
                                            removeCategoriesToSessions(notCategorias[i], sessaoID);
                                         for(var i = 0; categorias[i]; i++)
                                            updateCategoriesToSessions(categorias[i], sessaoID);
                                        
                                        for(var j = 0; videos[j]; j++){
                                            var thumbnail = "https://i.ytimg.com/vi/"+videos[j].videoid+"/hqdefault.jpg";
                                            var url = videos[j].videoid;
                                            console.log("inserted");
                                            addVideoToSession(videos[j].title, thumbnail, url, sessaoID);
                                        }
                                    }
                                    else
                                    {
                                        for(var i = 0; categorias[i]; i++)
                                            associateCategoriesToSessions(categorias[i]);
                                        for(var j = 0; videos[j]; j++){
                                            var thumbnail = "https://i.ytimg.com/vi/"+videos[j].videoid+"/hqdefault.jpg";
                                            var url = videos[j].videoid;
                                            
                                            insertVideoToSession(videos[j].title, thumbnail, url);
                                        }
                                    }
									
								},
							  function()
							  	{
							  		console.log("Não Está logged");
					  				defer.reject();
							  	});
	return defer.promise;	
}



