import React, { useEffect, useRef, useState } from 'react';
import {
  arrayOf, bool,
  string,
} from 'prop-types';
import { useSelector } from 'react-redux';
import { getMessageById } from '../../../../../redux/selectors/messages';
import ListItem from '../../../../common/lists/List/Item/ListItem';

import { ReactComponent as ChevronDown } from '../../../../../icons/chevron-down.svg';
import { ReactComponent as ChevronUp } from '../../../../../icons/chevron-up.svg';

import './NewsItem.scss';
import { getTimestamp } from '../../../../../redux/selectors/config';
import store from '../../../../../redux/store';
import { getIdentityOrTeamById } from '../../../../../redux/selectors/users';

const NewsItem = ({
  messageId,
  expand = false,
  classNames = [],
}) => {
  const titleRef = useRef(null);
  const [showText, setShowText] = useState(expand);
  const message = useSelector((state) => getMessageById(state, { id: messageId }));
  const identity = useSelector((state) => getIdentityOrTeamById(state, { id: message.teamId || message.ownerAliasId || message.ownerId }));

  useEffect(() => {
    setShowText(expand);
  }, [expand]);

  useEffect(() => {
    if (showText && titleRef.current) {
      titleRef.current.scrollIntoView();
    }
  }, [showText]);

  return (
    <ListItem
      elementId={`news-${messageId}`}
      onClick={() => setShowText(!showText)}
      classNames={['NewsItem'].concat(classNames, [showText ? 'expanded' : ''])}
    >
      <div
        ref={titleRef}
        className="title"
      >
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
      <div className={`text ${!showText ? 'hide' : ''}`}>
        {message.text.slice(1).map((line, index) => <p key={index}>{line}</p>)}
      </div>
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
