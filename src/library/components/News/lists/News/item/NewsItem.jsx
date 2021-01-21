import React, {
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  bool,
  string,
} from 'prop-types';
import { useSelector } from 'react-redux';

import { getMessageById } from '../../../../../redux/selectors/messages';
import ListItem from '../../../../common/lists/List/Item/ListItem';
import { getIdentityOrTeamName } from '../../../../../redux/selectors/users';
import Image from '../../../../common/sub-components/Image/Image';
import { ReactComponent as ChevronDown } from '../../../../../icons/chevron-down.svg';
import { ReactComponent as ChevronUp } from '../../../../../icons/chevron-up.svg';
import { getDayModification, getYearModification } from '../../../../../redux/selectors/config';
import { getTimestamp } from '../../../../../TextTools';

import './NewsItem.scss';

const NewsItem = ({
  messageId,
  expand = false,
  className = '',
}) => {
  const itemRef = useRef();
  const [showText, setShowText] = useState(false);
  const message = useSelector((state) => getMessageById(state, { id: messageId }));
  const { name } = useSelector((state) => getIdentityOrTeamName(state, { id: message.ownerAliasId || message.ownerId }));
  const dayModification = useSelector(getDayModification);
  const yearModification = useSelector(getYearModification);
  const timestamp = getTimestamp({ date: message.customTimeCreated || message.timeCreated, dayModification, yearModification });

  useEffect(() => {
    setShowText(expand);
  }, [expand]);

  return (
    <ListItem
      scrollTo={showText}
      ref={itemRef}
      elementId={`news-${messageId}`}
      onClick={() => setShowText(!showText)}
      className={`NewsItem ${showText ? 'expanded' : ''} ${className}`}
    >
      <div className="title">
        <p>{message.text[0]}</p>
        <p className="info">
          <span>
            {`${timestamp.halfDate} `}
            {timestamp.halfTime}
          </span>
          <span>{` By: ${name}`}</span>
          {!showText && <ChevronDown />}
          {showText && <ChevronUp />}
        </p>
      </div>
      {showText && (
        <div className="newsContent">
          {message.image && message.image.thumbFileName && (
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
          <div className="text">
            {message.text.slice(1).map((line, index) => <p key={index}>{line}</p>)}
          </div>
        </div>
      )}
    </ListItem>
  );
};

export default React.memo(NewsItem);

NewsItem.propTypes = {
  className: string,
  messageId: string.isRequired,
  expand: bool,
};

NewsItem.defaultProps = {
  className: '',
  expand: false,
};
