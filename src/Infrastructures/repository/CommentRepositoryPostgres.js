const InvariantError = require('../../Commons/exceptions/InvariantError');
const AddedComment = require('../../Domains/comments/entities/AddedComment');
const CommentRepository = require('../../Domains/comments/CommentRepository');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addComment(addComment) {
    const { content, owner, thread_id } = addComment;
    const id = `comment-${this._idGenerator()}`;
    const date = new Date().toISOString();

    const query = {
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4, $5) RETURNING id, content, date, owner, thread_id',
      values: [id, content, date, owner, thread_id],
    };

    const result = await this._pool.query(query);

    return new AddedComment({ ...result.rows[0] });
  }

  async softDeleteComment(id) {
    const query = {
      text: 'UPDATE comments SET is_delete = true WHERE id = $1',
      values: [id],
    };

    await this._pool.query(query);
  }

  async verifyCommentAvailable(id) {
    const query = {
      text: 'SELECT id FROM comments WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('comment tidak ditemukan');
    }
  }

  async verifyCommentOwner(id, owner) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1 AND owner = $2',
      values: [id, owner],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new AuthorizationError('user tidak memiliki akses untuk komentar ini');
    }
  }

  async getCommentByThreadId(threadId) {
    const query = {
      text: `SELECT
              comments.id AS id,
              users.username AS username,
              comments.date AS date,
              comments.content AS content,
              comments.is_delete AS is_delete
            FROM comments 
            LEFT JOIN users 
            ON comments.owner = users.id
            WHERE comments.thread_id = $1
            ORDER BY comments.date ASC`,
      values: [threadId],
    };

    const comments = await this._pool.query(query);
    return comments.rows;
  }
}

module.exports = CommentRepositoryPostgres;
