import Sequelize, { Model } from 'sequelize';
import bcrypt from 'bcryptjs';

class User extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        email: Sequelize.STRING,
        password: Sequelize.VIRTUAL,
        password_hash: Sequelize.STRING,
        provider: Sequelize.BOOLEAN,
      },
      {
        sequelize,
      }
    );

    //
    this.addHook('beforeSave', async user => {
      if (user.password) {
        user.password_hash = await bcrypt.hash(user.password, 8);
      }
    });

    return this;
  }

  static associate(models) {
    // ele associa o User com o File.js
    this.belongsTo(models.File, { foreignKey: 'avatar_id', as: 'avatar' });
  } // agora chama esse método lá em src>> database>>index.js

  // criando outro método para verificar a senha para o SessionController
  checkPassword(password) {
    return bcrypt.compare(password, this.password_hash);
  }
}

export default User;
