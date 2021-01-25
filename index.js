import { createClient, Change } from 'ldapjs';
var client = createClient({url: ['ldap://localhost']});
import { performance } from 'perf_hooks';

//console.log(client)
async function f(){

client.bind('cn=admin,dc=example,dc=org', '1234', async function(err) {
	console.log("connected");
	if(err) client.unbind();

	/*var entry = {
		cn: 'pollo',
		sn: 'bello',
		displayName: 'Pollo Bello',
		uid: 'pollo',
		mobile:'0987625637',
		mail: 'foo@bar.com',
		objectclass: 'inetorgperson'
	  };
	  
	  client.add(`uid=${entry.uid},dc=example,dc=org`, entry, function(err) {
		  if(err) console.log(err);
		  else console.log("added");
	  });
	  */
/*
	 var entry = {
		cn: 'readers',
		member:[''],
		objectclass: 'GroupOfNames'
	  };
	  
	 client.add(`cn=readers,dc=example,dc=org`, entry, function(err) {
		if(err) console.log(err);
		else console.log("added");
	});
*/
var change = new Change({
	operation: 'add',
	modification: {
	  member: ['uid=pollo8,dc=example,dc=org']
	}
  });
  
  /*client.modify('cn=admins,dc=example,dc=org', change, function(err) {
	console.error('error: ' + err.message);

  });*/
	client.search('dc=example,dc=org',{scope:"sub"}, function(err, res) {

		let start1 = performance.now();
		res.on('searchEntry', function(entry) {
		    console.log(entry.object);
		  });
		  res.on('searchReference', function(referral) {
		    console.log('referral: ' + referral.uris.join());
		  });
		  res.on('error', function(err) {
		    console.error('error: ' + err.message);
		  });
		  res.on('end', function(result) {
		    console.log('status: ' + result.status);
			console.log("total in ms:", performance.now() - start1 );
			client.unbind(function(err) {});
		  });
	});


});


}

async function sleep(time){
	let p = new Promise((resolve)=>{
		setTimeout(()=>{
			resolve();
		},time);
	});
	await p;
}

f();