
exports.up = function(knex) {
	return Promise.all([
		knex.schema.table('portfolio', function(table) {
		table.datetime('expireDate').notNull();
		table.integer('readOnly').notNull();
	})
	]);
};

exports.down = function(knex) {
  	return Promise.all([knex.schema.table('portfolio', function(table) {
		table.datetime('expireDate')
		table.dropColumn('readOnly')
	})
	]);
};
