var express = require('express');
var mustache = require('../common/mustache')
var html = require('../common/html')
var course_portfolio_lib = require('../lib/course_portfolio')
var router = express.Router();


const Artifact = require('../models/CoursePortfolio/Artifact/index')
const Department = require('../models/Department')
const TermType = require('../models/TermType')
const Portfolio = require('../models/CoursePortfolio')

const course_manage_page = async (res, course_id) => {
	let course_info = {
		student_learning_outcomes: [
			{
				index: 1,
				description: 'n/a',
				metrics: [
					{
						name: 'n/a',
						exceeds: 'n/a',
						meets: 'n/a',
						partially: 'n/a',
						not: 'n/a'
					},
					{
						name: 'n/a',
						exceeds: 'n/a',
						meets: 'n/a',
						partially: 'n/a',
						not: 'n/a'
					},
					{
						name: 'n/a',
						exceeds: 'n/a',
						meets: 'n/a',
						partially: 'n/a',
						not: 'n/a'
					},
					{
						name: 'n/a',
						exceeds: 'n/a',
						meets: 'n/a',
						partially: 'n/a',
						not: 'n/a'
					},
				],
				artifacts: [
					{
						name: 'n/a',
						evaluations: [
							{
								index: 1,
								evaluation: [
									{
										metric: 1,
										value: 6
									},
									{
										metric: 2,
										value: 6
									},
									{
										metric: 3,
										value: 6
									},
									{
										metric: 4,
										value: 6
									}
								]
							}
						]
					}
				]
			}
		]
	};

	res.render('base_template', {
		title: 'CS498 Course Portfolio',
		body: mustache.render('course/manage', course_info)
	})
}

const course_new_page = async (res, department = false) => {
	const departments = await Department.query().select()
	const semesters = await (await TermType.query()
		.findById('semester'))
		.$relatedQuery('terms')
	let student_learning_outcomes = false

	if (department) {
		student_learning_outcomes = await (await Department.query().findById(department))
			.$relatedQuery('student_learning_outcomes')
	}

	res.render('base_template', {
		title: 'New Course Portfolio',
		body: mustache.render('course/new', {
			departments,
			department,
			student_learning_outcomes,
			semesters
		})
	})
}

const REQUIRED_EVALUATIONS_PER_SLO = 3

/* GET course home page */
router.route('/')
	.get(html.auth_wrapper(async (req, res, next) => {
		const portfolio_active = {
			portfolio: await Portfolio.query().eager('[course.department, semester,  outcomes.artifacts]'),
			format_date: function () {
				return this.toLocaleString('default', {month: 'short', day: 'numeric', year: 'numeric'})
			},
			portfolio_completion: function () {
				let num_evaluations = 0

				for (let outcome in this.outcomes) {
					// Count up to the minimum number of evaluations. If this SLO has
					// more, we don't care.
					let evaluations_for_outcome = 0
					for (let _artifact in this.outcomes[outcome].artifacts) {
						if (evaluations_for_outcome < REQUIRED_EVALUATIONS_PER_SLO) {
							evaluations_for_outcome += 1
						} else {
							break
						}
					}
					num_evaluations += evaluations_for_outcome
				}

				const expected_evaluations = REQUIRED_EVALUATIONS_PER_SLO * this.outcomes.length
				const completion = num_evaluations / expected_evaluations
				return (100 * completion).toFixed(1)
			}
		}
		res.render('base_template', {
			title: 'Course Portfolios',
			body: mustache.render('course/index', {
				'portfolio_active': portfolio_active
			})
		})
	}))

/* GET course page */
router.route('/:id')
	.get(html.auth_wrapper(async (req, res, next) => {
		if (req.params.id === 'new') {
			await course_new_page(res)
		} else {
			await course_manage_page(res, req.params.id)
		}
	}))
	.post(html.auth_wrapper(async (req, res, next) => {
		if (req.params.id === 'new') {
			if (req.body.course_submit) {
				const course_portfolio = await course_portfolio_lib.new({
					department_id: req.body.department,
					course_number: req.body.course_number,
					instructor: 1,
					semester: req.body.semester,
					year: req.body.course_year,
					num_students: req.body.num_students,
					student_learning_outcomes: Object.entries(req.body)
						.filter(entry => entry[0].startsWith('slo_') && entry[1] === 'on')
						.map(entry => entry[0].split('_')[1]),
					section: req.body.course_section
				})

				res.redirect(302, `/course/${course_portfolio.id}`)
			} else {
				await course_new_page(res, req.body.department)
			}
		} else {
			await course_manage_page(res, 499)
		}
	}))

module.exports = router
