const Course = require('../../../main/models/Course')
const Portfolio = require('../../../main/models/CoursePortfolio')
const StudentLearningOutcome = require('../../../main/models/StudentLearningOutcome')
const { transaction } = require('objection')

const course_portfolio = require('../../../main/lib/course_portfolio')
const { expect } = require('../../chai')
const sinon = require('sinon')

describe('Lib - CoursePortfolio', () => {

	describe('new', () => {

		beforeEach(() => {
			sinon.createSandbox()
		})

		afterEach(() => {
			sinon.restore()
		})

		it('with mocks, valid course info', async () => {
			const department_id = 1
			const course_number = 498
			const instructor = 1
			const semester = 1
			const year = "2019"
			const num_students = 4
			const student_learning_outcomes = ["2"]
			const section = 211

			const mock1 = sinon.mock(Course)
			mock1.expects('query').returns((() => {
				const mock = {}
				mock.where = () => mock
				mock.first = () => ({id: 1, number: course_number})
				return mock
			})())

			const mock2 = sinon.mock(Portfolio)
			mock2.expects('query').returns((() => {
				const mock = {}
				mock.insert = () => ({id: 1, 
					$relatedQuery: () => ({
						insert: () => ({id: 1})
					})
				})
				return mock
			})())

			const mock3 = sinon.mock(StudentLearningOutcome)
			mock3.expects('query').returns((() => {
				const mock = {}
				mock.where = () => mock
				mock.first = () => ({id: 1, number: course_number})
				return mock
			})())

			const mock4 = sinon.mock(transaction)
			mock4.expects('start').returns((() => {
				const mock = {}
				mock.commit = () => {}
				return Promise.resolve(mock)
			})())

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
			mock1.verify()
			mock2.verify()
			mock3.verify()
			mock4.verify()

			/*
			const result = await Portfolio.query().findById(portfolio.id)
			expect(result).to.exist

			const outcome_relations = await portfolio.$relatedQuery('outcomes').where('portfolio_id', portfolio.id)
			// TODO: does this do what I wanted it to do?
			// Every student learning outcome index should generate a portfolio-SLO relation.
			for (slo_index of student_learning_outcomes) {
				parsed = parseInt(slo_index)
				const slo = await StudentLearningOutcome.query().where('index', parsed).first()
				expect(slo.index).to.equal(parsed)
			}
			// Every portfolio-SLO relation should come from a student learning outcome index.
			for (outcome_relation of outcome_relations) {
				const slo = await StudentLearningOutcome.query().where('id', outcome_relation.slo_id).first()
				expect(student_learning_outcomes.map(parseInt)).to.include(slo.index)
			}
			*/

		})

		it('with mocks, invalid course number', async () => {
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

			const mock1 = sinon.mock(Course)
			const fake_querybuilder = {}
			fake_querybuilder.where = () => fake_querybuilder
			fake_querybuilder.first = () => undefined
			mock1.expects('query').returns(fake_querybuilder)

			return (expect(course_portfolio.new(portfolio_details))
				.to.eventually.be.rejectedWith(course_portfolio.BadCourseError)
				.then(() => {}, (_err) => {
					mock1.verify()
				})
				)
		})

		it('with mocks, invalid SLOs', () => {
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

			// It should look up the course number and find it valid
			const mock1 = sinon.mock(Course)
			mock1.expects('query').returns((() => {
				const mock = {}
				mock.where = () => mock
				mock.first = () => ({id: 1, number: portfolio_details.course_number})
				return mock
			})())

			// It should insert the portfolio and then try to do a $relatedQuery on that
			const mock2 = sinon.mock(Portfolio)
			mock2.expects('query').returns((() => {
				mock = {}
				mock.insert = () => ({id: 1, 
			 		$relatedQuery: () => ({
						insert: () => ({id: 1})
					})
				})
				return mock
			})())

			const mock3 = sinon.mock(StudentLearningOutcome)
			// mock3.query = sinon.fake().returns()
			mock3.expects('query').returns((() => {
				mock = {}
				mock.where = () => mock
				mock.first = () => undefined
				return mock
			})())

			const mock4 = sinon.mock(transaction)
			mock4.expects('start').returns((() => {
				const mock = {}
				mock.rollback = () => {}
				return Promise.resolve(mock)
			})())

			console.error('test 3')
			return (expect(course_portfolio.new(portfolio_details))
				.to.eventually.be.rejected.and.then(() => {}, (_err) =>
					mock1.verify() &&
					mock2.verify() &&
					mock3.verify() &&
					mock4.verify()))
		})
	})

	describe('get', () => {

		it('with id', async () => {
			const portfolio = await course_portfolio.get(1)

			// TODO
		})

	})

})