const Portfolio = require('../models/CoursePortfolio')
const Course = require('../models/Course')
const PortfolioSLO = require('../models/CoursePortfolio/StudentLearningOutcome')
const { transaction } = require('objection')

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
		.first();
	// TODO: better way?
	if (!course) {
		throw Error(`you entered a bad course! dept_id=${department_id}, course_number=${course_number} is not a real course!`)
	}

	// TODO: do this as a transaction (I don't know how)
	const new_portfolio = await Portfolio.query()
		.debug('enabled')
		.insert({
			course_id: parseInt(course.id),
			instructor_id: parseInt(instructor),
			semester_term_id: parseInt(semester),
			num_students: parseInt(num_students),
			section: parseInt(section),
			year: parseInt(year)
		});
	
	// add SLOs
	for (slo_id of student_learning_outcomes) {
		await new_portfolio.$relatedQuery('outcomes')
			.insert({
				portfolio_id: new_portfolio.id,
				slo_id: parseInt(slo_id)
			});
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