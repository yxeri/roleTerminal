import React from 'react';
import { useSelector } from 'react-redux';
import { func, string } from 'prop-types';

import { getMessagesByRoom } from '../../../../redux/selectors/messages';
import List from '../../../common/lists/List/List';
import MessageItem from './Item/MessageItem';

import './MessageList.scss';

const MessageList = ({ roomId, onDialog }) => {
  const messages = useSelector((state) => getMessagesByRoom(state, { roomId }));

  const messageMapper = () => messages.map((message) => (
    <MessageItem
      key={message.objectId}
      message={message}
      onDialog={onDialog}
    />
  ));

  return (
    <List
      large
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
  onDialog: func.isRequired,
};

MessageList.defaultProps = {
  roomId: undefined,
};
