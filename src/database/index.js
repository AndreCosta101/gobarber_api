// esse arquivo conecta o banco de dados e carrega os models
import Sequelize from 'sequelize'; // conecta com o banco
import mongoose from 'mongoose';

import User from '../app/models/User';
import File from '../app/models/File';
import Appointment from '../app/models/Appointment';

import databaseConfig from '../config/database';

const models = [User, File, Appointment];

class Database {
  constructor() {
    this.init();
    this.mongo();
  }

  // conecta com o banco e carrega os models
  init() {
    this.connection = new Sequelize(databaseConfig);

    models
      .map(model => model.init(this.connection))
      .map(model => model.associate && model.associate(this.connection.models));
  }

  mongo() {
    this.mongoConnection = mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useFindAndModify: true, // na futura versão vai ser descontinuado. Troque process.env.MONGO_URL por 'mongodb://localhost:27017/gobarber',
      useUnifiedTopology: true,
    }); // para testar, olha o servidor. Tá rodando?
  }
}

export default new Database();
