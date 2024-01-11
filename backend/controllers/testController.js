
exports.urlForm = (req, res, next) => {

	console.log(req.body)

	res.status(201).json({
		status: 'success',
		data: req.body
	})
}