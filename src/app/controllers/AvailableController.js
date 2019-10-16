//  controle que lista os horários disponíveis

import { startOfDay, endOfDay, setHours, setMinutes, setSeconds, format, isAfter } from 'date-fns';
import { Op } from 'sequelize';
import Appointment from '../models/Appointment';


class AvailableController {
  async index(req, res) {
    const {date} = req.query;

    if(!date) {
      return res.status(400).json( { error: ' Data inválida e  AvailableController linha 7 ' } );
    }

    const searchDate = Number(date) // estava em Unix time

    const appointments = await Appointment.findAll({
      where: {
        provider_id: req.params.providerId,
        canceled_at: null,
        date: {
          [Op.between]: [startOfDay(searchDate), endOfDay(searchDate)],
        }
      }
    })

    const schedule = [
      '08:00', // 2019-07-01 08:00:00  setHours setMinutes setSeconds
      '09:00',
      '10:00',
      '11:00',
      '12:00',
      '13:00',
      '14:00',
      '15:00',
      '16:00',
      '18:00',
      '19:00',
      '20:00',
      '21:00',
      '22:00',
    ];

    const available = schedule.map(time=>{ // time já passou? time já está ocupado?
      const [ hour, minute ] = time.split(':') // ele separa por : tudo que vier antes do : é hour e depois do : é minute
      const value = setSeconds(setMinutes(setHours(searchDate, hour), minute),0);

      return {
        time,
        value: format(value, "yyyy-MM-dd'T'HH:mm:ssxxx"),
        available:
          isAfter(value, new Date()) // o value isAfter agora( new Date()) ?
          &&
          !appointments.find(a => format(a.date, 'HH:mm')=== time), // time é cada um daqueles horários ali de cima

      };

    })

    return res.json(available);
  }
}

export default new AvailableController();

// ele entende o UnixTime Stamp
// para pegar o UnixTimeStamp é : Console do Chrome e new Date().getTime()
