import React from 'react';
import { useSelector } from 'react-redux';
import { string } from 'prop-types';
import { getMessages } from '../../../redux/selectors/messages';
import MessageInfo from '../sub-components/MessageInfo';
import List from '../../common/sub-components/List';

export default function MessageList({ roomId }) {
  const messages = useSelector((state) => getMessages(state, { roomId }));

  return (
    <List
      large
      classNames={['messageList']}
    >
      {
        messages.map((message) => (
          <li key={message.objectId}>
            <MessageInfo message={message} />
            {message.text.map((line) => <p>{line}</p>)}
          </li>
        ))
      }
    </List>
  );
}

MessageList.propTypes = {
  roomId: string,
};

MessageList.defaultProps = {
  roomId: undefined,
};
