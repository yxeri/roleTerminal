import React from 'react';
import { useSelector } from 'react-redux';
import { string } from 'prop-types';

import { getMessages } from '../../../../redux/selectors/messages';
import List from '../../../common/sub-components/List/List';
import MessageItem from './MessageItem/MessageItem';

import './MessageList.scss';

const MessageList = ({ roomId }) => {
  const messages = useSelector((state) => getMessages(state, { roomId }));

  const messageMapper = () => messages.map((message) => (
    <MessageItem key={message.objectId} message={message} />
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
};

MessageList.defaultProps = {
  roomId: undefined,
};
