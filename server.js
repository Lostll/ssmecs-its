/*
	Module Name: Server.js
	Version: 1.0.0
	Description: Server code for virtual mixed coach. Handle html address and local interaction.
	TC 2020
*/

// load libraries
const express = require('express');
const app = express();
const serverLib = require('./library/serverlib.js');
const fs = require('fs');
const bodyParser = require('body-parser');

// load json index content
let assetList = JSON.parse(fs.readFileSync('./public/assets/list.json'));
let assetKeys = Object.keys(assetList);
console.log(assetList);

// register view engine
app.set('views', './views');
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

// listen for requests
app.listen(3000);

app.get('/', (req, res) => {

	// front page to introduce the system --> go to student / tutor page
	res.render('index.ejs');

});

app.get('/coach', (req, res) => {

	// front tutor page to introduce --> edit a file / create new file
	res.render('main_coach.ejs', {contents:assetList, keys:assetKeys});

});

app.post('/coach', (req, res) => {
	if (req.body.type =="Add Class"){
		assetList["moduleNum"] += 1;
		assetList[req.body.fileName] = {};
		assetList[req.body.fileName]["name"] = req.body.name;
		assetList[req.body.fileName]["path"] = "./public/assets/" + req.body.fileName + ".json";
		assetList[req.body.fileName]["description"] = req.body.description;
		fs.writeFile("./public/assets/list.json", JSON.stringify(assetList), function(err) {
    		if (err) {console.log(err);}
		});
		newClass = {};
		newClass["name"] = req.body.name;
		newClass["id"] = assetList["moduleNum"] - 1;
		newClass["tutor"] = req.body.tutor;
		newClass["description"] = req.body.description;
		newClass["path"] = "./assets/" + req.body.fileName + ".json";
		newClass["queue"] = [];
		fs.writeFile(assetList[req.body.fileName]["path"], JSON.stringify(newClass), function(err){
			if (err) {console.log(err);}
		});
		fs.mkdir("./public/assets/" + req.body.fileName,function(err){
			if (err) {console.log(err);}
		});
		res.redirect('/');
	}
	else if (req.body.type =="Delete Class"){
		delete assetList[req.body.fileName];
		assetList["moduleNum"] -= 1;
		fs.writeFile("./public/assets/list.json", JSON.stringify(assetList), function(err) {
    		if (err) {console.log(err);}
		});
		fs.unlink("./public/assets/"+ req.body.fileName +".json", (err) => { 
			if (err) throw err; 
			console.log("./public/assets/"+ req.body.fileName +".json was deleted");
		});
		fs.rmdir("./public/assets/"+ req.body.fileName, (err) => { 
			if (err) throw err; 
			console.log("./public/assets/"+ req.body.fileName +" was deleted");
		});
		res.redirect('/');
	}
});


for (let searchKeyIndex = 1; searchKeyIndex < assetKeys.length; searchKeyIndex++){

	app.get('/coach/' + assetKeys[searchKeyIndex], (req, res) => {

		res.render('edit_coach.ejs', {
			data:JSON.parse(fs.readFileSync(assetList[assetKeys[searchKeyIndex]]["path"])), parturl:assetKeys[searchKeyIndex]
		});

	});

}

app.get('/student', (req, res) => {

	// study a course --> enter a class title and load the page
	res.render('main_student.ejs', {contents:assetList, keys:assetKeys});

});

for (let searchKeyIndex = 1; searchKeyIndex < assetKeys.length; searchKeyIndex++){

	app.get('/student/' + assetKeys[searchKeyIndex], (req, res) => {

		res.render('edit_student.ejs', {
			data:JSON.parse(fs.readFileSync(assetList[assetKeys[searchKeyIndex]]["path"]))
		});

	});

}

app.use((req, res) => {

	res.status(404).render('404.ejs', {title:"404"});

});