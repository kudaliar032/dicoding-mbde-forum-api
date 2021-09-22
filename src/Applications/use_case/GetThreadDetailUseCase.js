class GetThreadDetailUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(threadId) {
    const [
      thread,
      comments,
    ] = await Promise.all([
      this._threadRepository.getThreadById(threadId),
      this._commentRepository.getCommentByThreadId(threadId),
    ]);
    return {
      thread: {
        ...thread,
        comments: comments.map(({
          id, username, date, content, is_delete,
        }) => ({
          id,
          username,
          date,
          content: is_delete ? '**komentar telah dihapus**' : content,
        })),
      },
    };
  }
}

module.exports = GetThreadDetailUseCase;
