import React from 'react';

import './Dashboard.scss';
import { useSelector } from 'react-redux';
import { getCurrentUser } from '../../../redux/selectors/users';
import { getWalletById } from '../../../redux/selectors/wallets';
import { getNews } from '../../../redux/selectors/messages';
import List from '../../common/lists/List/List';
import ListItem from '../../common/lists/List/Item/ListItem';
import { getTimestamp } from '../../../redux/selectors/config';
import store from '../../../redux/store';
import NewsItem from './Item/NewsItem';
import { getHideMenu } from '../../../redux/selectors/interfaceConfig';
import OpenApps from '../../MenuBar/lists/OpenApps/OpenApps';
import MainList from '../../MenuBar/lists/MainList';
import Clock from '../../MenuBar/sub-components/Clock/Clock';

const Dashboard = () => {
  const user = useSelector(getCurrentUser);
  const wallet = useSelector((state) => getWalletById(state, { id: user.objectId }));
  const news = useSelector(getNews);
  const hideMenu = useSelector(getHideMenu);

  const newsMapper = () => {
    if (!news || news.length === 0) {
      return [<ListItem key="noNews">There are no news.</ListItem>];
    }

    return [...news]
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
      .slice(0, 5)
      .map((message) => (
        <NewsItem key={message.objectId} message={message} />
      ));
  };

  return (
    <div className="Dashboard">
      {hideMenu && (
        <div className="nav">
          <MainList />
          <OpenApps />
          <Clock />
        </div>
      )}
      {user.isAnonymous && (
        <>
          <p>Welcome!</p>
          <p>{getTimestamp(store.getState(), { date: new Date() }).fullDate}</p>
          <List
            alwaysExpanded
            title="Top News"
            className="news"
          >
            {newsMapper()}
          </List>
        </>
      )}
      {!user.isAnonymous && (
        <>
          <p>{`Welcome, ${user.username}!`}</p>
          <p>{`Today's date is ${getTimestamp(store.getState(), { date: new Date() }).fullDate}`}</p>
          {wallet && (
            <p>{`You have ${wallet.amount} in your wallet.`}</p>
          )}
          <List
            alwaysExpanded
            title="News"
            className="news"
          >
            {newsMapper()}
          </List>
        </>
      )}
    </div>
  );
};

export default React.memo(Dashboard);
