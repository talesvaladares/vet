type ErrorParams = {
  cause?: string;
  message?: string;
  action?: string;
  statusCode?: number;
  error?: string;
};

class ErrorBase extends Error {
  public action: string;
  public statusCode: number;
}

export class InternalServerError extends ErrorBase {
  constructor({ cause, statusCode }: ErrorParams) {
    super('Um erro interno não esperado aconteceu.', {
      cause,
    });
    this.name = 'InternalServerError';
    this.action = 'Entre em contato com o suporte';
    this.statusCode = statusCode || 500;
  }

  //método usado para retornar a mensagem do erro
  //por padrão as propriedades de erro não são listadas
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    };
  }
}

export class ServiceError extends ErrorBase {
  constructor({ cause, message }: ErrorParams) {
    super(message || 'Serviço indisponível no momento.', {
      cause,
    });
    this.name = 'ServiceError';
    this.action = 'Verifique se o serviço está disponível.';
    this.statusCode = 503; //serviço indisponivel
  }

  //método usado para retornar a mensagem do erro
  //por padrão as propriedades de erro não são listadas
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    };
  }
}

export class ValidationError extends ErrorBase {
  constructor({ cause, message, action }: ErrorParams) {
    super(message || 'Um erro de validação ocorreu.', {
      cause,
    });
    this.name = 'ValidationError';
    this.action = action || 'Ajuste os dados enviados e tente novamente';
    this.statusCode = 400; //serviço indisponivel
  }

  //método usado para retornar a mensagem do erro
  //por padrão as propriedades de erro não são listadas
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    };
  }
}

export class NotFoundError extends ErrorBase {
  constructor({ cause, message, action }: ErrorParams) {
    super(message || 'Não foi possivel encontrar este recurso no sistema.', {
      cause,
    });
    this.name = 'NotFoundError';
    this.action = action || 'Verifique se os parametros enviados na consulta estão certos.';
    this.statusCode = 404; //não encontrado
  }

  //método usado para retornar a mensagem do erro
  //por padrão as propriedades de erro não são listadas
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    };
  }
}

export class MethodNotAllowedError extends ErrorBase {
  constructor() {
    super('Método não permitido para este endpoint.');
    this.name = 'MethodNotAllowedError';
    this.action = 'Verifique se o método HTTP é válido para este endpoint.';
    this.statusCode = 405;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    };
  }
}
