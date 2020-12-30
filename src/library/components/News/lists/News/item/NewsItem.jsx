import React, {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import {
  arrayOf, bool,
  string,
} from 'prop-types';
import { useSelector } from 'react-redux';

import { getMessageById } from '../../../../../redux/selectors/messages';
import ListItem from '../../../../common/lists/List/Item/ListItem';
import { getTimestamp } from '../../../../../redux/selectors/config';
import store from '../../../../../redux/store';
import { getIdentityOrTeamById } from '../../../../../redux/selectors/users';
import Image from '../../../../common/sub-components/Image/Image';

import { ReactComponent as ChevronDown } from '../../../../../icons/chevron-down.svg';
import { ReactComponent as ChevronUp } from '../../../../../icons/chevron-up.svg';

import './NewsItem.scss';

const NewsItem = ({
  messageId,
  expand = false,
  classNames = [],
}) => {
  const itemRef = useRef();
  const [showText, setShowText] = useState(false);
  const message = useSelector((state) => getMessageById(state, { id: messageId }));
  const identity = useSelector((state) => getIdentityOrTeamById(state, { id: message.teamId || message.ownerAliasId || message.ownerId }));

  useEffect(() => {
    setShowText(expand);
  }, [expand]);

  useLayoutEffect(() => {
    if (showText && itemRef.current) {
      itemRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      setTimeout(() => itemRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 300);
    }
  }, [showText]);

  return (
    <ListItem
      ref={itemRef}
      elementId={`news-${messageId}`}
      onClick={() => setShowText(!showText)}
      classNames={['NewsItem'].concat(classNames, [showText ? 'expanded' : ''])}
    >
      <div className="title">
        <p>{message.text[0]}</p>
        <p className="info">
          <span>
            {`${getTimestamp(store.getState(), { date: message.customTimeCreated || message.timeCreated }).halfDate} `}
            {getTimestamp(store.getState(), { date: message.customTimeCreated || message.timeCreated }).halfTime}
          </span>
          <span>{` By: ${identity.teamName || identity.aliasName || identity.username}`}</span>
          {!showText && <ChevronDown />}
          {showText && <ChevronUp />}
        </p>
      </div>
      {showText && message.image && message.image.thumbFileName && (
        <Image
          image={`/upload/images/${message.image.thumbFileName}`}
          fullImage={`/upload/images/${message.image.fileName}`}
          altText="pic"
          width={message.image.thumbWidth}
          height={message.image.thumbHeight}
          fullWidth={message.image.width}
          fullHeight={message.image.height}
        />
      )}
      {showText && (
        <div className="text">
          {message.text.slice(1).map((line, index) => <p key={index}>{line}</p>)}
        </div>
      )}
    </ListItem>
  );
};

export default React.memo(NewsItem);

NewsItem.propTypes = {
  classNames: arrayOf(string),
  messageId: string.isRequired,
  expand: bool,
};

NewsItem.defaultProps = {
  classNames: [],
  expand: false,
};
