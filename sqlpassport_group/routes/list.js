// this class is used for the list page, after a user logs in
// everything sent to /list gets handled here

var express = require('express')

listRouter = express.Router()

// if no user is logged in, redirect
listRouter.use(function(req, res, next) {
	if (req.user == null) {
		res.render('nouser')
	} else {
		next()
	}
})

// search db for all todo items by signed in user
listRouter.get('/', function(req, res) {
	searchListCallback = function(err, rows) {
		if (!err) {
			console.log(req.user.username)
			res.render('list', {rows:rows, username: req.user.username})
		} else {
			console.log(err)
		}
	}
	db.searchList(req.user.id, searchListCallback)
})

// 2 submit buttons on the HTML form. 
// edit item or delete item depending on type of button clicked
listRouter.post('/', function(req, res) {
	if (req.body.type == 'Save') {
		updateItemCallback = function(err, rows) {
			if (!err) {
				res.redirect('/group/list')
			}
		}
		db.updateListItem(req.body.id, req.body.content, updateItemCallback)
	} else if (req.body.type == 'Delete') {
		deleteItemCallback = function(err) {
			if (!err) {
				res.redirect('/group/list')
			}
		}
		db.deleteListItem(req.body.id, deleteItemCallback)
	}
})

	// add an item to table. reload page
listRouter.post('/add', function(req, res) {
	addListItemCallback = function(err, rows) {
		if (!err) {
			res.redirect('/group/list')
		}
	}
	db.addListItem(req.user.id, req.body.newitem, addListItemCallback)
})

module.exports = listRouter
