const AddComment = require('../AddComment');

describe('NewComments entities', () => {
  it('should throw error when payload not contain needed property', () => {
    // Arrange
    const payload = {
      content: 'sebuah comment',
    };

    // Action & Assert
    expect(() => new AddComment(payload)).toThrowError('ADD_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload not meet data type specification', () => {
    // Arrange
    const payload = {
      content: 123,
      owner: 123,
    };

    // Action & Assert
    expect(() => new AddComment(payload)).toThrowError('ADD_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create entities correctly', () => {
    // Arrange
    const payload = {
      content: 'sebuah comment',
      owner: 'user-123',
    };

    // Action
    const addComment = new AddComment(payload);

    // Assert
    expect(addComment).toBeInstanceOf(AddComment);
    expect(addComment.content).toEqual(payload.content);
    expect(addComment.owner).toEqual(payload.owner);
  });
});
