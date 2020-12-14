import React from 'react';
import { useSelector } from 'react-redux';
import { func, string } from 'prop-types';
import { AccessLevels } from '../../../../AccessCentral';
import InputArea from '../../sub-components/InputArea/InputArea';
import MessagesList from '../../lists/Message/MessageList';
import { getCurrentAccessLevel } from '../../../../redux/selectors/users';
import { sendMessage } from '../../../../socket/actions/messages';

import './Messages.scss';

const Messages = ({ roomId, onDialog }) => {
  const accessLevel = useSelector(getCurrentAccessLevel);

  return (
    <div className="Messages">
      <MessagesList
        key="messagesList"
        roomId={roomId}
        onDialog={onDialog}
      />
      {accessLevel >= AccessLevels.STANDARD && (
        <InputArea
          key="inputArea"
          onSubmit={
            async ({ text, image }) => sendMessage({
              text,
              roomId,
              image,
            })
          }
        />
      )}
    </div>
  );
};

export default React.memo(Messages);

Messages.propTypes = {
  roomId: string,
  onDialog: func.isRequired,
};

Messages.defaultProps = {
  roomId: undefined,
};
