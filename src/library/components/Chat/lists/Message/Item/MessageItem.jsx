import React from 'react';
import {
  func,
  string,
} from 'prop-types';
import { useSelector } from 'react-redux';

import MessageInfo from '../../../sub-components/MessageInfo/MessageInfo';
import ListItem from '../../../../common/lists/List/Item/ListItem';
import { getMessageById } from '../../../../../redux/selectors/messages';

import './MessageItem.scss';

const MessageItem = ({ messageId, onDialog }) => {
  const message = useSelector((state) => getMessageById(state, { id: messageId }));

  return (
    <ListItem
      classNames={['MessageItem']}
      key={messageId}
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
};

export default React.memo(MessageItem);

MessageItem.propTypes = {
  messageId: string.isRequired,
  onDialog: func.isRequired,
};
