import React, { useRef } from 'react';
import { useSelector } from 'react-redux';
import { string } from 'prop-types';

import { getMessageIdsByRoom } from '../../../../redux/selectors/messages';
import List from '../../../common/lists/List/List';
import MessageItem from './Item/MessageItem';

import './MessageList.scss';

const MessageList = ({ roomId, messageId }) => {
  const messageIds = useSelector((state) => getMessageIdsByRoom(state, { roomId }));
  const latestMessageId = useRef('');

  if (messageIds[messageIds.length - 1] !== latestMessageId) {
    latestMessageId.current = messageIds[messageIds.length - 1];
  }

  const items = messageIds.map((id, index, array) => (
    <MessageItem
      isLatest={id === latestMessageId.current}
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
      className="MessageList"
    >
      {items}
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
