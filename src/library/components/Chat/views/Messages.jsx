import React from 'react';
import { useSelector } from 'react-redux';
import { string } from 'prop-types';
import { AccessLevels } from '../../../AccessCentral';
import InputArea from '../sub-components/InputArea/InputArea';
import MessagesList from '../lists/MessageList/MessageList';
import { getCurrentAccessLevel } from '../../../redux/selectors/users';

export default function Messages({ roomId }) {
  const accessLevel = useSelector(getCurrentAccessLevel);
  const content = [
    <MessagesList key="messagesList" roomId={roomId} />,
  ];

  if (accessLevel >= AccessLevels.STANDARD) {
    content.push(
      <InputArea
        key="inputArea"
        onSubmit={async ({ text }) => {

        }}
      />,
    );
  }

  return (
    <div className="messages">
      {content}
    </div>
  );
}

Messages.propTypes = {
  roomId: string,
};

Messages.defaultProps = {
  roomId: undefined,
};
