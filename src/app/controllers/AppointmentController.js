import * as Yup from 'yup';
import { startOfHour, parseISO, isBefore, format, subHours } from 'date-fns';
import pt from 'date-fns/locale/pt'; // para o mês da notificacao ficar em pt 'junho' por exemplo

import File from '../models/File';
import User from '../models/User';
import Appointment from '../models/Appointment';
import Notification from '../schemas/Notification';

import CancellationMail from '../jobs/CancellationMail';
import Queue from '../../lib/Queue';

class AppointmentController {
  // LISTAR OS AGENDAMENTOS DO USUÁRIO LOGADO aula Listando agendamentos do usuário
  async index(req, res) {
    // adicionando paginação
    const { page = 1 } = req.query;

    const appointments = await Appointment.findAll({
      where: { user_id: req.userId, canceled_at: null },
      order: ['date'],
      limit: 20, // paginação de 20 em 20
      offset: (page - 1) * 20, // quantos usuários eu quero pular por página?
      attributes: ['id', 'date', 'past', 'cancelable'], // past e cancelable são parâmetros criados no model de appointments para representar os que já passaram. Aula campos virtuais de agendamento.
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['id', 'name'],
          include: [
            {
              model: File,
              as: 'avatar',
              attributes: ['id', 'path', 'url'],
            },
          ],
        },
      ],
    });

    return res.json(appointments);
  }

  // CRIAR O AGENDAMENTO
  async store(req, res) {
    const schema = Yup.object().shape({
      provider_id: Yup.number().required(),
      date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res
        .status(400)
        .json({ error: ' Erro de schema AppointmentController linha 12 ' });
    }

    const { provider_id, date } = req.body;

    // checar se o provider_id é um provider mesmo

    const isProvider = await User.findOne({
      where: { id: provider_id, provider: true },
    });

    if (!isProvider) {
      return res.status(400).json({
        error: ' O cara não é provider -> Appointment controller linha 29 ',
      });
    }

    // Verificar se a data do agendamento é uma data futura

    const hourStart = startOfHour(parseISO(date)); // parseIso transforma na data de sistema.
    // startOfHour transforma 19:30 em 19:00

    if (isBefore(hourStart, new Date())) {
      return res
        .status(400)
        .json({ error: ' A data já passou Appointment Controller linha 41 ' });
    }

    // Verificar se o provider já está com o horário ocupado

    const checkAvailability = await Appointment.findOne({
      where: {
        provider_id,
        canceled_at: null,
        date: hourStart,
      },
    });

    if (checkAvailability) {
      return res.status(400).json({
        error:
          ' Já tem agendamento nesse horário AppointmenteController linha 57 ',
      });
    }

    // criar o appointment de fato:

    const appointment = await Appointment.create({
      user_id: req.userId,
      provider_id,
      date,
    });

    // criando a notificação depois de ter criado o app>>schemas

    const user = await User.findByPk(req.userId); // aí pega user.name pq no model de users, tem o campo name
    const formattedDate = format(
      hourStart,
      "'dia' dd 'de' MMMM', às' H:mm'h'",
      { locale: pt }
    )

    await Notification.create({
      content: `Novo agendamento de ${user.name} para ${formattedDate} `,
      user: provider_id,
    })
    return res.json(appointment);
  }

  async delete(req,res) {
    // o include é para pegar o email aula Configurando Nodemailer e configurando templates de email
    const appointment = await Appointment.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['name', 'email']
        },
        {
          model: User,
          as: 'user',
          attributes: ['name']
        }
      ]
    });


    // Você só pode cancelar seus próprios agendamentos
    if (appointment.user_id !== req.userId) {
      return res.status(401).json( {
        error: ' id do appointment é diferente do logado -> Appointment controller 123'
      } );
    }
    // verificar se estamos à menos de 2 horas do agendamento
    //  o método subHours subtrai horas de uma data e não precisa do parseISO pq já vê o horário de maquina
    const dateWithSub = subHours(appointment.date, 2)

    if (isBefore(dateWithSub, new Date())) {
      return res
      .status(401)
      .json( {
        error: ' Erro: só pode cancelar com limite de 2 horas -> Appointment Controller 132'
      } );
    }

    appointment.canceled_at = new Date();

    await appointment.save();

    // o código que envia email foi retirado daqui e colocado em jobs >> CancellationMail
    // queue está em Queue.js
    await Queue.add(CancellationMail.key, {
      appointment
    })

    return res.json(appointment);
  }
}

export default new AppointmentController();
