const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const AddThread = require('../../../Domains/threads/entities/AddThread');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');

describe('ThreadRepositoryPostgres', () => {
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
  });

  beforeAll(async () => {
    await UsersTableTestHelper.addUser({});
  });

  afterAll(async () => {
    await UsersTableTestHelper.cleanTable();
    await pool.end();
  });

  describe('verifyThreadAvailable function', () => {
    it('should throw NotFoundError when thread not available', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadRepositoryPostgres.verifyThreadAvailable('thread-123')).rejects.toThrowError(NotFoundError);
    });

    it('should not throw NotFoundError when thread available', async () => {
      // Arrange
      await ThreadsTableTestHelper.addThread({}); // thread baru
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadRepositoryPostgres.verifyThreadAvailable('thread-123')).resolves.not.toThrowError(NotFoundError);
    });
  });

  describe('addThread function', () => {
    it('should persist new thread', async () => {
      // Arrange
      const addThread = new AddThread({
        title: 'sebuah thread',
        body: 'isi sebuah thread',
        owner: 'user-123',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await threadRepositoryPostgres.addThread(addThread);

      // Assert
      const threads = await ThreadsTableTestHelper.findThreadById('thread-123');
      expect(threads).toHaveLength(1);
    });

    it('should return added thread correctly', async () => {
      // Arrange
      const addThread = new AddThread({
        title: 'sebuah thread',
        body: 'isi sebuah thread',
        owner: 'user-123',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedThread = await threadRepositoryPostgres.addThread(addThread);

      // Assert
      expect(addedThread).toStrictEqual(new AddedThread({
        id: 'thread-123',
        title: 'sebuah thread',
        owner: 'user-123',
      }));
    });
  });

  describe('getThreadById function', () => {
    it('should return detail of thread', async () => {
      // Arrange
      await ThreadsTableTestHelper.addThread({});
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action and Assert
      const thread = await threadRepositoryPostgres.getThreadById('thread-123');
      expect(thread.id).toStrictEqual('thread-123');
      expect(thread.title).toStrictEqual('sebuah thread');
      expect(thread.body).toStrictEqual('isi sebuah thread');
      expect(thread.username).toStrictEqual('dicoding');
    });
  });
});
