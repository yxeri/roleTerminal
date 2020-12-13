import React from 'react';
import { arrayOf, shape, string } from 'prop-types';

import MessageInfo from '../../../sub-components/MessageInfo/MessageInfo';
import ListItem from '../../../../common/sub-components/List/ListItem/ListItem';

import './MessageItem.scss';

const MessageItem = ({ message }) => (
  <ListItem
    classNames={['MessageItem']}
    key={message.objectId}
  >
    <MessageInfo message={message} />
    <div className="text">
      {/* eslint-disable-next-line react/no-array-index-key */}
      {message.text.map((line, index) => <p key={index}>{line}</p>)}
    </div>
  </ListItem>
);

export default React.memo(MessageItem);

MessageItem.propTypes = {
  message: shape({
    objectId: string,
    text: arrayOf(string),
  }).isRequired,
};
