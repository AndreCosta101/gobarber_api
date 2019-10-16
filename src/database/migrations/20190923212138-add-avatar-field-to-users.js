module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      'users', // qual tabela?
      'avatar_id', // qual o nome da coluna?
      {
        type: Sequelize.INTEGER,
        references: { model: 'files', key: 'id' }, // definindo a foreign key ->
        // estou dizendo que toda coluna avatar_id da tabela users, vai ser uma key da tabela files
        onUpdate: 'CASCADE', // se alterar na files, altera na users
        onDelete: 'SET NULL',
        allowNull: true,
      }
    );
  },

  down: queryInterface => {
    return queryInterface.removeColumn('users', 'avatar_id');
  },
};

//  agora roda yarn sequelize db:migrate
// depois associa o model de User ao model de File. Procura lá : "static associate...
