export class ForbiddenError extends Error {
  constructor(message: string = "Acesso negado") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export class UnauthorizedError extends Error {
  constructor(message: string = "Não autorizado") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class NotFoundError extends Error {
  constructor(message: string = "Não encontrado") {
    super(message);
    this.name = "NotFoundError";
  }
}

export class BadRequestError extends Error {
  constructor(message: string = "Requisição inválida") {
    super(message);
    this.name = "BadRequestError";
  }
}


