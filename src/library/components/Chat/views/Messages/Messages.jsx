import React from 'react';
import { useSelector } from 'react-redux';
import { string } from 'prop-types';
import { AccessLevels } from '../../../../AccessCentral';
import InputArea from '../../sub-components/InputArea/InputArea';
import MessagesList from '../../lists/MessageList/MessageList';
import { getCurrentAccessLevel } from '../../../../redux/selectors/users';
import { sendMessage } from '../../../../socket/actions/messages';

import './Messages.scss';

const Messages = ({ roomId }) => {
  const accessLevel = useSelector(getCurrentAccessLevel);
  const content = [
    <MessagesList key="messagesList" roomId={roomId} />,
  ];

  if (accessLevel >= AccessLevels.STANDARD) {
    content.push(
      <InputArea
        key="inputArea"
        onSubmit={
          async ({ text, image }) => sendMessage({
            text,
            roomId,
            image,
          })
        }
      />,
    );
  }

  return (
    <div className="Messages">
      {content}
    </div>
  );
};

export default React.memo(Messages);

Messages.propTypes = {
  roomId: string,
};

Messages.defaultProps = {
  roomId: undefined,
};
