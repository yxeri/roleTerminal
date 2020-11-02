import React from 'react';
import { useSelector } from 'react-redux';
import { string } from 'prop-types';
import { AccessLevels } from '../../../AccessCentral';
import InputArea from '../sub-components/InputArea';
import MessagesList from '../lists/MessageList';
import { getCurrentAccessLevel } from '../../../redux/selectors/users';

export default function Messages({ roomId }) {
  const accessLevel = useSelector(getCurrentAccessLevel);
  const content = [
    <MessagesList roomId={roomId} />,
  ];

  if (accessLevel >= AccessLevels.STANDARD) {
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
}

Messages.propTypes = {
  roomId: string,
};

Messages.defaultProps = {
  roomId: undefined,
};
