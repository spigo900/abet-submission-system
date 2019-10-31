
exports.seed = knex => Promise.resolve((async () => {
	await knex('artifact_evaluation').del()
	await knex('artifact').del()
	await knex('portfolio_slo').del()
	await knex('portfolio').del()
	await knex('users').del()
	await knex('slo_metric').del()
	await knex('slo').del()
	await knex('course').del()
	await knex('department').del()
	await knex('term').del()
	await knex('term_type').del()


	/* USER SECTION */
	await knex('users').insert([
		{
			id: 1,
			linkblue_username: `user`
		}
	])
	/* DEPARTMENT SECTION */
	await knex('department').insert([
		{
			id: 1,
			identifier: `cs`,
			name: `Computer Science`
		}
	])
	/* TERM SECTION */
	await knex('term_type').insert([
		{
			id: 1,
			type: `semester`
		},
		{
			id: 2,
			type: `evaluation_option`
		}
	])
	await knex('term').insert([
		{
			id: 1,
			type: 1,
			value: `fall`
		},
		{
			id: 2,
			type: 1,
			value: `spring`
		},
		{
			id: 3,
			type: 1,
			value: `summer 1`
		},
		{
			id: 4,
			type: 1,
			value: `summer 2`
		},
		{
			id: 5,
			type: 1,
			value: `winter`
		},
		{
			id: 6,
			type: 2,
			value: `does not apply`
		},
		{
			id: 7,
			type: 2,
			value: `exceeds`
		},
		{
			id: 8,
			type: 2,
			value: `meets`
		},
		{
			id: 9,
			type: 2,
			value: `partially`
		},
		{
			id: 10,
			type: 2,
			value: `not`
		}
	])
	/* SLO SECTION */
	await knex('slo').insert([
		{
			id: 1,
			department_id: 1,
			index: 2,
			description: `Design, implement, and evaluate a computing-based solution to meet a given set of computing requirements in the context of the program's discipline.`
		}
	])
	await knex('slo_metric').insert([
		{
			id: 1,
			slo_id: 1,
			index: 1,
			name: `Identify and interpret client needs and design constraints`
		},
		{
			id: 2,
			slo_id: 1,
			index: 2,
			name: `Establish design evaluation metrics and procedures`
		},
		{
			id: 3,
			slo_id: 1,
			index: 3,
			name: `Develop a design whose product could reasonably meet design needs`
		},
		{
			id: 4,
			slo_id: 1,
			index: 4,
			name: `Articulate a proposed design and rationally support design decisions`
		},
		{
			id: 5,
			slo_id: 1,
			index: 5,
			name: `Identify and interpret client needs and design constraints`
		}
	])
	/* COURSE SECTION */
	await knex('course').insert([
		{
			id: 1,
			department_id: 1,
			number: 498
		}
	])
	/* COURSE PORTFOLIO SECTION */
	await knex('portfolio').insert([
		{
			id: 1,
			course_id: 1,
			instructor_id: 1,
			semester_term_id: 1,
			num_students: 5,
			section: 1,
			year: 2019,
			expire_date: '2019-12-24-T00:00:00',
			read_only: false,
		},
		{
			id: 2,
			course_id: 1,
			instructor_id: 1,
			semester_term_id: 1,
			num_students: 3,
			section: 2,
			year: 2019,
			expire_date: '2019-12-23-T00:00:00',
			read_only: false,
		},
		{
			id: 3,
			course_id: 1,
			instructor_id: 1,
			semester_term_id: 1,
			num_students: 2,
			section: 3,
			year: 2019,
			expire_date: '2019-12-23-T00:00:00',
			read_only: false,
		}
	])
	await knex('portfolio_slo').insert([
		{
			id: 1,
			portfolio_id: 1,
			slo_id: 1
		},
		{
			id: 2,
			portfolio_id: 2,
			slo_id: 1
		},
		{
			id: 3,
			portfolio_id: 3,
			slo_id: 1
		}
	])
	await knex('artifact').insert([
		{
			id: 1,
			portfolio_slo_id: 1,
			index: 1
		},
		{
			id: 2,
			portfolio_slo_id: 1,
			index: 2
		},
		{
			id: 3,
			portfolio_slo_id: 1,
			index: 3
		},
		{
			id: 4,
			portfolio_slo_id: 2,
			index: 1
		},
		{
			id: 5,
			portfolio_slo_id: 2,
			index: 2
		},
		{
			id: 6,
			portfolio_slo_id: 3,
			index: 1
		},
		{
			id: 7,
			portfolio_slo_id: 3,
			index: 2
		},
		{
			id: 8,
			portfolio_slo_id: 3,
			index: 3
		},
		{
			id: 9,
			portfolio_slo_id: 3,
			index: 4
		},
	])
	await knex('artifact_evaluation').insert([
		// Course 1
		/* ARTIFACT 1 */
		{
			id: 1,
			artifact_id: 1,
			evaluation_index: 1,
			student_index: 1
		},
		{
			id: 2,
			artifact_id: 1,
			evaluation_index: 2,
			student_index: 2
		},
		{
			id: 3,
			artifact_id: 1,
			evaluation_index: 3,
			student_index: 3
		},
		{
			id: 4,
			artifact_id: 1,
			evaluation_index: 4,
			student_index: 4
		},
		{
			id: 5,
			artifact_id: 1,
			evaluation_index: 5,
			student_index: 5
		},
		/* ARTIFACT 2 */
		{
			id: 6,
			artifact_id: 2,
			evaluation_index: 1,
			student_index: 1
		},
		{
			id: 7,
			artifact_id: 2,
			evaluation_index: 2,
			student_index: 2
		},
		{
			id: 8,
			artifact_id: 2,
			evaluation_index: 3,
			student_index: 3
		},
		{
			id: 9,
			artifact_id: 2,
			evaluation_index: 4,
			student_index: 4
		},
		{
			id: 10,
			artifact_id: 2,
			evaluation_index: 5,
			student_index: 5
		},
		/* ARTIFACT 3 */
		{
			id: 11,
			artifact_id: 3,
			evaluation_index: 1,
			student_index: 1
		},
		{
			id: 12,
			artifact_id: 3,
			evaluation_index: 2,
			student_index: 2
		},
		{
			id: 13,
			artifact_id: 3,
			evaluation_index: 3,
			student_index: 3
		},
		{
			id: 14,
			artifact_id: 3,
			evaluation_index: 4,
			student_index: 4
		},
		{
			id: 15,
			artifact_id: 3,
			evaluation_index: 5,
			student_index: 5
		},
		// Course 2
		/* ARTIFACT 1 */
		{
			id: 16,
			artifact_id: 4,
			evaluation_index: 1,
			student_index: 1
		},
		{
			id: 17,
			artifact_id: 4,
			evaluation_index: 2,
			student_index: 2
		},
		{
			id: 18,
			artifact_id: 4,
			evaluation_index: 3,
			student_index: 3
		},
		/* ARTIFACT 2 */
		{
			id: 21,
			artifact_id: 5,
			evaluation_index: 1,
			student_index: 1
		},
		{
			id: 22,
			artifact_id: 5,
			evaluation_index: 2,
			student_index: 2
		},
		{
			id: 23,
			artifact_id: 5,
			evaluation_index: 3,
			student_index: 3
		},
		// Course 3
		/* ARTIFACT 1 */
		{
			id: 24,
			artifact_id: 6,
			evaluation_index: 1,
			student_index: 1
		},
		{
			id: 25,
			artifact_id: 6,
			evaluation_index: 2,
			student_index: 2
		},
		/* ARTIFACT 2 */
		{
			id: 26,
			artifact_id: 7,
			evaluation_index: 1,
			student_index: 1
		},
		{
			id: 27,
			artifact_id: 7,
			evaluation_index: 2,
			student_index: 2
		},
		/* ARTIFACT 3 */
		{
			id: 28,
			artifact_id: 8,
			evaluation_index: 1,
			student_index: 1
		},
		{
			id: 29,
			artifact_id: 8,
			evaluation_index: 2,
			student_index: 2
		},
		/* ARTIFACT 4 */
		{
			id: 30,
			artifact_id: 9,
			evaluation_index: 1,
			student_index: 1
		},
		{
			id: 31,
			artifact_id: 9,
			evaluation_index: 2,
			student_index: 2
		}
	])

	await knex.raw('ALTER SEQUENCE course_id_seq RESTART WITH 2')
	await knex.raw('ALTER SEQUENCE portfolio_id_seq RESTART WITH 3')
	await knex.raw('ALTER SEQUENCE portfolio_slo_id_seq RESTART WITH 3')
	await knex.raw('ALTER SEQUENCE artifact_id_seq RESTART WITH 10')
	await knex.raw('ALTER SEQUENCE artifact_evaluation_id_seq RESTART WITH 32')
})())
