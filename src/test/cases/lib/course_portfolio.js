const Course = require('../../../main/models/Course')
const Portfolio = require('../../../main/models/CoursePortfolio')
const StudentLearningOutcome = require('../../../main/models/StudentLearningOutcome')
const { transaction } = require('objection')

const course_portfolio = require('../../../main/lib/course_portfolio')
const { expect } = require('../../chai')
const sinon = require('sinon')

// we use a sandbox so that we can easily restore all stubs created in that sandbox
const sandbox = sinon.createSandbox();

describe('Lib - CoursePortfolio', () => {
	// Save variable for reuse
	const portfolio_big = {
				"id": 1,
				"course_id": 1,
				"instructor_id": 1,
				"semester_term_id": 1,
				"num_students": 5,
				"section": 1,
				"year": 2019,
				"expire_date": new Date(Date.parse('3000-01-01')),
				"read_only": false,
				"course": {
					"id": 1,
					"department_id": 1,
					"number": 498,
					"department": {
						"id": 1,
						"identifier": "cs",
						"name": "Computer Science"
					}
				},
				"instructor": {
					"id": 1,
					"linkblue_username": "user"
				},
				"semester": {
					"id": 1,
					"type": 1,
					"value": "fall"
				},
				"outcomes": [
					{
						"id": 1,
						"portfolio_id": 1,
						"slo_id": 1,
						"slo": {
							"id": 1,
							"department_id": 1,
							"index": 2,
							"description": "Design, implement, and evaluate a computing-based solution to meet a given set of computing requirements in the context of the program's discipline.",
							"metrics": [
								{
									"id": 1,
									"slo_id": 1,
									"index": 1,
									"name": "Identify and interpret client needs and design constraints",
									"exceeds": "n/a",
									"meets": "n/a",
									"partially": "n/a",
									"not": "n/a"
								}
							]
						},
						"artifacts": [
							{
								"id": 1,
								"portfolio_slo_id": 1,
								"index": 1,
								"name": "_unset_",
								"evaluations": [
									{
										"id": 1,
										"artifact_id": 1,
										"evaluation_index": 1,
										"student_index": 1,
										"evaluation": [],
										"file": null
									}
								]
							},
							{
								"id": 2,
								"portfolio_slo_id": 1,
								"index": 2,
								"name": "_unset_",
								"evaluations": [
									{
										"id": 6,
										"artifact_id": 2,
										"evaluation_index": 1,
										"student_index": 1,
										"evaluation": [],
										"file": null
									}
								]
							},
							{
								"id": 3,
								"portfolio_slo_id": 1,
								"index": 3,
								"name": "_unset_",
								"evaluations": [
									{
										"id": 11,
										"artifact_id": 3,
										"evaluation_index": 1,
										"student_index": 1,
										"evaluation": [],
										"file": null
									}
								]
							}
						]
					}
				]
			}
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
			const expire_date = new Date(Date.parse('3000-01-01'))
		 	const read_only = false

			const mock1 = sandbox.mock(Course)
			mock1.expects('query').returns((() => {
				const mock = {}
				mock.where = () => mock
				mock.first = () => ({id: 1, number: course_number})
				return mock
			})())

			const mock2 = sandbox.mock(Portfolio)
			mock2.expects('query').returns((() => {
				const mock = {}
				mock.insert = () => ({id: 1,
					$relatedQuery: () => ({
						insert: () => ({id: 1})
					})
				})
				return mock
			})())

			const mock3 = sandbox.mock(transaction)
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
				section,
				expire_date,
				read_only
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
				section: 2,
				expire_date: new Date(Date.parse('3000-01-01')),
				read_only: false,
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
				section: 2,
				expire_date: new Date(Date.parse('3000-01-01')),
				read_only: false,
			}

			// It should look up the course number and find it valid
			const mock1 = sandbox.mock(Course)
			mock1.expects('query').returns((() => {
				const mock = {}
				mock.where = () => mock
				mock.first = () => ({id: 1, number: portfolio_details.course_number})
				return mock
			})())

			// It should insert the portfolio and then try to do a $relatedQuery on that
			const mock2 = sandbox.mock(Portfolio)
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
			const mock3 = sandbox.mock(transaction)
			mock3.expects('start').returns(mock_trx)

			return (expect(course_portfolio.new(portfolio_details))
				.to.eventually.be.rejectedWith(Error).and.then(() => {}, (_err) =>
					mock1.verify() &&
					mock2.verify() &&
					mock3.verify() &&
					mock_trx.rollback.calledOnce))
		})
	})

	describe('updateReadOnly', () => {
		afterEach(() => {
			sandbox.restore()
		})

		it('it\'s expired', async () => {
			// Arrange
			const CoursePortfolio = require('../../../main/models/CoursePortfolio')
			let portfolio_big_local = Object.assign({}, portfolio_big)
			portfolio_big_local.expire_date = new Date(Date.parse('2000-01-23'))
			const spy = sinon.stub().returns(true)

			// stub the CoursePortfolio.query() method
			sandbox.stub(CoursePortfolio, "query").returns({
				// stub the CoursePortfolio.query().findById() method
				findById: sinon.stub().onCall(0).returns(
					portfolio_big_local
				).onCall(1).returns({
					patch: spy
				})
			})

			// Act
			await course_portfolio.updateReadOnly(1)

			// Assert
			expect(spy.calledOnce).to.be.true
		})

		it('it\'s not expired', async () => {
			// Arrange
			const CoursePortfolio = require('../../../main/models/CoursePortfolio')
			let portfolio_big_local = Object.assign({}, portfolio_big)
			portfolio_big_local.expire_date = new Date(Date.parse('9000-01-23'))
			const spy = sinon.stub().returns(true)

			// stub the CoursePortfolio.query() method
			sandbox.stub(CoursePortfolio, "query").returns({
				// stub the CoursePortfolio.query().findById() method
				findById: sinon.stub().onCall(0).returns(
					portfolio_big_local
				).onCall(1).returns({
					patch: spy
				})
			})

			// Act
			await course_portfolio.updateReadOnly(1)

			// Assert
			expect(spy.calledOnce).to.be.false

		})

		it('id does not exist', async () => {
			// Arrange
			const CoursePortfolio = require('../../../main/models/CoursePortfolio')
			const spy = sinon.stub().returns(true)

			// stub the CoursePortfolio.query() method
			sandbox.stub(CoursePortfolio, "query").returns({
				// stub the CoursePortfolio.query().findById() method
				findById: sinon.stub().returns(
					undefined
				)
			})

			// Assert
			await expect(course_portfolio.updateReadOnly(1)).to.eventually.be.rejected
		})
	})

	describe('get', () => {

		// this is ran after each unit test
		afterEach(() => {
			// this is needed to restore the CoursePortfolio model back to it's original state
			// we don't want to break all future unit tests
			sandbox.restore()
		})

		it('with id', async () => {
			// Arrange
			const CoursePortfolio = require('../../../main/models/CoursePortfolio')

			// stub the CoursePortfolio.query() method
			sandbox.stub(CoursePortfolio, "query").returns({
				// stub the CoursePortfolio.query().eager() method
				eager: sandbox.stub().returns({
					// stub the CoursePortfolio.query().eager().findById() method
					findById: sinon.stub().returns(portfolio_big)
				})
			})

			// Act
			const portfolio = await course_portfolio.get(1)

			// Assert
			expect(portfolio).to.deep.equal({
				"portfolio_id": 1,
				"course_id": 1,
				"read_only": false,
				"expire_date": new Date(Date.parse('3000-01-01')),
				"instructor": {
					"id": 1,
					"linkblue_username": "user"
				},
				"num_students": 5,
				"outcomes": [
					{
						"artifacts": [
							{
								"id": 1,
								"portfolio_slo_id": 1,
								"index": 1,
								"name": "_unset_",
								"evaluations": [
									{
										"id": 1,
										"artifact_id": 1,
										"evaluation_index": 1,
										"student_index": 1,
										"evaluation": [],
										"file": null
									}
								]
							},
							{
								"id": 2,
								"portfolio_slo_id": 1,
								"index": 2,
								"name": "_unset_",
								"evaluations": [
									{
										"id": 6,
										"artifact_id": 2,
										"evaluation_index": 1,
										"student_index": 1,
										"evaluation": [],
										"file": null
									}
								]
							},
							{
								"id": 3,
								"portfolio_slo_id": 1,
								"index": 3,
								"name": "_unset_",
								"evaluations": [
									{
										"id": 11,
										"artifact_id": 3,
										"evaluation_index": 1,
										"student_index": 1,
										"evaluation": [],
										"file": null
									}
								]
							}
						],
						"id": 1,
						"department_id": 1,
						"index": 2,
						"description": "Design, implement, and evaluate a computing-based solution to meet a given set of computing requirements in the context of the program's discipline.",
						"metrics": [
							{
								"id": 1,
								"slo_id": 1,
								"index": 1,
								"name": "Identify and interpret client needs and design constraints",
								"exceeds": "n/a",
								"meets": "n/a",
								"partially": "n/a",
								"not": "n/a"
							}
						]
					}
				],
				"course": {
					"department": "cs",
					"number": 498,
					"section": 1,
					"semester": "fall",
					"year": 2019
				}
			})
		})

	})

	describe('calculateEvalsNeeded', () => {
		afterEach(() => {
			// this is needed to restore the CoursePortfolio model back to it's original state
			// we don't want to break all future unit tests
			sandbox.restore()
		})

		it('returns a number', () => {
			expect(course_portfolio.calculateEvalsNeeded(0)).to.be.a('number')
			expect(course_portfolio.calculateEvalsNeeded(1)).to.be.a('number')
			expect(course_portfolio.calculateEvalsNeeded(59)).to.be.a('number')
			expect(course_portfolio.calculateEvalsNeeded(60)).to.be.a('number')
		})

		it('returns zero with zero students', () => {
			const n = 0
			const needed = course_portfolio.calculateEvalsNeeded(n)

			expect(needed).to.equal(n)
		})

		it('returns one with one student', () => {
			const n = 1
			const needed = course_portfolio.calculateEvalsNeeded(n)

			expect(needed).to.equal(n)
		})

		it('returns nine with nine students', () => {
			const n = 9
			const needed = course_portfolio.calculateEvalsNeeded(n)

			expect(needed).to.equal(n)
		})

		it('returns ten with eleven students', () => {
			const needed = course_portfolio.calculateEvalsNeeded(11)

			expect(needed).to.equal(10)
		})

		it('returns ten with fifty-four students', () => {
			const needed = course_portfolio.calculateEvalsNeeded(54)

			expect(needed).to.equal(10)
		})

		it('returns eleven with fifty-five students', () => {
			const needed = course_portfolio.calculateEvalsNeeded(55)

			expect(needed).to.equal(11)
		})
	})

})
