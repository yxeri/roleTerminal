import React from 'react';
import { useSelector } from 'react-redux';
import { string } from 'prop-types';
import { getMessages } from '../../../../redux/selectors/messages';
import MessageInfo from '../../sub-components/MessageInfo';
import List from '../../../common/sub-components/List/List';
import ListItem from '../../../common/sub-components/List/ListItem/ListItem';

import './MessageList.scss';

export default function MessageList({ roomId }) {
  const messages = useSelector((state) => getMessages(state, { roomId }));

  const messageMapper = () => messages.map((message) => (
    <ListItem
      key={message.objectId}
    >
      <MessageInfo message={message} />
      {/* eslint-disable-next-line react/no-array-index-key */}
      {message.text.map((line, index) => <p key={index}>{line}</p>)}
    </ListItem>
  ));

  return (
    <List
      large
      classNames={['messageList']}
    >
      {messageMapper()}
    </List>
  );
}

MessageList.propTypes = {
  roomId: string,
};

MessageList.defaultProps = {
  roomId: undefined,
};
