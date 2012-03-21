#!node

var marked = require('marked');
var fs = require('fs');
var path = require('path');processIncludes

var format = 'html';
var template = 'template.html';
var inputPath = '../../api';
var outputPath = '../../html';
function process(_f, _t, _ip, _op) {
	format = _f || format;
	template = _t || template;
	inputPath = _ip || inputPath;
	outputPath = _op || outputPath;
	
	fs.readdir(inputPath, function(er, files) {
		if (er) throw er;
		
		files.sort();
		files.forEach(function (file) {
			if (path.extname(file) == '.markdown') {
				var inputFile = path.join(inputPath, file);
				fs.readFile(inputFile, 'utf8', function(er, input) {
					if (er) throw er;
					
					console.log('proccess "' + inputFile + '" ...');
					// process the input for @include lines
					processIncludes(input, inputFile, next);
				});
			}
		});
	});
}


function processIncludes(input, inputFile, cb) {
	var includeExpr = /^@include\s+([A-Za-z0-9-_]+)(?:\.)?([a-zA-Z]*)$/gmi;
	var includeData = {};
	var includes = input.match(includeExpr);
	if (includes === null) return cb(null, input, inputFile);
	var errState = null;
	console.error(includes);
	var incCount = includes.length;
	if (incCount === 0) cb(null, input, inputFile);
	includes.forEach(function(include) {
		var fname = include.replace(/^@include\s+/, '');
		if (!fname.match(/\.markdown$/)) fname += '.markdown';

		if (includeData.hasOwnProperty(fname)) {
			input = input.split(include).join(includeData[fname]);
			incCount--;
			if (incCount === 0) {
				return cb(null, input, inputFile);
			}
		}

		var fullFname = path.resolve(path.dirname(inputFile), fname);
		fs.readFile(fullFname, 'utf8', function(er, inc) {
			if (errState) return;
			if (er) return cb(errState = er);
			processIncludes(inc, inputFile, function(er, inc) {
				if (errState) return;
				if (er) return cb(errState = er);
				incCount--;
				includeData[fname] = inc;
				input = input.split(include).join(includeData[fname]);
				if (incCount === 0) {
					return cb(null, input, inputFile);
				}
			});
		});
	});
}

function next(er, input, inputFile) {
	// if (er) throw er;
	
	if (!input) return;
	
	switch (format) {
		case 'json':
			require('./json.js')(input, inputFile, function(er, obj) {
				if (er) throw er;
				output(JSON.stringify(obj, null, 2), inputFile);
			});
			break;

		case 'html':
			require('./html.js')(input, inputFile, template, function(er, html) {
				if (er) throw er;
				output(html, inputFile);
			});
			break;

		default:
			throw new Error('Invalid format: ' + format);
	}
}

function output(html, inputFile) {
	console.log('proccess "' + inputFile + '" done');
	
	var outputFile = path.join(outputPath, path.basename(inputFile).replace('.markdown', '.' + format));	
	console.log('output "' + outputFile + '" ...');
	
	fs.writeFile(outputFile, html, 'utf8', function(er) {
		if (er) throw er;
		console.log('output "' + outputFile + '" done');
	});
}


module.exports = process;
if (require.main === module) {
	process();
}