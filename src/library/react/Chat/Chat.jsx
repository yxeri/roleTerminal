import React from 'react';

import Rooms from './views/Rooms';
import Messages from './views/Messages';
import Window from '../common/Window';

const Chat = () => {
  return (
    <Window>
      <Rooms />
      <Messages />
    </Window>
  );
};

export default Chat;
