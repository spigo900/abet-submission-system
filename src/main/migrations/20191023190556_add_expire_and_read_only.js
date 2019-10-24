
exports.up = function(knex) {
	return Promise.all([
		knex.schema.table('portfolio', function(table) {
			table.datetime('expireDate')
			table.boolean('readOnly')		
		})
	]);
};

exports.down = function(knex) {
  	return Promise.all([
		knex.schema.table('portfolio', function(table) {
			table.dropColumn('expireDate')
			table.dropColumn('readOnly')
		})
	]);
};
