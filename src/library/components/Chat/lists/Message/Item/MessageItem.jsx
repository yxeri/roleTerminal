import React from 'react';
import {
  arrayOf,
  func,
  shape,
  string,
} from 'prop-types';

import MessageInfo from '../../../sub-components/MessageInfo/MessageInfo';
import ListItem from '../../../../common/lists/List/ListItem/ListItem';

import './MessageItem.scss';

const MessageItem = ({ message, onDialog }) => (
  <ListItem
    classNames={['MessageItem']}
    key={message.objectId}
  >

    <MessageInfo
      identityId={message.ownerAliasId || message.ownerId}
      timeCreated={message.customTimeCreated || message.timeCreated}
      onDialog={onDialog}
    />
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
  onDialog: func.isRequired,
};
