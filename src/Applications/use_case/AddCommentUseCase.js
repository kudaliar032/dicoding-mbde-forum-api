const AddComment = require('../../Domains/comments/entities/AddComment');
const NewComment = require('../../Domains/comments/entities/NewComment');

class AddCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload, owner, threadId) {
    await this._threadRepository.verifyThreadAvailable(threadId);
    const newComment = new NewComment(useCasePayload);
    const addComment = new AddComment({
      content: newComment.content,
      owner,
      thread_id: threadId,
    });
    return this._commentRepository.addComment(addComment);
  }
}

module.exports = AddCommentUseCase;
