const Portfolio = require('../models/CoursePortfolio')
const Course = require('../models/Course')
const { transaction } = require('objection')

module.exports.BadCourseError = class BadCourseError extends Error {
	constructor(message, extra) {
		super(message, extra)
		this.name = this.constructor.name
		Error.captureStackTrace(this, this.constructor)
	}
}

const _findCourseByNumber = async (department_id, course_number) => {
	return Course.query()
		.where('department_id', department_id)
		.where('number', course_number)
		.first()
}
module.exports._findCourseByNumber = _findCourseByNumber

module.exports.new = async ({
	department_id,
	course_number,
	instructor,
	semester,
	year,
	num_students,
	student_learning_outcomes,  // Note that these are SLO IDs, *not* indices!
	section,
	expire_date,
	read_only
}) => {
	let course = await _findCourseByNumber(department_id, course_number)
	if (!course) {
		throw new module.exports.BadCourseError(
			`you entered a bad course! dept_id=${department_id}, ` +
			`course_number=${course_number} is not a real course!`,
			{department_id: department_id, course_number: course_number}
		)
	}

	// We want adding a portfolio and its SLOs to be atomic. If there's an
	// error partway through, we don't want to commit a partial course
	// portfolio to the database. For example, if one of the SLO indices
	// passed in doesn't refer to a real SLO, we don't want to commit a
	// partial portfolio.
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
				year: parseInt(year),
				expire_date: expire_date,
				read_only: read_only
			})

		// Add SLOs to the database.
		for (let slo_id of student_learning_outcomes) {
			await new_portfolio.$relatedQuery('outcomes', trx)
				.insert({
					portfolio_id: new_portfolio.id,
					slo_id: parseInt(slo_id)
				})
		}

		trx.commit()
	} catch (err) {
		trx.rollback()
		throw err
	}

	return new_portfolio;
}

module.exports.updateReadOnly = async (portfolio_id) => {
	let raw_portfolio = await Portfolio.query().findById(portfolio_id)
	if (raw_portfolio === undefined) {
		throw new Error(`Portfolio id ${portfolio_id} does not exist`)
	}
	let read_only = raw_portfolio.read_only
	if (!read_only && new Date() >= raw_portfolio.expire_date) {
		await Portfolio.query().findById(portfolio_id).patch({
			read_only: true
		})
		read_only = true
	}
	return read_only
}

module.exports.get = async (portfolio_id) => {
	let raw_portfolio = await Portfolio.query()
		.eager({
			course: {
				department: true
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
			department: raw_portfolio.course.department.identifier,
			number: raw_portfolio.course.number,
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

module.exports.calculateEvalsNeeded = (number_of_students) => {
	return Math.min(number_of_students, Math.max(Math.floor(number_of_students/5), 10))
}

// Xorshift-based random number generator.
//
// Based on example code written in C from
// https://en.wikipedia.org/wiki/Xorshift
//
// We need this because JavaScript's random number generator doesn't allow you
// to seed it.
const DEFAULT_SEED = 1153528
const RESTART_NUMBER = 3835659
class MyRandomGenerator {
	constructor(seed) {
		// Set to a default value if needed
		if (seed === undefined) {
			seed = DEFAULT_SEED
		}

		this.seed = seed
	}

	next() {
		let next = this.seed
		next ^= Math.abs(next << 13)
		next ^= next >>> 17
		next ^= Math.abs(next << 5)
		if (next === 0) {
			next = RESTART_NUMBER
		}
		this.seed = next
		return next
	}
}

const randomCourseSample = (seed, num_students) => {
	const evals_needed = module.exports.calculateEvalsNeeded(num_students)

	// Should be deterministically generated based on the portfolio ID.
	rng = new MyRandomGenerator(seed)
	indices = []
	while (indices.length < evals_needed) {
		// Assuming the student indices are 0-indexed. CS professors!
		// const index = rng.next() % num_students
		const index = rng.next() % num_students

		// Do sampling with replacement
		if (indices.indexOf(index) >= 0) {
			continue
		}
		indices.push(index)
	}
	return indices
}
module.exports.randomCourseSample = randomCourseSample
