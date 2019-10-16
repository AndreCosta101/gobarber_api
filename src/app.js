import 'dotenv/config';

// carrega as variaveis ambientes do dotenv numa variavel global process.env
// e aí acessa por exemplo. process.env.DB_HOST

import express from 'express';
import path from 'path';
import cors from 'cors';
import Youch from 'youch';
import * as Sentry from '@sentry/node';
import 'express-async-errors'; // (precisa ser antes das rotas) extensão que possibilita ao sentry enxergar erros dentro do método async. Adicionado yarn add express-async-errors

// import cors from 'cors';
import routes from './routes';
import sentryConfig from './config/sentry';

import './database';

class App {
  constructor() {
    this.server = express();

    Sentry.init(sentryConfig);

    this.middlewares();
    this.routes();
    this.exceptionHandler(); // middleware de tratamento de exceções
  }

  middlewares() {
    this.server.use(Sentry.Handlers.requestHandler());
    this.server.use(cors());
    this.server.use(express.json());
    this.server.use(
      '/files',
      express.static(path.resolve(__dirname, '..', 'tmp', 'uploads'))
    );
  }

  routes() {
    this.server.use(routes);
    this.server.use(Sentry.Handlers.errorHandler());
  }

  exceptionHandler() {
    this.server.use(async (err, req, res, next) => {
      // O express entende automaticamente que quando um middleware recebe 4 parametros ele é um tratamento de exceção
      // yarn add youch esse cara faz uma tratativa das mensagens de erro em desenvolvimento
      if (process.env.NODE_ENV === 'development') {
        const errors = await new Youch(err, req).toJSON();

        return res.status(500).json({ errors });
      }
      return res.status(500).json({ error: ' Internal Server Error' });
    });
  }
}

export default new App().server;
