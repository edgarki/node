// This is a node.js coding challenge including database store
//
// install Redis: npm install redis
// install express: npm install express --save
// install node-input-validator: npm install --save node-input-validator
// install body-parser: npm install body-parser

// define Express.js
var express = require("express");
var app = express();


// define node server on 3000 port
app.listen(3000, () => {
 console.log("Server running on port 3000");
});


const bodyParser = require('body-parser');  
const url = require('url');  
const querystring = require('querystring');  

// encoder to respond locations
var urlencodedParser = bodyParser.urlencoded({ extended: true });

// call parser to json defaults
app.use(bodyParser.urlencoded({ extended: false }));  
app.use(bodyParser.json());

// call to redis nosql database
const redis = require('redis');
const port = 6379;
const host = 'redis-container';
const client  = redis.createClient(port, host);
// call to input validator
const v = require('node-input-validator');


client.on('connect', function(){
	console.log('Redis client connected');
});

client.on('error', function (err) {
    console.log('Something went wrong ' + err);
});

// number of queries since started
var co = 0;
// number of entries on database will be stored here
var bl = 0;


// location with JSON return
app.get('/consulta', async function(req, res) {

    var cpf = req.query.cpf;
    if ( cpf != undefined ) {
    	
    	client.sismember('cpf', cpf, function(err, reply) {
			if (err) throw err;
			var status = reply;
			// query counter increase
			co++;
			res.setHeader('content-type', 'application/json');
			if ( status ) {
				
				res.json({'CPF':cpf,'blacklist':true});
			} else {
				res.json({'CPF':cpf,'blacklist':false});
			}
		});
    	
    } else {
    	res.json({});
    };
    
});

// root page app to use on webbrowser
app.get('/', function (req, res) {
	// mount simple html with input form
	var html='';
	html +="<html>";
	html +="<head>";
	html +="<title>Dev Challenge - add and remove cpf numbers in a list</title>";
	html +="</head>";
	html +="<body>";
	html +="<h2>Insert a CPF to verify its status</h2>";
	html += "<form action='/'  method='post' name='cpfForm'> ";
	html += "<p>CPF: <input type='text' name='cpf'> ";
	html += "<input type='submit' value='Check!'> ";
	html += "<INPUT type='reset'  value='Clear'> </p>";
	html += "</form>";
	html += "</body>";
	html +="</html>";
	res.set('Content-Type', 'text/html');
	res.send(html);
});


// function to validate CPF from Receita Federal
function TestaCPF(strCPF) {
    var Soma;
    var Resto;
    Soma = 0;
  if (strCPF == "00000000000") return false;
     
  for (i=1; i<=9; i++) Soma = Soma + parseInt(strCPF.substring(i-1, i)) * (11 - i);
  Resto = (Soma * 10) % 11;
   
    if ((Resto == 10) || (Resto == 11))  Resto = 0;
    if (Resto != parseInt(strCPF.substring(9, 10)) ) return false;
   
  Soma = 0;
    for (i = 1; i <= 10; i++) Soma = Soma + parseInt(strCPF.substring(i-1, i)) * (12 - i);
    Resto = (Soma * 10) % 11;
   
    if ((Resto == 10) || (Resto == 11))  Resto = 0;
    if (Resto != parseInt(strCPF.substring(10, 11) ) ) return false;
    return true;
};

// root post to get cpf input
app.post('/', urlencodedParser, function (req, res){
	// input validator checking
	let validator = new v ( req.body, {
        cpf:'required|integer|minLength:11'
    });
    validator.check().then(function (matched) {
    	// include CPF validator
        if (!matched || !TestaCPF(req.body.cpf)) {
        	// if error, alert on browser and return to root
            res.send('<script> alert(\"invalid input\"); window.location.replace(\"/\") </script>');
        } else{
        	// input process
        	var reply='';
			var CPF = req.body.cpf;
			// call to Redis, checking if it is on list
			client.sismember('cpf', CPF, function(err, r) {
				if (err) throw err;
				// variable with 1 or 0 depend if it is or not on list
				var status = r;
				// query counter increase
				co++;
				res.set('Content-Type', 'text/html');
				var ht = '';
					ht +="<html>";
					ht +="<head>";
					ht +="<title>Dev Challenge - add and remove cpf numbers in a list</title>";
					ht +="</head>";
					ht +="<body>";
				// on list check
				if ( status ) {
					ht +="CPF: " + CPF + " is BLOCK ";
					ht += '<a href=\"./api?cpf='+ CPF + '&m=delete\" >Remove from blacklist</a>';
					ht +="</body>";
					ht +="</html>";
				// not on list
				} else {
					ht +="CPF: " + CPF + " is FREE ";
					ht += '<a href=\"./api?cpf='+ CPF + '&m=post\" >Add to blacklist</a>';
					ht +="</body>";
					ht +="</html>";
						
				}
				res.send( ht );	
				
				
			});
        
        }
    });
    
	
  
 });




// location to get and delete cpf numbers parsing url string
app.get('/api', async function(req, res) {
	// cpf param
    var cpf = req.query.cpf;
    // method param
    var message = req.query.m;
    // query counter increase
    co++;
    res.set('Content-Type', 'text/html');
    // simple cpf param, it could be better creating a strong validator method
    if ( cpf.length < 11 || !TestaCPF(cpf) ){
    	res.send( "<br>invalid CPF, try again" );
    	console.log("CPF not valid");
    // post accepting
    } else if ( message == 'post' ){
     	client.sadd('cpf',cpf, function(err,res) {
     		console.log("done! cpf added");
     	});
    	res.send( cpf + " added to blacklist" );
    // delete accepting
    } else if ( message == 'delete' ){
    	client.srem('cpf',cpf, function(err,res) {
     		console.log("done! cpf removed");
     	});
    	res.send( cpf + " removed from blacklist" );
    }
    
    
});


// status page
app.get('/status', function(req, res) {
	var html = '';
	html +="<body>";
	// get process uptime and calculate in days, hours and minutes
	var upt = process.uptime();
	var d = Math.floor( upt / (3600 * 24) );
	var h = Math.floor(upt % (3600*24) / 3600);;
	var m = Math.floor(upt % 3600 / 60);
	
	// get number of entries on Redis with key 'cpf'
	client.scard('cpf', function(err,r) {
     	bl = r;
    });
	
	html += 'uptime: '+d+'d'+h+'h'+m+'m';
	html += '</br>';
	html += 'queries: '+co;
	html += '</br>';
	html += 'blacklist: '+bl;
	html +="</body>";
	
	res.send(html);
	

});
