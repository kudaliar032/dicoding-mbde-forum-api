const NewComment = require('../NewComment');

describe('NewComments entities', () => {
  it('should throw error when payload not contain needed property', () => {
    // Arrange
    const payload = {};

    // Action & Assert
    expect(() => new NewComment(payload)).toThrowError('NEW_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload not meet data type specification', () => {
    // Arrange
    const payload = {
      content: true,
    };

    // Action & Assert
    expect(() => new NewComment(payload)).toThrowError('NEW_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create entities correctly', () => {
    // Arrange
    const payload = {
      content: 'sebuah comment',
    };

    // Action
    const newComment = new NewComment(payload);

    // Assert
    expect(newComment).toBeInstanceOf(NewComment);
    expect(newComment.content).toEqual(payload.content);
  });
});
