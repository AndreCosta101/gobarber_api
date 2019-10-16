import { format, parseISO } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Mail from '../../lib/Mail';


class CancellationMail {
  get key() {
    return 'CancellationMail' // para cada job, precisa criar uma chave única
  }

  async handle({data}) { // vai ser uma fila e esse método handle vai ser chamado em cada posição da fila
    const { appointment } = data;

    console.log('A fila executou');

     await Mail.sendMail({
      to: `${appointment.provider.name} <${appointment.provider.email}>`,
      subject: 'Agendamento cancelado',
      template: 'cancellation',
      context: {
        provider: appointment.provider.name,
        user: appointment.user.name,
        date: format(
          parseISO(appointment.date),
          "'dia' dd 'de' MMMM', às' H:mm'h'",
          { locale: pt }
    )
      }
    })
  }


}

export default new CancellationMail();

// Se o usuário importar CancellationMail from '..'

//  ele consegue acessar "CancellationMail.key se colocar o get "
