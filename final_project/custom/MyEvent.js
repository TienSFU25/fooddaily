var events = require('events')

function MyEvent(count, finished, message) {
	this.count = count
	this.message = ((message == undefined) ? "Default event" : message)

	events.EventEmitter.call(this)
	if (count == 0) {
		// console.log(this.message + " is complete!")
		finished()
	}

	this.on('inc', function(args){
		this.count--
		if (this.count == 0) {
			// console.log(this.message + " is complete!")
			finished(args)
		} else {
			// console.log(this.message + " has " + this.count + " left")
		}
	})
}

MyEvent.prototype.__proto__ = events.EventEmitter.prototype;

MyEvent.prototype.inc = function(args) {
	this.emit('inc', args)
};

module.exports = MyEvent