
exports.up = function(knex) {
	return Promise.all([
		knex.schema.table('portfolio', function(table) {
			table.renameColumn('expireDate', 'expire_date')
			table.renameColumn('readOnly', 'read_only')		
		})
	]);

};

exports.down = function(knex) {

	return Promise.all([
		knex.schema.table('portfolio', function(table) {
			table.renameColumn('expire_date', 'expireDate')
			table.renameColumn('read_only', 'readOnly')		
		})
	]);
};
