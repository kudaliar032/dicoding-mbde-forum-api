const InvariantError = require('../../../Commons/exceptions/InvariantError');
const pool = require('../../database/postgres/pool');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const AddComment = require('../../../Domains/comments/entities/AddComment');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentTableHelper = require('../../../../tests/CommentsTableHelper');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');

describe('CommentRepositoryPostgres', () => {
  afterEach(async () => {
    await CommentTableHelper.cleanTable();
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
      });
      const fakeIdGenerator = () => '123'; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await commentRepositoryPostgres.addComment(addComment);

      // Assert
      const comments = await CommentTableHelper.findCommentById('comment-123');
      expect(comments).toHaveLength(1);
    });

    it('should return added comment correctly', async () => {
      // Arrange
      const addComment = new AddComment({
        content: 'sebuah comment',
        owner: 'user-123',
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
});
