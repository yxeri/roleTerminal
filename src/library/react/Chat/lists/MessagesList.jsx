import React from 'react';
import { useSelector } from 'react-redux';
import { getMessages } from '../../redux/selectors/messages';
import MessageInfo from '../sub-components/MessageInfo';

const MessageList = () => {
  const messages = useSelector(getMessages);

  return(
    <div className="messagesList">
      <ul>
        {messages.map((message) => {
          return (
            <li key={message.objectId}>
              <MessageInfo message={message} />
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default MessageList;
