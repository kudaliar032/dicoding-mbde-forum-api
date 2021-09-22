const AddThread = require('../../Domains/threads/entities/AddThread');
const NewThread = require('../../Domains/threads/entities/NewThread');

class AddThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload, owner) {
    const newThread = new NewThread(useCasePayload);
    const addThread = new AddThread({
      title: newThread.title,
      body: newThread.body,
      owner,
    });
    return this._threadRepository.addThread(addThread);
  }
}

module.exports = AddThreadUseCase;
