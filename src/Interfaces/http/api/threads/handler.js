const AddThreadUseCase = require('../../../../Applications/use_case/AddThreadUseCase');
const GetThreadDetailUseCase = require('../../../../Applications/use_case/GetThreadDetailUseCase');

class ThreadsHandler {
  constructor(container) {
    this._container = container;

    this.postThreadHandler = this.postThreadHandler.bind(this);
    this.getThreadByIdHandler = this.getThreadByIdHandler.bind(this);
  }

  async postThreadHandler(request, h) {
    const addThreadUseCase = this._container.getInstance(AddThreadUseCase.name);
    const addedThread = await addThreadUseCase.execute(
      request.payload,
      request.auth.credentials.id,
    );

    const response = h.response({
      status: 'success',
      data: {
        addedThread,
      },
    });
    response.code(201);
    return response;
  }

  async getThreadByIdHandler(request, h) {
    const getThreadDetailUseCase = this._container.getInstance(GetThreadDetailUseCase.name);
    const data = await getThreadDetailUseCase.execute(request.params.threadId);
    return {
      status: 'success',
      data,
    };
  }
}

module.exports = ThreadsHandler;
