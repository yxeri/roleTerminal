import storageManager from '../../StorageManager';

export const getRoomId = (state) => state.roomId || storageManager.getPublicRoomId();
