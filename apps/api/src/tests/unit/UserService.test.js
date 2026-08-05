import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserService } from '../../services/UserService.js';
import { UserRepository } from '../../repositories/UserRepository.js';
import { NotFoundError } from '../../errors/AppError.js';

vi.mock('../../repositories/UserRepository.js');

describe('UserService Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getUserProfile should return user if found', async () => {
    const mockUser = { id: 'uuid-123', name: 'John Doe' };
    UserRepository.findById.mockResolvedValue(mockUser);

    const result = await UserService.getUserProfile('uuid-123');
    expect(result).toEqual(mockUser);
    expect(UserRepository.findById).toHaveBeenCalledWith('uuid-123');
  });

  it('getUserProfile should throw NotFoundError if user missing', async () => {
    UserRepository.findById.mockResolvedValue(null);

    await expect(UserService.getUserProfile('uuid-invalid'))
      .rejects.toThrow(NotFoundError);
  });

  it('updateUserProfile should return updated user', async () => {
    const updateData = { name: 'Jane Doe' };
    const mockUser = { id: 'uuid-123', name: 'Jane Doe' };
    UserRepository.update.mockResolvedValue(mockUser);

    const result = await UserService.updateUserProfile('uuid-123', updateData);
    expect(result).toEqual(mockUser);
    expect(UserRepository.update).toHaveBeenCalledWith('uuid-123', updateData);
  });
});
