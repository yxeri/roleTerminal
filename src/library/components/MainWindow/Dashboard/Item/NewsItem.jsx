import React from 'react';
import { string } from 'prop-types';
import { useSelector } from 'react-redux';

import store from '../../../../redux/store';
import { changeWindowOrder } from '../../../../redux/actions/windowOrder';
import { WindowTypes } from '../../../../redux/reducers/windowOrder';
import { ReactComponent as Arrow } from '../../../../icons/arrow-right.svg';
import ListItem from '../../../common/lists/List/Item/ListItem';
import { getMessageById } from '../../../../redux/selectors/messages';

import './NewsItem.scss';

const NewsItem = ({ messageId }) => {
  const message = useSelector((state) => getMessageById(state, { id: messageId }));

  return (
    <ListItem
      className="DashNewsItem"
      key={message.objectId}
      onClick={() => store.dispatch(changeWindowOrder({ windows: [{ id: WindowTypes.NEWS, value: { type: WindowTypes.NEWS, messageId: message.objectId } }] }))}
    >
      <p>
        {message.text[0]}
        <Arrow />
      </p>
    </ListItem>
  );
};

export default React.memo(NewsItem);

NewsItem.propTypes = {
  messageId: string.isRequired,
};
