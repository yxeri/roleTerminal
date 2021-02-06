import React, { useCallback } from 'react';
import { number, string } from 'prop-types';
import { useSelector } from 'react-redux';

import Window from '../common/Window/Window';
import store from '../../redux/store';
import { changeWindowOrder, removeWindow } from '../../redux/actions/windowOrder';
import { WindowTypes } from '../../redux/reducers/windowOrder';
import NewsList from './lists/News/NewsList';
import FileMenu from '../common/lists/FileMenu/FileMenu';
import { getRoomById } from '../../redux/selectors/rooms';
import { getNewsRoomId } from '../../redux/selectors/config';
import ListItem from '../common/lists/List/Item/ListItem';
import { ReactComponent as Plus } from '../../icons/plus.svg';
import { ReactComponent as NewsIcon } from '../../icons/news.svg';

import './News.scss';

const News = ({ id, messageId, index }) => {
  const newsRoom = useSelector((state) => getRoomById(state, { id: getNewsRoomId(state) }));

  const onClick = useCallback(() => {
    store.dispatch(changeWindowOrder({ windows: [{ id, value: { type: WindowTypes.NEWS, messageId } }] }));
  }, [messageId]);

  const onDone = useCallback(() => store.dispatch(removeWindow({ id })), [id]);

  const onCreateNews = useCallback(() => store.dispatch(changeWindowOrder({ windows: [{ id: WindowTypes.DIALOGCREATENEWS, value: { type: WindowTypes.DIALOGCREATENEWS } }] })), []);

  const onSettings = useCallback(() => {
    store.dispatch(changeWindowOrder({ windows: [{ id: `${WindowTypes.DIALOGAPPSETTINGS}-${id}`, value: { type: `${WindowTypes.DIALOGAPPSETTINGS}-${id}` } }] }));
  }, [id]);

  return (
    <Window
      id={id}
      index={index}
      done={onDone}
      className="News"
      title={<span>News</span>}
      onClick={onClick}
      menu={(
        <>
          <FileMenu
            menuIcon={<NewsIcon />}
            key="fileMenu"
            id={id}
            // onSettings={onSettings}
          >
            {newsRoom && (
              <ListItem
                stopPropagation
                key="createNews"
                onClick={onCreateNews}
              >
                <Plus />
                <span>New article</span>
              </ListItem>
            )}
          </FileMenu>
        </>
      )}
    >
      <NewsList messageId={messageId} />
    </Window>
  );
};

export default React.memo(News);

News.propTypes = {
  id: string.isRequired,
  messageId: string,
  index: number.isRequired,
};

News.defaultProps = {
  messageId: undefined,
};
