import React from 'react';

import { useSelector } from 'react-redux';
import { AccessLevels } from '../../../AccessCentral';
import { ReactComponent as QR } from '../../../icons/qr-code.svg';
import {
  MessageTypes,
  postMessage
} from '../../../Messenger';
import {
  getCurrentAccessLevel,
  getIdentityOrTeamName,
  getIsAnonymous,
} from '../../../redux/selectors/users';
import { getWalletById } from '../../../redux/selectors/wallets';
import { getNewsIdsPoints } from '../../../redux/selectors/messages';
import IdentityPicker from '../../common/lists/IdentityPicker/IdentityPicker';
import List from '../../common/lists/List/List';
import ListItem from '../../common/lists/List/Item/ListItem';
import Button from '../../common/sub-components/Button/Button';
import NewsItem from './Item/NewsItem';
import { getHideMenu } from '../../../redux/selectors/interfaceConfig';
import OpenApps from '../../MenuBar/lists/OpenApps/OpenApps';
import MainList from '../../MenuBar/lists/MainList/MainList';
import Clock from '../../MenuBar/sub-components/Clock/Clock';
import { getTimestamp } from '../../../TextTools';
import { getDayModification, getYearModification } from '../../../redux/selectors/config';
import { getCurrentIdentityId } from '../../../redux/selectors/userId';

import './Dashboard.scss';

const Dashboard = () => {
  const accessLevel = useSelector(getCurrentAccessLevel);
  const identityId = useSelector(getCurrentIdentityId);
  const isAnonymous = useSelector(getIsAnonymous);
  const { name } = useSelector((state) => getIdentityOrTeamName(state, { id: identityId }));
  const wallet = useSelector((state) => getWalletById(state, { id: identityId }));
  const news = useSelector(getNewsIdsPoints);
  const hideMenu = useSelector(getHideMenu);
  const dayModification = useSelector(getDayModification);
  const yearModification = useSelector(getYearModification);
  const timestamp = getTimestamp({ date: new Date(), dayModification, yearModification });

  const newsMapper = () => {
    if (!news || news.length === 0) {
      return [<ListItem key="noNews">There are no news.</ListItem>];
    }

    return news
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
        <NewsItem key={message.objectId} messageId={message.objectId} />
      ));
  };

  return (
    <div className="Dashboard">
      {hideMenu && (
        <div className="nav">
          <MainList />
          <OpenApps />
          {window.ReactNativeWebView && (
            <Button
              type="button"
              onClick={() => postMessage({ type: MessageTypes.QR, data: {} })}
            >
              <QR />
            </Button>
          )}
          {accessLevel >= AccessLevels.STANDARD && (
            <IdentityPicker hideOnSingle={false} />
          )}
          <Clock />
        </div>
      )}
      {isAnonymous && (
        <>
          <p>Welcome!</p>
          <p>{timestamp.fullDate}</p>
          <List
            alwaysExpanded
            title="Top News"
            className="news"
          >
            {newsMapper()}
          </List>
        </>
      )}
      {!isAnonymous && (
        <>
          <p>{`Welcome, ${name}!`}</p>
          <p>{`Today's date is ${timestamp.fullDate}`}</p>
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
