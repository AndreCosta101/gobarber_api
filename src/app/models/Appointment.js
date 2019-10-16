import Sequelize, { Model } from 'sequelize';
import { isBefore, subHours } from 'date-fns'; // subHours verifica se estamos a menos de 2 horas do agendamento

class Appointment extends Model {
  static init(sequelize) {
    super.init(
      {
        date: Sequelize.DATE,
        canceled_at: Sequelize.DATE,
        past: { // para saber se um agendamento já passou   aula Campos virtuais do agendamento
          type: Sequelize.VIRTUAL,
          get() {
            return isBefore(this.date, new Date());
          }
        },
        cancelable : {
          type: Sequelize.VIRTUAL,
          get() {
            return isBefore(new Date(), subHours(this.date, 2)); // eu estou antes da data, mesmo subtraindo 2 horas dela ?
          }
        }

      },
      {
        sequelize,
      }
    );

    return this;
  }

  static associate(models) {
    // está associado com o database >> index.js
    this.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    this.belongsTo(models.User, { foreignKey: 'provider_id', as: 'provider' });
  }
}

export default Appointment;

// agora tem que ir lá no database >> index.js e cadastrar Appointments lá nos array models
