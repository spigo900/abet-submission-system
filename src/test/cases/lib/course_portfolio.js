const Portfolio = require('../../../main/models/CoursePortfolio')
const StudentLearningOutcome = require('../../../main/models/StudentLearningOutcome')
const PortfolioSLO = require('../../../main/models/CoursePortfolio/StudentLearningOutcome')
const course_portfolio = require('../../../main/lib/course_portfolio')
const { expect } = require('../../chai')

describe('Lib - CoursePortfolio', () => {

	// TODO: write.
	// beforeEach(() => {
	// 	return transaction
	// })
	// afterEach((trn) => {})

	describe('new', () => {

		it('with test database, valid course info', async () => {
			const department_id = 1
			const course_number = 498
			const instructor = 1
			const semester = 1
			const year = "2019"
			const num_students = 4
			const student_learning_outcomes = ["2"]
			const section = 201

			console.error(`department_id = ${department_id}`)
			console.error(`course_number = ${course_number}`)

			const portfolio = await course_portfolio.new({
				department_id,
				course_number,
				instructor,
				semester,
				year,
				num_students,
				student_learning_outcomes,
				section
			})

			expect(portfolio).to.have.property('id')

			const result = await Portfolio.query().findById(portfolio.id)
			expect(result).to.exist

			const outcome_relations = await portfolio.$relatedQuery('outcomes').where('portfolio_id', portfolio.id)
			// TODO: does this do what I wanted it to do?
			// every student learning outcome index should generate a portfolio-SLO relation
			for (slo_index of student_learning_outcomes) {
				parsed = parseInt(slo_index)
				const slo = await StudentLearningOutcome.query().where('index', parsed).first()
				expect(slo.index).to.equal(parsed)
			}
			// every portfolio-SLO relation should come from a student learning outcome index
			for (outcome_relation of outcome_relations) {
				const slo = await StudentLearningOutcome.query().where('id', outcome_relation.slo_id).first()
				expect(student_learning_outcomes.map(parseInt)).to.include(slo.index)
			}
		})

		it('with test database, invalid course number', () => {
			const portfolio_details = {
				department_id: 1,
				course_number: 6,
				instructor: 1,
				semester: 1,
				year: "2019",
				num_students: 4,
				student_learning_outcomes: ["2"],
				section: 2
			}

			return expect(course_portfolio.new( portfolio_details )).to.eventually.be.rejected
		})

		it('with test database, invalid SLOs', () => {
			const portfolio_details = {
				department_id: 1,
				course_number: 498,
				instructor: 1,
				semester: 1,
				year: "2019",
				num_students: 4,
				student_learning_outcomes: ["9001"],
				section: 2
			}

			// TODO: rejectedWith... something.
			return expect(course_portfolio.new( portfolio_details )).to.eventually.be.rejected
		})
	})

	describe('get', () => {

		it('with id', async () => {
			const portfolio = await course_portfolio.get(1)

			// TODO
		})

	})

})