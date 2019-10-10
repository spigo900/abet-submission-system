const Portfolio = require('../models/CoursePortfolio')
const Course = require('../models/Course')
const StudentLearningOutcome = require('../models/StudentLearningOutcome')
const { transaction } = require('objection')

module.exports.BadCourseError = function(message, extra) {
	Error.captureStackTrace(this, this.constructor)
	this.name = this.constructor.name
	this.message = message
	this.extra = extra
}

module.exports.new = async ({
	department_id,
	course_number,
	instructor,
	semester,
	year,
	num_students,
	student_learning_outcomes,
	section
}) => {
	// TODO
	let course = await Course.query()
		.where('department_id', department_id)
		.where('number', course_number)
		.first()
	// TODO: better way?
	if (!course) {
		throw new BadCourseError(
			`you entered a bad course! dept_id=${department_id}, `
			`course_number=${course_number} is not a real course!`,
			{department_id, course_number}
		)
	}

	// We want adding a portfolio and its SLOs to be atomic. If there's an
	// error partway through, we don't want to commit a partial course
	// portfolio to the database. For example, if one of the SLO indices
	// passed in doesn't refer to a real SLO, we don't want to commit a
	// partial portfolio.
	// TODO: I could do the "find the correct SLOs" logic cleaner.
	let trx
	let new_portfolio
	try {
		trx = await transaction.start(Portfolio.knex())
		new_portfolio = await Portfolio.query(trx)
			.insert({
				course_id: parseInt(course.id),
				instructor_id: parseInt(instructor),
				semester_term_id: parseInt(semester),
				num_students: parseInt(num_students),
				section: parseInt(section),
				year: parseInt(year)
			})

		// Add SLOs to the database.
		for (slo_index of student_learning_outcomes) {
			let slo = await StudentLearningOutcome.query()
				.where('index', parseInt(slo_index))
				.first()
			
			await new_portfolio.$relatedQuery('outcomes', trx)
				.insert({
					portfolio_id: new_portfolio.id,
					slo_id: slo.id
				})
		}

		trx.commit()
	} catch (err) {
		// TODO: Do more than just roll this back! Raise the error or something so that it's not a silent error! Silent errors are death!
		trx.rollback()
	}

	return new_portfolio;
}


module.exports.get = async (portfolio_id) => {
	let raw_portfolio = await Portfolio.query()
		.eager({
			owner: {
				owner: true
			},
			instructor: true,
			semester: true,
			outcomes: {
				slo: {
					metrics: true
				},
				artifacts: {
					evaluations: true
				}
			}
		})
		.findById(portfolio_id)

	let portfolio = {
		portfolio_id: raw_portfolio.id,
		course_id: raw_portfolio.course_id,
		instructor: raw_portfolio.instructor,
		num_students: raw_portfolio.num_students,
		outcomes: [],
		course: {
			department: raw_portfolio.owner.owner.identifier,
			number: raw_portfolio.owner.number,
			section: raw_portfolio.section,
			semester: raw_portfolio.semester.value,
			year: raw_portfolio.year
		},
	}

	for (let i in raw_portfolio.outcomes) {
		portfolio.outcomes.push(Object.assign({
			artifacts: raw_portfolio.outcomes[i].artifacts
		}, raw_portfolio.outcomes[i].slo))
	}

	return portfolio
}