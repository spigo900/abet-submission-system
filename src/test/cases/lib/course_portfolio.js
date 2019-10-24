const Course = require('../../../main/models/Course')
const Portfolio = require('../../../main/models/CoursePortfolio')
const StudentLearningOutcome = require('../../../main/models/StudentLearningOutcome')
const { transaction } = require('objection')

const course_portfolio = require('../../../main/lib/course_portfolio')
const { expect } = require('../../chai')
const sinon = require('sinon')

const sandbox = sinon.createSandbox()

describe('Lib - CoursePortfolio', () => {

	describe('new', () => {

		afterEach(() => {
			sandbox.restore()
		})

		it('with mocks, valid course info', async () => {
			const department_id = 1
			const course_number = 498
			const instructor = 1
			const semester = 1
			const year = "2019"
			const num_students = 4
			const student_learning_outcomes = ["1"]
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

			const mock3 = sinon.mock(transaction)
			mock3.expects('start').returns((() => {
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
		})

		it('with mocks, invalid course number', async () => {
			const portfolio_details = {
				department_id: 1,
				course_number: 6,
				instructor: 1,
				semester: 1,
				year: "2019",
				num_students: 4,
				student_learning_outcomes: ["1"],
				section: 2
			}

			sinon.stub(course_portfolio, '_findCourseByNumber').returns(undefined)

			await (expect(course_portfolio.new(portfolio_details))
				.to.eventually.be.rejectedWith(course_portfolio.BadCourseError))
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

			// It should start a transaction and then roll it back.
			const mock_trx = {rollback: sinon.spy()}
			const mock3 = sinon.mock(transaction)
			mock3.expects('start').returns(mock_trx)

			return (expect(course_portfolio.new(portfolio_details))
				.to.eventually.be.rejectedWith(Error).and.then(() => {}, (_err) =>
					mock1.verify() &&
					mock2.verify() &&
					mock3.verify() &&
					mock_trx.rollback.calledOnce))
		})
	})

	describe('get', () => {

		it('with id', async () => {
			const portfolio = await course_portfolio.get(1)

			// TODO
		})

	})

})