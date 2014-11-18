module.exports = function(app) {
	function getAllMethods(object) {
	    return Object.getOwnPropertyNames(object).filter(function(property) {
	        return typeof object[property] == 'function';
	    });
	}

	var Sequelize = require('sequelize')
	var sequelize = new Sequelize('groupdb', 'group', 'thisgrouprocks', {
		host: 'localhost',
		dialect: 'mysql',
		language: 'en',
		// logging: false
	})

	sequelize
	.query(
		'select * from users where userid= :id',
		null,
		{raw: true},
		{id: 1}
	)
	.success(function(rows) {
		// console.log(rows)
	})

	var Project = sequelize.define('Project', {
	  title: {type: Sequelize.STRING, allowNull: false, defaultValue: true},
	  description: Sequelize.TEXT,
	  id: {type: Sequelize.STRING, primaryKey: true},
	  getset: {type: Sequelize.STRING,
		  get: function() {
		  	console.log('sax get project')
		  	return this.getDataValue('getset') + 'abc'
		  },
		  set: function() {
		  	console.log('sax set project')
		  }
	},
	  getset2: {type: Sequelize.STRING},
	  valThis: {
	  	type: Sequelize.STRING,
	  	validate: {
	  		is: ["^[a-z]+$", 'i'],
	  	}
	  }
	},
	// after this is the configuration
	{
	  getterMethods: {
	  	getset2: function() {
	  		console.log('sax getset2')
	  	}
	  },
	  timestamps: true,
	  tableName: 'sqlize',
	  classMethods: {
	  	m1: function() {console.log('called class method of project')}
	  },
	  instanceMethods: {
	  	m2: function() {console.log('called instance method of m2')}
	  }
	}
	)
	 
	var Task = sequelize.define('Task', {
	  title: Sequelize.STRING,
	  description: Sequelize.TEXT,
	  deadline: Sequelize.DATE,
  	  incrementMe: {type: Sequelize.INTEGER, primaryKey:true, autoIncrement: true},
	},
	{
		tableName: 'tasks'
	})

	// Project.sync({force: true})

	// Project.find({
	// 	where: {id: 1},
	// 	attributes: ['id', ['title', 'renamed title']]
	// }
	// ).success(function(project) {
	// 	console.log(project)
	// })

	// Project.findOrCreate(testDict)
	// .success(function(proj, created) {
	// 	console.log(proj.dataValues)
	// 	console.log(created)
	// })

	// SHIT'S THAT AVAILABLE
	// findAndCountAll
	// findAll
	// all
	// where: Sequelize.and({name: 'a'}, Sequelize.or({id: [1, 2, 3], id: {lt: 10}}))
	// greater than, less than...
	// other stuff like limit, offset
	// .count({where: ...}).success(function (count){})
	// .max, .min, .sum ...

	// Project
	// .build(testDict)
	// .save()
	// .success(function (rows) {})
	// .error(function (error) {console.log(error)})


	// Project.create...

	// saving or changing an attribute
	// Project.find(1).success(function(p) {
	// 	// console.log(p)
	// 	p.updateAttributes({
	// 		title: "changed by update attribute",
	// 		description: "changed description by update atr"
	// 	})
	// 	p.save({'title': 'changed'})
	// 	console.log(p.dataValues)
	// })

	// bulk create/update
	// Model.bulkCreate (objects, Object.keys(objects))
	// Model.update
	// Model.destroy
	// Project.hasMany(Task, {as: 'Tasks'})
	// Project.belongsTo(Task)

	var testDict = {
		where: {incrementMe: 1},
		incrementMe: 1,
		title: "title1",
		description: "desc1",
	}

	var ProjectTasks = sequelize.define('ProjectTasks', {
		status: Sequelize.STRING,
	}, {
		tableName: 'ProjectTasks'
	})

	Project.hasMany(Task, {through: ProjectTasks})
	Task.hasMany(Project, {through: ProjectTasks})

	var SubTask = sequelize.define('SubTask', {
		name: Sequelize.STRING,
		id: {type: Sequelize.INTEGER, primaryKey:true, autoIncrement: true},
		bullshit: Sequelize.STRING,
	}, {
		tableName: 'SubTasks',
		classMethods: {
	  		m1: function() {console.log('called class method of project')}
	  	},
	  	instanceMethods: {
	  		m2: function() {console.log('called instance method of m2')}
	  	}
	})

	Task.hasMany(SubTask)
	SubTask.sync()
	SubTask.removeAttribute('bullshit')

	// Accessors (get, set, add use FIRST PARAMETER OF DEFINE)

	Task.findOrCreate(testDict).success(function (task, created){
		// console.log(task)
		td1 = SubTask.build({name: "subtask12345"})
		task.setSubTasks([1, 5], {name: "asdf"})
		task.addSubTasks([2, 3])
		task.createSubTask({name: "hello_world"})
	 	SubTask.findOne({where: {id: 17}}).success(function (subtask) {
			// console.log(tdf)
			// td2 = SubTask.build({name: "subtask2"})
			// task.setSubTasks(td2)

			// task.getSubTasks({where: {name: 'some sub task'}})
			// task.addSubTasks(td1)

			// PIECE OF SHIT
			// WHERE `id` IN (NULL,5)
			// task.removeSubTask(subtask)
			task.addSubTask(subtask)
			subtask.m2()
			SubTask.m1()
	 	})
	})

	SubTask.update({name: "changed by update"}, {
		where: {
			id: {
				lt: 10
			},
		}
	})

	SubTask.destroy({where: {
			id: {
				lte: 16
			},
		}
	})

	var Test = sequelize.define('Test', {
		id: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
		val: {type: Sequelize.STRING,
			validate: {
				isEmail: true
			}}
	})

	Test.sync()
	Test.build({val: "abcd@sdfu.ca"}).save()
	Test.build({val: "abcd.ca"}).save()

}
	// sequelize.sync()
	// ProjectTasks.sync()

	// Project.belongsTo(Task)