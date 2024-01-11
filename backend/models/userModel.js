const bcrypt = require('bcryptjs')
const { Schema, models, model } = require('mongoose');

// name
// email
// password
// confirmPassword
// avatar

const userSchema = new Schema({
	name: {
		type: String,
		requied: true,
		trim: true,
		minlength: 3,
		maxlength: 30
	},
	email: {
		type: String,
		unique: true,
		requied: true,
		trim: true,
		minlength: 3,
		maxlength: 30
	},
	password: {
		type: String,
		requied: true,
		minlength: 4,
		maxlength: 30,
		select: false
	},
	confirmPassword: {
		type: String,
		requied: true,
		validate: function(value) { return this.password === value }
	},
	avatar: {
		type: String,
		required: true
	},

	latestMessage: {
		type: Schema.Types.ObjectId,
		ref: 'Message'
	}

}, {
	timestamps: true,
	toJSON: { virtuals: true }, 			// To show virtual fields when convert to json for response back
})

// userSchema.virtual('fullName').get(function() {
// 	return `${this.firstName} ${this.lastName}`
// })


// used with PATCH or PUT request
userSchema.pre('save', async function(next) {
	if( !this.isModified('password') ) return next()

	this.password = await bcrypt.hash(this.password, 10)
	this.confirmPassword = undefined
	
	next()
})

/* methods. add with instance and statics. adds with Model
=> (bool) user.isPasswordValid(req.body.password, user.password) : */
userSchema.methods.isPasswordValid = async (password, hashedPassword) => {
	return await bcrypt.compare(password, hashedPassword)
}

// userSchema.post('find*', (next) => {
// 	this.fullName = `${this.firstName} ${this.lastName}`
// 	next()
// })

const User = models.User || model('User', userSchema)
module.exports = User