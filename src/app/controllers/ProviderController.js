import User from '../models/User';
import File from '../models/File';

class ProviderController {
  async index(req, res) {
    const providers = await User.findAll({
      // assim ele pega todos os usuários
      where: { provider: true }, // assim ele pega apenas os que são providers
      attributes: ['id', 'email', 'email', 'avatar_id'], // aqui ele seleciona o que vai retornar
      include: [
        // aula "Listagem de Prestadores de Serviço"
        {
          model: File,
          as: 'avatar',
          attributes: ['name', 'path', 'url'],
        },
      ],
    });

    return res.json(providers);
  }
}

export default new ProviderController();
