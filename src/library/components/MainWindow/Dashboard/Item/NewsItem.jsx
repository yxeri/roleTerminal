import React from 'react';
import { arrayOf, shape, string } from 'prop-types';

import store from '../../../../redux/store';
import { changeWindowOrder } from '../../../../redux/actions/windowOrder';
import { WindowTypes } from '../../../../redux/reducers/windowOrder';
import { ReactComponent as Arrow } from '../../../../icons/arrow-right.svg';
import ListItem from '../../../common/lists/List/Item/ListItem';

const NewsItem = ({ message }) => (
  <ListItem
    key={message.objectId}
    onClick={() => store.dispatch(changeWindowOrder({ windows: [{ id: WindowTypes.NEWS, value: { type: WindowTypes.NEWS, messageId: message.objectId } }] }))}
  >
    <p>
      {message.text[0]}
      <Arrow />
    </p>
  </ListItem>
);

export default React.memo(NewsItem);

NewsItem.propTypes = {
  message: shape({
    text: arrayOf(string),
    objectId: string,
  }).isRequired,
};
