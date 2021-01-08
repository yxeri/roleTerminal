import React from 'react';
import { useSelector } from 'react-redux';
import { func, string } from 'prop-types';
import { AccessLevels } from '../../../../AccessCentral';
import InputArea from '../../sub-components/InputArea/InputArea';
import MessagesList from '../../lists/Message/MessageList';
import { getCurrentAccessLevel } from '../../../../redux/selectors/users';

import './Messages.scss';

const Messages = ({ roomId, onSend, messageId }) => {
  const accessLevel = useSelector(getCurrentAccessLevel);

  return (
    <div className="Messages">
      <div className="spacer" />
      <MessagesList
        key="messagesList"
        roomId={roomId}
        messageId={messageId}
      />
      {accessLevel >= AccessLevels.STANDARD && (
        <InputArea
          onSend={onSend}
          roomId={roomId}
          key="inputArea"
        />
      )}
    </div>
  );
};

export default React.memo(Messages);

Messages.propTypes = {
  roomId: string,
  onSend: func.isRequired,
  messageId: string,
};

Messages.defaultProps = {
  roomId: undefined,
  messageId: undefined,
};
