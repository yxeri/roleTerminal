import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { string } from 'prop-types';

import List from '../../../common/lists/List/List';
import { getNewsIdsPoints } from '../../../../redux/selectors/messages';
import NewsItem from './item/NewsItem';
import ListItem from '../../../common/lists/List/Item/ListItem';

import './NewsList.scss';

const NewsList = ({ messageId }) => {
  const listRef = useRef(null);
  const news = useSelector(getNewsIdsPoints);

  useEffect(() => {
    if (messageId && listRef.current) {
      const listItem = listRef.current.querySelector(`#news-${messageId}`);

      if (listItem) {
        listItem.scrollIntoView();
      }
    }
  }, [messageId]);

  const itemMapper = () => [...news]
    .reverse()
    .map((newsMessage) => (
      <NewsItem
        expand={newsMessage.objectId === messageId}
        key={newsMessage.objectId}
        messageId={newsMessage.objectId}
      />
    ));
  const topMapper = () => [...news]
    .reverse()
    .filter((message) => message.points && message.points > 0)
    .sort((a, b) => {
      const valueA = a.points;
      const valueB = b.points;

      if (valueA > valueB) {
        return -1;
      }

      if (valueA < valueB) {
        return 1;
      }

      return 0;
    })
    .slice(0, 3)
    .map((newsMessage) => (
      <NewsItem
        key={`top-${newsMessage.objectId}`}
        messageId={newsMessage.objectId}
        classNames={['topNews']}
      />
    ));

  return (
    <List
      ref={listRef}
      scrollTo={{
        buffer: true,
        direction: 'top',
      }}
      classNames={['NewsList']}
    >
      {news.length === 0 && (
        <ListItem key="noNews"><p>There are no news</p></ListItem>
      )}
      {topMapper()}
      {itemMapper()}
    </List>
  );
};

export default React.memo(NewsList);

NewsList.propTypes = {
  messageId: string,
};

NewsList.defaultProps = {
  messageId: undefined,
};
