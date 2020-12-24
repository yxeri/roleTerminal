import React from 'react';
import { useSelector } from 'react-redux';
import { string } from 'prop-types';

import { getMessageIdsByRoom } from '../../../../redux/selectors/messages';
import List from '../../../common/lists/List/List';
import MessageItem from './Item/MessageItem';

import './MessageList.scss';

const MessageList = ({ roomId }) => {
  const messageIds = useSelector((state) => getMessageIdsByRoom(state, { roomId }));

  const messageMapper = () => messageIds.map((messageId, index, array) => (
    <MessageItem
      key={messageId}
      previousMessageId={array[index - 1]}
      messageId={messageId}
    />
  ));

  return (
    <List
      scrollTo={{
        buffer: true,
        direction: 'bottom',
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
};

MessageList.defaultProps = {
  roomId: undefined,
};
