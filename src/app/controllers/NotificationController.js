// aula Listando notificações do usuário
import User from '../models/User';
import Notification from '../schemas/Notification';

class NotificationController {
  // CRIA A NOTIFICAÇÃO
  async index(req, res){
    const checkIsProvider = await User.findOne({
      where: { id: req.userId, provider: true },
    });

    if (!checkIsProvider) {
      return res.status(400).json({
        error: ' O cara não é provider, só provider tem notificação -> NotificationController linha 12 ',
      });
    }

    const notifications = await Notification.find({
      user: req.userId,
    })
      .sort({createdAt : 'desc'})
      .limit(20)

    return res.json(notifications);
  }

  // MARCA A NOTIFICAÇÃO COMO LIDA
  async update(req, res){

    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new : true } // retorna a notificação de volta para o usuário
    )

    return res.json(notification);
  }
}

export default new NotificationController();
