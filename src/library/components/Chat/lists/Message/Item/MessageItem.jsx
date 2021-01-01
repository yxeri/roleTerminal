import React, { useRef } from 'react';
import {
  bool,
  string,
} from 'prop-types';
import { useSelector } from 'react-redux';

import MessageInfo from './MessageInfo/MessageInfo';
import ListItem from '../../../../common/lists/List/Item/ListItem';
import { getMessageById } from '../../../../../redux/selectors/messages';
import { hasAccessTo } from '../../../../../AccessCentral';
import { getCurrentUser } from '../../../../../redux/selectors/users';
import store from '../../../../../redux/store';
import Image from '../../../../common/sub-components/Image/Image';

import './MessageItem.scss';

const MessageItem = ({
  previousMessageId,
  messageId,
  isLatest = false,
  selected = false,
}) => {
  const itemRef = useRef();
  const previousMessage = useSelector((state) => getMessageById(state, { id: previousMessageId }));
  const message = useSelector((state) => getMessageById(state, { id: messageId }));

  const { hasFullAccess } = hasAccessTo({
    objectToAccess: message,
    toAuth: getCurrentUser(store.getState()),
  });

  const shouldCollapse = () => {
    if (!previousMessage) {
      return false;
    }

    if (new Date(message.lastUpdated).getTime() - 900000 > new Date(previousMessage.lastUpdated).getTime()) {
      return false;
    }

    if ((previousMessage.ownerAliasId && message.ownerAliasId) && previousMessage.ownerAliasId === message.ownerAliasId) {
      return true;
    }

    return (!previousMessage.ownerAliasId && !message.ownerAliasId) && previousMessage.ownerId === message.ownerId;
  };

  return (
    <ListItem
      scrollTo={selected || isLatest}
      ref={itemRef}
      className={`MessageItem ${hasFullAccess ? 'clickable' : ''}`}
      key={messageId}
    >
      {!shouldCollapse() && (
        <MessageInfo
          key="msgInfo"
          identityId={message.ownerAliasId || message.ownerId}
          timeCreated={message.customTimeCreated || message.timeCreated}
        />
      )}
      <div className="text">
        {/* eslint-disable-next-line react/no-array-index-key */}
        {message.text.map((line, index) => <p key={index}>{line}</p>)}
        {message.image && message.image.thumbFileName && (
          <Image
            scrollTo
            key={message.image.thumbFileName}
            image={`/upload/images/${message.image.thumbFileName}`}
            altText="pic"
            width={message.image.thumbWidth}
            height={message.image.thumbHeight}
            fullImage={`/upload/images/${message.image.fileName}`}
            fullWidth={message.image.width}
            fullHeight={message.image.height}
          />
        )}
      </div>
    </ListItem>
  );
};

export default React.memo(MessageItem);

MessageItem.propTypes = {
  previousMessageId: string,
  messageId: string.isRequired,
  selected: bool,
  isLatest: bool,
};

MessageItem.defaultProps = {
  previousMessageId: undefined,
  selected: false,
  isLatest: false,
};
