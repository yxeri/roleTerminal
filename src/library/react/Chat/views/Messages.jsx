import React from 'react';

import accessCentral from '../../../AccessCentral';

import InputArea from '../sub-components/InputArea';
import MessagesList from '../lists/MessagesList';

const Messages = () => {
  const content = [
    <MessagesList />
  ];

  if (accessCentral.getAccessLevel() >= accessCentral.AccessLevels.STANDARD) {
    content.push(
      <InputArea
        triggerCallback={({ text }) => {

        }}
      />,
      );
  }

  return (
    <div className="messages">
      {content}
    </div>
  );
};

export default Messages;
