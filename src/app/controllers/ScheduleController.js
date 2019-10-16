import { startOfDay, endOfDay, parseISO } from 'date-fns';
import { Op } from 'sequelize';

import Appointment from '../models/Appointment';
import User from '../models/User';
// import { Sequelize } from 'sequelize/types';

class SchedulleController {
  // LISTANDO OS AGENDAMENTOS DOS PROVIDERS
  async index(req, res) {
    // check: o usuário logado é um provider ?
    const checkUserProvider = await User.findOne({
      where: { id: req.userId, provider: true },
    });

    if (!checkUserProvider) {
      return res
        .status(401)
        .json({ error: ' O usuário logado não é provider ' });
    }

    // listando os agendamentos para o dia -> em Query no insomnia

    const { date } = req.query;
    const parsedDate = parseISO(date);

    const appointments = await Appointment.findAll({
      where: {
        provider_id: req.userId,
        canceled_at: null,
        date: {
          // aqui vamos fazer uma operação between para verificar entre 00:00 e 23:59
          [Op.between]: [startOfDay(parsedDate), endOfDay(parsedDate)],
        },
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['name'],
        },
      ],
      order: ['date'],
    });

    return res.json({ appointments });
  }
}

export default new SchedulleController();
