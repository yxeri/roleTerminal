import React from 'react';
import { useSelector } from 'react-redux';
import { string } from 'prop-types';

import { getMessageIdsByRoom } from '../../../../redux/selectors/messages';
import List from '../../../common/lists/List/List';
import MessageItem from './Item/MessageItem';

import './MessageList.scss';

const MessageList = ({ roomId, messageId }) => {
  const messageIds = useSelector((state) => getMessageIdsByRoom(state, { roomId }));

  const messageMapper = () => messageIds.map((id, index, array) => (
    <MessageItem
      selected={messageId && messageId === id}
      key={id}
      previousMessageId={array[index - 1]}
      messageId={id}
    />
  ));

  return (
    <List
      observe="lower"
      key="messageList"
      scrollTo={{
        buffer: true,
        direction: 'bottom',
        skipFirstRender: typeof messageId === 'string',
      }}
      classNames={['MessageList']}
    >
      {messageMapper()}
    </List>
  );
};

export default React.memo(MessageList);

MessageList.propTypes = {
  roomId: string,
  messageId: string,
};

MessageList.defaultProps = {
  roomId: undefined,
  messageId: undefined,
};
