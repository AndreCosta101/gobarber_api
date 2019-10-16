import jwt from 'jsonwebtoken';
import * as Yup from 'yup';

import User from '../models/User';
import File from '../models/File';
import authConfig from '../../config/auth';

class SessionController {
  async store(req, res) {
    const schema = Yup.object().shape({
      email: Yup.string()
        .email()
        .required(),
      password: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res
        .status(400)
        .json({ error: 'Validação do schema falhou sessioncontroller 16' });
    }

    const { email, password } = req.body;

    const user = await User.findOne({
      where: { email },
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['id', 'path', 'url'],
        },
      ],
    });

    // achou o email ?

    if (!user) {
      return res.status(401).json({ error: 'Email not found.' });
    }

    // verificação da senha. Melhor fazer no model User, com o bcrypt
    if (!(await user.checkPassword(password))) {
      return res.status(401).json({ error: 'Password does not match' });
    }
    //
    // agora, vamos  gerar o token e colocar o id do usuário no Payload
    const { id, name, avatar, provider } = user;

    return res.json({
      user: {
        id,
        name,
        email,
        provider,
        avatar,
      },
      // md5online como 2º parametro, gobarber || expiração 3º parametro:
      token: jwt.sign({ id }, authConfig.secret, {
        expiresIn: authConfig.expiresIn,
      }),
      // agora precisa definir a rota que vai acessar o SessionController em routes.js
    });
  }
}

export default new SessionController();
