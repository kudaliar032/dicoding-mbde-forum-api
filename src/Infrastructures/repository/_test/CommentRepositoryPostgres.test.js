const InvariantError = require('../../../Commons/exceptions/InvariantError');
const pool = require('../../database/postgres/pool');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const AddComment = require('../../../Domains/comments/entities/AddComment');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

describe('CommentRepositoryPostgres', () => {
  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
  });

  beforeAll(async () => {
    await UsersTableTestHelper.addUser({});
    await ThreadsTableTestHelper.addThread({});
  });

  afterAll(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await pool.end();
  });

  describe('addComment function', () => {
    it('should persist new comment', async () => {
      // Arrange
      const addComment = new AddComment({
        content: 'sebuah comment',
        owner: 'user-123',
        thread_id: 'thread-123',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await commentRepositoryPostgres.addComment(addComment);

      // Assert
      const comments = await CommentsTableTestHelper.findCommentById('comment-123');
      expect(comments).toHaveLength(1);
    });

    it('should return added comment correctly', async () => {
      // Arrange
      const addComment = new AddComment({
        content: 'sebuah comment',
        owner: 'user-123',
        thread_id: 'thread-123',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedComment = await commentRepositoryPostgres.addComment(addComment);

      // Assert
      expect(addedComment).toStrictEqual(new AddedComment({
        id: 'comment-123',
        content: 'sebuah comment',
        owner: 'user-123',
      }));
    });
  });

  describe('softDeleteComment function', () => {
    it('should soft delete comment from database', async () => {
      // Arrange
      const commentRepository = new CommentRepositoryPostgres(pool);
      await CommentsTableTestHelper.addComment({});

      // Action
      await commentRepository.softDeleteComment('comment-123');

      // Assert
      const comments = await CommentsTableTestHelper.findCommentById('comment-123');
      expect(comments[0].is_delete).toEqual(true);
    });
  });

  describe('verifyCommentAvailable function', () => {
    it('should throw NotFoundError when comment not available', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyCommentAvailable('comment-123')).rejects.toThrowError(NotFoundError);
    });

    it('should not throw NotFoundError when comment available', async () => {
      // Arrange
      await CommentsTableTestHelper.addComment({}); // comment baru
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyCommentAvailable('comment-123')).resolves.not.toThrowError(NotFoundError);
    });
  });

  describe('verifyCommentOwner function', () => {
    it('should throw AuthorizationError when comment not found', async () => {
      // Arrange
      await CommentsTableTestHelper.addComment({ id: 'comment-123', owner: 'user-123' });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyCommentOwner('comment-123', 'user-1234')).rejects.toThrowError(AuthorizationError);
    });

    it('should not throw AuthorizationError when comment found', async () => {
      // Arrange
      await CommentsTableTestHelper.addComment({ id: 'comment-123', owner: 'user-123' });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyCommentOwner('comment-123', 'user-123')).resolves.not.toThrowError(AuthorizationError);
    });
  });

  describe('getCommentByThreadId function', () => {
    it('should return all comments from thread', async () => {
      // Arrange
      await CommentsTableTestHelper.addComment({ id: 'comment-111' });
      await CommentsTableTestHelper.addComment({ id: 'comment-222', is_delete: true });
      await CommentsTableTestHelper.addComment({ id: 'comment-333' });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      const comments = await commentRepositoryPostgres.getCommentByThreadId('thread-123');
      expect(comments).toHaveLength(3);
    });
  });
});
