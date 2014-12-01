var fs = require('fs')

function MyLogger(path) {
	var logger = this
	fs.open(path, 'a', function(err, fd){
		if (err) {
			console.log(err)
		} else {
			logger.fd = fd
		}
	})
}

MyLogger.prototype.log = function(string) {
	fs.write(this.fd, string + '\n')
};

MyLogger.prototype.start = function() {
	fs.write(this.fd, '------------------------>\n')
}

module.exports = MyLogger